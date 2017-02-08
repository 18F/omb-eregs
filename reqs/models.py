from enum import Enum, unique

from django.db import models
from django.utils.translation import ugettext_lazy
from taggit.models import ItemBase, TagBase
from taggit_autosuggest.managers import TaggableManager


# Custom class for name-spacing
class Keyword(TagBase):
    class Meta:
        verbose_name = ugettext_lazy('Keyword')
        verbose_name_plural = ugettext_lazy('Keywords')


class KeywordConnect(ItemBase):
    tag = models.ForeignKey(Keyword, on_delete=models.CASCADE,
                            related_name='keyword')
    content_object = models.ForeignKey('Requirement', on_delete=models.CASCADE)

    @classmethod
    def tags_for(cls, model, instance=None, **extra_filters):
        kwargs = dict(extra_filters)
        key = '{0}__content_object'.format(cls.tag_relname())
        if instance is not None:
            kwargs[key] = instance.pk
        else:
            kwargs[key + '__isnull'] = False
        return Keyword.objects.filter(**kwargs).distinct()



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
    keywords = TaggableManager(
        through=KeywordConnect,
        verbose_name=ugettext_lazy('Keywords'),
        blank=True
    )

    def __str__(self):
        text = self.req_text[:40]
        if len(self.req_text) > 40:
            text += '...'
        return '{0}: {1}'.format(self.req_id, text)
