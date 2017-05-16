from enum import Enum, unique

from django.db import models
from django.utils.translation import ugettext_lazy
from taggit.managers import TaggableManager
from taggit.models import ItemBase, TagBase


class Agency(models.Model):
    name = models.CharField(max_length=256)
    abbr = models.CharField(max_length=64, blank=True)
    omb_agency_code = models.CharField(max_length=8, blank=True)
    nonpublic = models.BooleanField(default=False)


class AgencyGroup(models.Model):
    name = models.CharField(max_length=256)
    slug = models.CharField(max_length=64, blank=True)
    agencies = models.ManyToManyField(Agency, related_name='groups',
                                      blank=True)


# Custom class for name-spacing
class Topic(TagBase):
    class Meta:
        ordering = ['name']
        verbose_name = ugettext_lazy('Topic')
        verbose_name_plural = ugettext_lazy('Topics')

    @property
    def requirements(self):
        """Taggit isn't creating a backwards relation as we'd expect, so
        simulate it here"""
        return Requirement.objects.filter(topics=self.pk)


class TopicConnect(ItemBase):
    tag = models.ForeignKey(Topic, on_delete=models.CASCADE,
                            related_name='topic')
    content_object = models.ForeignKey('Requirement', on_delete=models.CASCADE)

    @classmethod
    def tags_for(cls, model, instance=None, **extra_filters):
        kwargs = dict(extra_filters)
        key = '{0}__content_object'.format(cls.tag_relname())
        if instance is not None:
            kwargs[key] = instance.pk
        else:
            kwargs[key + '__isnull'] = False
        return Topic.objects.filter(**kwargs).distinct()


@unique
class PolicyTypes(Enum):
    circular = 'Circular'
    executive = 'Executive Order'
    guidance = 'Guidance'
    hspd = 'HSPD'
    law = 'Law'
    memorandum = 'Memorandum'
    national_action = 'National Action Plan'
    plan = 'Plan'
    ppd = 'PPD'
    review = 'Policy Review'
    standards = 'Standards'
    strategy = 'Strategy'


class Policy(models.Model):
    class Meta:
        verbose_name_plural = ugettext_lazy('Policies')
        ordering = ['policy_number']

    policy_number = models.IntegerField(unique=True)
    title = models.CharField(max_length=1024)
    uri = models.CharField(max_length=256)
    omb_policy_id = models.CharField(max_length=64, blank=True)
    policy_type = models.CharField(
        max_length=32, choices=[(e.name, e.value) for e in PolicyTypes],
        blank=True
    )
    issuance = models.DateField()
    sunset = models.DateField(blank=True, null=True)
    policy_status = models.CharField(max_length=256, blank=True)
    document_source = models.FileField(blank=True)
    nonpublic = models.BooleanField(default=False)

    @property
    def title_with_number(self):
        if self.omb_policy_id:
            return '{0}: {1}'.format(self.omb_policy_id, self.title)
        return self.title

    @property
    def original_url(self):
        if self.document_source:
            return self.document_source.url
        return self.uri

    @property
    def requirements_with_topics(self):
        return self.requirements.prefetch_related('topics').distinct()

    def __str__(self):
        text = self.title_with_number
        if len(text) > 100:
            text = text[:100] + '...'
        return '({0}) {1}'.format(self.policy_number, text)


class Requirement(models.Model):
    class Meta:
        ordering = ['req_id']

    policy = models.ForeignKey(Policy, on_delete=models.CASCADE,
                               related_name='requirements')
    req_id = models.CharField(max_length=16, unique=True)
    issuing_body = models.CharField(max_length=512)
    policy_section = models.CharField(max_length=1024, blank=True)
    policy_sub_section = models.CharField(max_length=1024, blank=True)
    req_text = models.TextField()
    verb = models.CharField(max_length=1024, blank=True)
    impacted_entity = models.CharField(max_length=8192, blank=True)
    req_deadline = models.CharField(max_length=512, blank=True)
    citation = models.CharField(max_length=1024, blank=True)
    topics = TaggableManager(
        through=TopicConnect,
        verbose_name=ugettext_lazy('Topics'),
        blank=True
    )
    req_status = models.CharField(max_length=32, blank=True)
    precedent = models.CharField(max_length=1024, blank=True)
    related_reqs = models.CharField(max_length=1024, blank=True)
    omb_data_collection = models.CharField(max_length=1024, blank=True)
    agencies = models.ManyToManyField(Agency, blank=True)
    agency_groups = models.ManyToManyField(AgencyGroup, blank=True)

    def __str__(self):
        text = self.req_text[:40]
        if len(self.req_text) > 40:
            text += '...'
        return '{0}: {1}'.format(self.req_id, text)

    @property
    def prefetched_topic_names(self):
        """Using self.topics.names will result in a new query. That's very
        inefficient if we've already prefetched that data."""
        return [topic.name for topic in self.topics.all()]
