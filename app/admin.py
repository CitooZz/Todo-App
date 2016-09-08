from django.contrib import admin

from .models import (
    Todo,
    Attachment
)


class AttachmentInline(admin.StackedInline):
    """
    Attachment admin inline. We will include this to Todo admin creation.
    """
    model = Attachment
    fields = ('file', 'filename')
    extra = 0


class TodoAdmin(admin.ModelAdmin):
    """
    Todo admin that include attachment.
    """
    list_display = ('title', 'owner', 'description', 'created_at')
    inlines = [AttachmentInline, ]


class AttachmentAdmin(admin.ModelAdmin):
    """
    Attachment Admin
    """
    list_display = ('todo', 'file')
    fields = ('todo', 'file', 'filename')


admin.site.register(Todo, TodoAdmin)
admin.site.register(Attachment, AttachmentAdmin)
