from django.conf.urls import url, include
from rest_framework import routers

from .api_views import (
	UserViewSet,
	TodoViewSet,
	current_user,
	register_user
)

router = routers.DefaultRouter()
router.register('user', UserViewSet, 'user')
router.register('todo', TodoViewSet, 'user')


urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^profile/$', current_user),
    url(r'^register/$', register_user)
]
