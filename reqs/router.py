from rest_framework import routers

from reqs.views import PolicyViewSet, RequirementViewSet, TopicViewSet

router = routers.DefaultRouter()
router.register(r'topics', TopicViewSet)
router.register(r'policies', PolicyViewSet)
router.register(r'requirements', RequirementViewSet)
