from rest_framework import permissions


class TodoAccessPermission(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        """
        This is object level permission to only allow owner or admin todo CRUD.
        """

        if not request.user.is_superuser and request.user != obj.owner:
            return False

        return True
