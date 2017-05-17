import django_filters

from reqs.models import Agency, AgencyGroup, Policy, Requirement, Topic


class AgencyFilter(django_filters.FilterSet):
    class Meta:
        model = Agency
        fields = {
            'id': ('exact', 'in'),
            'name': ('exact', 'in', 'icontains'),
            'abbr': ('exact', 'in'),
        }


class AgencyGroupFilter(django_filters.FilterSet):
    class Meta:
        model = AgencyGroup
        fields = {
            'id': ('exact', 'in'),
            'name': ('exact', 'in', 'icontains'),
        }


class PolicyFilter(django_filters.FilterSet):
    class Meta:
        model = Policy
        fields = {
            'id': ('exact', 'in'),
            'policy_number': ('exact', 'gt', 'gte', 'lt', 'lte', 'in',
                              'range'),
            'title': ('exact', 'icontains'),
            'uri': ('exact', 'icontains'),
            'omb_policy_id': ('exact', 'icontains'),
            'policy_type': ('exact', 'in'),
            'issuance': ('exact', 'gt', 'gte', 'lt', 'lte', 'range', 'year',
                         'month', 'day'),
            'sunset': ('exact', 'gt', 'gte', 'lt', 'lte', 'range', 'year',
                       'month', 'day', 'isnull'),
        }


class RequirementFilter(django_filters.FilterSet):
    class Meta:
        model = Requirement
        fields = {
            'req_id': ('exact',),
            'issuing_body': ('exact', 'icontains'),
            'policy_section': ('exact', 'icontains'),
            'policy_sub_section': ('exact', 'icontains'),
            'req_text': ('icontains',),
            'verb': ('icontains',),
            'impacted_entity': ('icontains',),
            'req_deadline': ('icontains',),
            'citation': ('icontains',),
            'policy_id': ('exact', 'in'),
        }


class TopicFilter(django_filters.FilterSet):
    class Meta:
        model = Topic
        fields = {
            'id': ('exact', 'in'),
            'name': ('exact', 'icontains', 'in'),
        }
