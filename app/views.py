from django.shortcuts import render, redirect, get_object_or_404
from django.core.urlresolvers import reverse
from django.contrib.auth.models import User
from django.contrib.auth import login as django_login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages

from .models import (
    Todo
)


def home(request):
	"""
	This function to render landing page. That first time hit by user.
	"""
	return render(request, 'app/index.html', {})

