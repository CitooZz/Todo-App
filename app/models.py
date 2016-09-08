from __future__ import unicode_literals

from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

import uuid


class Todo(models.Model):
    """
    This is todo model
    """
    title = models.CharField(max_length=100)
    owner = models.ForeignKey(User, related_name="todos")
    description = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

    def __unicode__(self):
        return self.title


def upload_path(instance, filename):
    """
    This is method to generate attachment path. We use uuid4 to generate unique id.
    """
    path = 'files/{user}/file-{filename}.{extension}'.format(
        user=instance.todo.owner.id, filename=str(uuid.uuid4()), extension=filename.split('.')[-1])

    return path


class Attachment(models.Model):
    """
    This is attachment model
    """
    todo = models.ForeignKey(Todo, related_name='attachments')
    filename = models.CharField(max_length=100)
    file = models.FileField(upload_to=upload_path)
    created_at = models.DateTimeField(default=timezone.now)

    def delete(self, *args, **kwargs):
        """
        We override delete method to make real file deleted from the system. Not only deleted from DB.
        """
        self.file.delete()
        super(Attachment, self).delete(*args, **kwargs)
