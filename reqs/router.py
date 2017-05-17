from rest_framework import routers

from reqs.views.policies import PolicyViewSet
from reqs.views.requirements import RequirementViewSet
from reqs.views.simple import AgencyGroupViewSet, AgencyViewSet, TopicViewSet

router = routers.DefaultRouter()
router.register(r'agencies', AgencyViewSet)
router.register(r'agency-groups', AgencyGroupViewSet)
router.register(r'policies', PolicyViewSet)
router.register(r'requirements', RequirementViewSet)
router.register(r'topics', TopicViewSet)
