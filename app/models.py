from __future__ import unicode_literals

from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

import uuid


class Todo(models.Model):
    title = models.CharField(max_length=100)
    owner = models.ForeignKey(User, related_name="todos")
    description = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)


def upload_path(instance, filename):
    path = 'files/{user}/file-{filename}.{extension}'.format(
        user=instance.todo.owner.id, filename=str(uuid.uuid4()), extension=filename.split('.')[-1])

    return path


class Attachment(models.Model):
    todo = models.ForeignKey(Todo, related_name='attachments')
    filename = models.CharField(max_length=100)
    file = models.FileField(upload_to=upload_path)
    created_at = models.DateTimeField(default=timezone.now)

    def delete(self, *args, **kwargs):
        self.file.delete()
        super(Attachment, self).delete(*args, **kwargs)
