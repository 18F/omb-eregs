from rest_framework import routers

from reqs.views.policies import PolicyViewSet
from reqs.views.requirements import RequirementViewSet
from reqs.views.simple import TopicViewSet

router = routers.DefaultRouter()
router.register(r'topics', TopicViewSet)
router.register(r'policies', PolicyViewSet)
router.register(r'requirements', RequirementViewSet)
