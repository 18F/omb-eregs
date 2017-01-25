from enum import Enum, unique

from django.db import models


@unique
class PolicyTypes(Enum):
    memorandum = 'Memorandum'
    circular = 'Circular'
    strategy = 'Strategy'
    review = 'Policy Review'


class Requirement(models.Model):
    policy_number = models.CharField(max_length=16)
    policy_title = models.CharField(max_length=1024)
    uri_policy_id = models.CharField(max_length=256)
    omb_policy_id = models.CharField(max_length=16, blank=True)
    policy_type = models.CharField(
        max_length=32, choices=[(e.name, e.value) for e in PolicyTypes])
    policy_issuance_year = models.CharField(max_length=32)
    policy_subset = models.CharField(max_length=32)
    req_id = models.CharField(max_length=16)
    issuing_body = models.CharField(max_length=512)
    policy_section = models.CharField(max_length=1024)
    policy_sub_section = models.CharField(max_length=1024)
    req_text = models.TextField()
    verb = models.CharField(max_length=1024)
    impacted_entity = models.CharField(max_length=1024)
    req_deadline = models.CharField(max_length=128)
    citation = models.CharField(max_length=1024)
    aquisition = models.BooleanField(default=False)
    human_capital = models.BooleanField(default=False)
    cloud = models.BooleanField(default=False)
    data_centers = models.BooleanField(default=False)
    cybersecurity = models.BooleanField(default=False)
    privacy = models.BooleanField(default=False)
    shared_services = models.BooleanField(default=False)
    it_project_management = models.BooleanField(default=False)
    software = models.BooleanField(default=False)
    digital_services = models.BooleanField(default=False)
    mobile = models.BooleanField(default=False)
    hardware = models.BooleanField(default=False)
    transparency = models.BooleanField(default=False)
    statistics = models.BooleanField(default=False)
    customer_services = models.BooleanField(default=False)
    governance = models.BooleanField(default=False)
    financial_systems = models.BooleanField(default=False)
    budget = models.BooleanField(default=False)
    governance_org_structure = models.BooleanField(default=False)
    governance_implementation = models.BooleanField(default=False)
    data_management = models.BooleanField(default=False)
    definitions = models.BooleanField(default=False)
    reporting = models.BooleanField(default=False)
    other_keywords = models.CharField(max_length=1024)

    def __str__(self):
        text = self.req_text[:40]
        if len(self.req_text) > 40:
            text += '...'
        return 'Requirement {0}:{1}'.format(self.req_id, text)
