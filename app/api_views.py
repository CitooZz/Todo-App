from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.decorators import detail_route, list_route, api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status

from django.contrib.auth.models import User

from .models import (
    Todo,
    Attachment
)

from .serializers import (
    UserSerializer,
    TodoSerializer,
    AttachmentSerializer
)

from .permissions import (
    TodoAccessPermission
)


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.all()
    permission_classes = (IsAuthenticated, IsAdminUser)

    def list(self, request, *args, **kwargs):
        """
        Get user list API. Only admin can use this API endpoint.
        """
        instance = self.get_queryset()
        serializer = self.get_serializer(instance, many=True)

        return Response(serializer.data)

    @detail_route(['GET'])
    def todos(self, request, pk):
        """
        Get user todo API. This endpoint used in admin area. Only admin can use this API endpoint.
        """
        user = self.get_object()

        return Response(TodoSerializer(user.todos.all(), many=True).data)


class TodoViewSet(viewsets.ModelViewSet):
    serializer_class = TodoSerializer
    queryset = Todo.objects.all()
    permission_classes = (IsAuthenticated, TodoAccessPermission)

    def get_serializer_class(self):
        """
        This function is to set serializer depend on the action (AttachmentSerializer or TodoSerializer)
        """

        if self.action in ['add_attachment', 'delete_attachment']:
            return AttachmentSerializer
        else:
            return self.serializer_class

    def perform_create(self, serializer):
        """
        Create Todo API. We setup the owner of todo with given user that sent by admin or that common user it self.
        """

        user = User.objects.filter(id=self.request.data.get('user')).first()
        if user and self.request.user.is_superuser:
            serializer.save(owner=user)
        else:
            serializer.save(owner=self.request.user)

    def list(self, request):
        """
        Todo List API. We return todo list that filtered by owner
        """
        instances = Todo.objects.filter(owner=request.user)

        return Response(TodoSerializer(instances, many=True).data)

    @detail_route(['GET'])
    def attachments(self, request, pk):
        """
        Todo attachments API. We return all attchments todo here.
        """
        todo = self.get_object()
        return Response(AttachmentSerializer(todo.attachments.all(), many=True).data)

    @detail_route(['POST'])
    def add_attachment(self, request, pk):
        """
        This is API to add todo attachment.
        """
        todo = self.get_object()
        attachment = Attachment.objects.create(file=request.FILES.get(
            'file'), filename=request.FILES.get('file').name, todo=todo)

        return Response(AttachmentSerializer(attachment).data)

    @detail_route(['POST'])
    def delete_attachment(self, request, pk):
        """
        Delete attachment API
        """
        todo = self.get_object()
        attachments = todo.attachments.all()

        attachment = attachments.get(id=request.data.get('id'))
        attachment.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """
    Get logged in user information
    """
    user = request.user
    return Response(UserSerializer(user).data)


@api_view(['POST'])
@permission_classes([])
def register_user(request):
    """
    This is API for register user, username, email and password required.
    """
    username = request.data.get('username')
    print username
    email = request.data.get('email')
    password = request.data.get('password')

    if all([username, email, password]):
        try:
            user = User.objects.create_user(email=request.data.get(
                'email'), username=username, password=password)

            return Response(UserSerializer(user).data)
        except:
            return Response({'error': 'Please correct your input'}, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response(status=status.HTTP_400_BAD_REQUEST)
