from django.contrib.auth.models import User

from rest_framework import serializers

from .models import (
    Todo,
    Attachment
)


class UserSerializer(serializers.ModelSerializer):
    """
    User serializer
    """
    class Meta:
        model = User
        fields = ('id', 'username', 'email', "password", 'is_superuser')
        write_only_fields = ('password', )
        read_only_fields = ('id', 'is_superuser')


class TodoSerializer(serializers.ModelSerializer):
    """
    Todo serializer
    """
    owner = serializers.SerializerMethodField(read_only=True)
    owner_id = serializers.SerializerMethodField(read_only=True)
    created_at = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Todo
        exclude = ()

    def get_owner(self, obj):
        return obj.owner.username

    def get_owner_id(self, obj):
        return obj.owner.id

    def get_created_at(self, obj):
        created = obj.created_at
        return '{:%d-%m-%Y %H:%m}'.format(created)


class AttachmentSerializer(serializers.ModelSerializer):
    """
    Attachment serializer
    """
    class Meta:
        model = Attachment
        exclude = ('created_at', 'todo', )
        read_only_fields = ('id', 'filename', )
