from .views import project,update_project,delete_project
from django.urls import path


urlpatterns = [
    path('project/',project),
    path('update_project/<int:id>/',update_project),
    path('delete_project/<int:id>/',delete_project),
]