from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
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


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.all()
    

    def perform_create(self, serializer):
        serializer.save(username=serializer.validated_data.get('email'))

    def list(self, request, *args, **kwargs):
        if not request.user.is_superuser:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        instance = self.get_queryset()
        page = self.paginate_queryset(instance)

        if page is not None:
            serializer = self.get_pagination_serializer(page)
        else:
            serializer = self.get_serializer(instance, many=True)

        return Response(serializer.data)

    @detail_route(['GET'])
    def todos(self, request, pk):
        user = self.get_object()

        return Response(TodoSerializer(user.todos.all(), many=True).data)


class TodoViewSet(viewsets.ModelViewSet):
    serializer_class = TodoSerializer
    queryset = Todo.objects.all()

    def get_serializer_class(self):
        if self.action in ['add_attachment', 'delete_attachment']:
            return AttachmentSerializer
        else:
            return self.serializer_class

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def list(self, request):
        instances = Todo.objects.filter(owner=request.user)

        return Response(TodoSerializer(instances, many=True).data)

    @detail_route(['GET'])
    def attachments(self, request, pk):
        todo = self.get_object()
        return Response(AttachmentSerializer(todo.attachments.all(), many=True).data)

    @detail_route(['POST'])
    def add_attachment(self, request, pk):
        todo = self.get_object()
        attachment = Attachment.objects.create(file=request.FILES.get(
            'file'), filename=request.FILES.get('file').name, todo=todo)

        return Response(AttachmentSerializer(attachment).data)

    @detail_route(['POST'])
    def delete_attachment(self, request, pk):
        todo = self.get_object()
        attachments = todo.attachments.all()

        attachment = attachments.get(id=request.data.get('id'))
        attachment.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user
    return Response(UserSerializer(user).data)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    username = request.data.get('username')
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