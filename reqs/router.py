from rest_framework import routers

from reqs.views import KeywordViewSet, PolicyViewSet, RequirementViewSet

router = routers.DefaultRouter()
router.register(r'keywords', KeywordViewSet)
router.register(r'policies', PolicyViewSet)
router.register(r'requirements', RequirementViewSet)
