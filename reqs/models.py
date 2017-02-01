from enum import Enum, unique

from django.db import models
from django.utils.translation import ugettext_lazy


@unique
class PolicyTypes(Enum):
    memorandum = 'Memorandum'
    circular = 'Circular'
    strategy = 'Strategy'
    review = 'Policy Review'


class Policy(models.Model):
    class Meta:
        verbose_name_plural = ugettext_lazy('Policies')
        ordering = ['policy_number']

    policy_number = models.IntegerField(unique=True)
    title = models.CharField(max_length=1024)
    uri = models.CharField(max_length=256)
    omb_policy_id = models.CharField(max_length=16, blank=True)
    policy_type = models.CharField(
        max_length=32, choices=[(e.name, e.value) for e in PolicyTypes])
    issuance = models.DateField()
    sunset = models.DateField(blank=True, null=True)

    def __str__(self):
        text = self.title[:40]
        if len(self.title) > 40:
            text += '...'
        return '{0}: {1}'.format(self.policy_number, text)


class Requirement(models.Model):
    class Meta:
        ordering = ['req_id']

    policy = models.ForeignKey(
        Policy, on_delete=models.CASCADE, blank=True, null=True)
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
        return '{0}: {1}'.format(self.req_id, text)
