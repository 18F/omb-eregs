from datetime import date
from unittest.mock import Mock

import pytest
from django.core.management import call_command
from model_mommy import mommy

from reqs.management.commands import import_reqs
from reqs.models import (Keyword, KeywordConnect, Policy, PolicyTypes,
                         Requirement)


@pytest.fixture
def csv_file(tmpdir):
    csv_file_obj = tmpdir.join('some_file.csv')
    csv_file_obj.write("""
policyNumber,policyTitle,uriPolicyId,ombPolicyId,policyType,policyIssuanceYear,policySunset,reqId,issuingBody,policySection,policySubSection,reqText,verb,Impacted Entity,reqDeadline,citation,Acquisition/Contracts (Keywords),Human Capital (Keywords),Cloud (Keywords),Data Centers (Keywords),Cybersecurity (Keywords),Privacy (Keywords),Shared Services (Keywords),IT Project Management (Keywords),Software (Keywords),Digital Services (Keywords),Mobile (Keywords),Hardware/Government Furnished Equipment (GFE) (Keywords),"IT Transparency (Open Data, FOIA, Public Records, etc.) (Keywords)",Agency Statistics (Keywords),Customer Services (Keywords),Governance (Keywords),Financial Systems (Keywords),Budget (Keywords),Governance - Org Structure (Keywords),Governance - Implementation (Keywords),Data Management/Standards (Keywords),Definitions (Keywords),Reporting (Keywords),Other (Keywords)
1,25 Point Implementation Plan To Reform Federal Information Technology Management,https://www.whitehouse.gov/sites/default/files/omb/assets/egov_docs/25-point-implementation-plan-to-reform-federal-it.pdf,NA,Strategy,12/9/2010,NA,1.15,"Office of the Federal Chief Information Officer, OMB",PART II: EFFECTIVELY MANAGING LARGE-SCALE IT PROGRAMS,NA,"Moving forward, Federal IT programs must be structured to deploy working business functionality in release cycles no longer than 12 months, and, ideally, less than six months, with initial deployment to end users no later than 18 months after the program begins.",Must,All CFO-Act Agencies,NA,NA,,,,,,,,,x,,,,,,,,,,,,,,,Software Development Lifecycle/Agile
21,Data Center Optimization Initiative (DCOI),https://www.whitehouse.gov/sites/default/files/omb/memoranda/2016/m_16_19_1.pdf,M-16-19,M-Memorandum,8/1/2016,9/30/2018,21.44,"Office of the Federal Chief Information Officer, OMB",Metric Target Values,Goal 2: Cost Savings and Avoidance,"Within 30 days after publication of this document, OMB OFCIO will set individual cost savings and cost avoidance goals for each agency.",Will,OMB OFCIO,Within 30 days,NA,,,,,,,,,,,,,X,,,,X,,X,,,,,
""".strip())    # noqa
    yield csv_file_obj


@pytest.mark.django_db
def test_imports_correctly(csv_file):
    call_command('import_reqs', str(csv_file))

    reqs = list(Requirement.objects.order_by('req_id'))
    assert len(reqs) == 2
    # Spot checks
    assert reqs[0].policy.policy_number == 1
    assert reqs[0].policy.omb_policy_id == ''
    assert reqs[0].policy.policy_type == 'Strategy'
    assert reqs[0].policy.issuance == date(2010, 12, 9)
    assert reqs[0].policy.sunset is None
    assert reqs[0].req_text == (
        "Moving forward, Federal IT programs must be structured to deploy "
        "working business functionality in release cycles no longer than 12 "
        "months, and, ideally, less than six months, with initial deployment "
        "to end users no later than 18 months after the program begins.")
    assert reqs[0].impacted_entity == 'All CFO-Act Agencies'
    assert set(reqs[0].keywords.names()) == {
        'Software', 'Software Development Lifecycle/Agile'}

    assert reqs[1].policy.title == 'Data Center Optimization Initiative (DCOI)'
    assert reqs[1].policy.policy_type == 'Memorandum'
    assert reqs[1].policy.sunset == date(2018, 9, 30)
    assert reqs[1].req_id == '21.44'
    assert reqs[1].verb == 'Will'
    assert reqs[1].req_deadline == 'Within 30 days'
    assert set(reqs[1].keywords.names()) == {
        'Governance - Org Structure', 'Financial Systems',
        'IT Transparency (Open Data, FOIA, Public Records, etc.)'}


@pytest.mark.django_db
def test_imports_twice(csv_file):
    """Importing the same file twice won't change the object counts"""
    call_command('import_reqs', str(csv_file))
    assert Keyword.objects.count() == 5
    assert KeywordConnect.objects.count() == 5
    assert Policy.objects.count() == 2
    assert Requirement.objects.count() == 2

    call_command('import_reqs', str(csv_file))
    assert Keyword.objects.count() == 5
    assert KeywordConnect.objects.count() == 5
    assert Policy.objects.count() == 2
    assert Requirement.objects.count() == 2


@pytest.mark.parametrize('text,result', [
    ('some text; here', ['some text', 'here']),
    ('a 1; b 2; c 3', ['a 1', 'b 2', 'c 3']),
    ('a 1, b 2, c 3', ['a 1', 'b 2', 'c 3']),
    ('a 1; b 2, c 3', ['a 1', 'b 2, c 3']),
])
def test_priority_split(text, result):
    assert import_reqs.priority_split(text, ';', ',') == result


@pytest.mark.django_db
def test_policy_from_row():
    row = {'policyNumber': '123', 'policyTitle': 'title 1',
           'uriPolicyId': 'http://example.com/a', 'ombPolicyId': 'policy',
           'policyType': 'Memo', 'policyIssuanceYear': '12/20/2001',
           'policySunset': 'NA'}
    policy_proc = import_reqs.PolicyProcessor()
    policy = policy_proc.from_row(row)
    assert policy.policy_number == 123
    assert policy.title == 'title 1'
    assert policy.uri == 'http://example.com/a'
    assert policy.omb_policy_id == 'policy'
    assert PolicyTypes(policy.policy_type) == PolicyTypes.memorandum
    assert policy.issuance == date(2001, 12, 20)
    assert policy.sunset is None
    assert {123: policy} == policy_proc.policies


@pytest.mark.django_db
def test_policy_from_row_duplicate():
    assert Policy.objects.count() == 0
    row = {'policyNumber': '123', 'policyTitle': 'title 1',
           'uriPolicyId': 'http://example.com/a', 'ombPolicyId': 'policy',
           'policyType': 'Memo', 'policyIssuanceYear': '12/20/2001',
           'policySunset': 'NA'}
    import_reqs.PolicyProcessor().from_row(row)
    assert Policy.objects.count() == 1
    assert Policy.objects.get(policy_number=123).title == 'title 1'

    row['policyTitle'] = 'title 2'
    import_reqs.PolicyProcessor().from_row(row)
    assert Policy.objects.count() == 1
    assert Policy.objects.get(policy_number=123).title == 'title 2'


@pytest.mark.django_db
def test_repeat_row():
    """If the same requirement id is present twice, raise an exception"""
    assert Requirement.objects.count() == 0

    processor = import_reqs.RowProcessor()
    processor.policies = Mock(**{'from_row.return_value': mommy.make(Policy)})
    row = {'reqId': '13.37', 'issuingBody': 'body', 'policySection': 'None',
           'policySubSection': 'None', 'reqText': 'texttexttext',
           'verb': 'shall', 'Impacted Entity': 'something',
           'reqDeadline': 'N/A', 'citation': 'N/A'}
    processor.add(row)
    assert Requirement.objects.count() == 1
    assert Requirement.objects.first().issuing_body == 'body'

    with pytest.raises(ValueError):
        processor.add(row)

    row['issuingBody'] = 'body2'
    processor2 = import_reqs.RowProcessor()
    processor2.policies = processor.policies
    # Different processor, so we don't raise an exception, we just modify the
    # existing entry
    processor2.add(row)
    assert Requirement.objects.count() == 1
    assert Requirement.objects.first().issuing_body == 'body2'
