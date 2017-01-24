import pytest
from django.core.management import call_command

from reqs.models import Requirement


header = """
policyNumber,policyTitle,uriPolicyId,ombPolicyId,policyType,policyIssuanceYear,policySunset,reqId,issuingBody,policySection,policySubSection,reqText,verb,Impacted Entity,reqDeadline,citation,Acquisition/Contracts (Keywords),Human Capital (Keywords),Cloud (Keywords),Data Centers (Keywords),Cybersecurity (Keywords),Privacy (Keywords),Shared Services (Keywords),IT Project Management (Keywords),Software (Keywords),Digital Services (Keywords),Mobile (Keywords),Hardware/Government Furnished Equipment (GFE) (Keywords),"IT Transparency (Open Data, FOIA, Public Records, etc.) (Keywords)",Agency Statistics (Keywords),Customer Services (Keywords),Governance (Keywords),Financial Systems (Keywords),Budget (Keywords),Governance - Org Structure (Keywords),Governance - Implementation (Keywords),Data Management/Standards (Keywords),Definitions (Keywords),Reporting (Keywords),Other (Keywords)
""".strip()  # noqa


@pytest.mark.django_db
def test_imports_correctly(tmpdir):
    csv_file = tmpdir.join('some_file.csv')
    csv_file.write(header + "\n" + """
1,25 Point Implementation Plan To Reform Federal Information Technology Management,https://www.whitehouse.gov/sites/default/files/omb/assets/egov_docs/25-point-implementation-plan-to-reform-federal-it.pdf,NA,Strategy,12/9/2010,NA,1.15,"Office of the Federal Chief Information Officer, OMB",PART II: EFFECTIVELY MANAGING LARGE-SCALE IT PROGRAMS,NA,"Moving forward, Federal IT programs must be structured to deploy working business functionality in release cycles no longer than 12 months, and, ideally, less than six months, with initial deployment to end users no later than 18 months after the program begins.",Must,All CFO-Act Agencies,NA,NA,,,,,,,,,x,,,,,,,,,,,,,,,Software Development Lifecycle/Agile
21,Data Center Optimization Initiative (DCOI),https://www.whitehouse.gov/sites/default/files/omb/memoranda/2016/m_16_19_1.pdf,M-16-19,M-Memorandum,8/1/2016,9/30/2018,21.44,"Office of the Federal Chief Information Officer, OMB",Metric Target Values,Goal 2: Cost Savings and Avoidance,"Within 30 days after publication of this document, OMB OFCIO will set individual cost savings and cost avoidance goals for each agency.",Will,OMB OFCIO,Within 30 days,NA,,,,,,,,,,,,,X,,,,X,,X,,,,,
        """.strip())    # noqa
    call_command('import_reqs', str(csv_file))

    reqs = list(Requirement.objects.order_by('policy_number'))
    assert len(reqs) == 2
    # Spot checks
    assert reqs[0].policy_number == '1'
    assert reqs[0].omb_policy_id == 'NA'  # @TODO
    assert reqs[0].policy_issuance_year == '12/9/2010'    # @TODO
    assert reqs[0].req_text == (
        "Moving forward, Federal IT programs must be structured to deploy "
        "working business functionality in release cycles no longer than 12 "
        "months, and, ideally, less than six months, with initial deployment "
        "to end users no later than 18 months after the program begins.")
    assert reqs[0].impacted_entity == 'All CFO-Act Agencies'
    assert not reqs[0].aquisition
    assert reqs[0].software
    assert reqs[0].other_keywords == 'Software Development Lifecycle/Agile'

    assert reqs[1].policy_title == 'Data Center Optimization Initiative (DCOI)'
    assert reqs[1].req_id == '21.44'
    assert reqs[1].verb == 'Will'
    assert reqs[1].req_deadline == 'Within 30 days'
