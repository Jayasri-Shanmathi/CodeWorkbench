from .views import project,update_project,delete_project,features,update_feature,delete_feature,journal,update_journal,delete_journal,upload_journal_image,bugs,update_bug,delete_bug,upload_bug_image,architecture,update_architecture,delete_architecture,database_schema,update_database_schema,delete_database_schema,login_user,logout_user,csrf_token
from django.urls import path


urlpatterns = [
    path('csrf/', csrf_token),
    path('login/',login_user),
    path('logout/',logout_user),
    path('project/',project),
    path('update_project/<int:id>/',update_project),
    path('delete_project/<int:id>/',delete_project),
    path('features/<int:project_id>/',features),
    path('update_feature/<int:project_id>/<int:feature_id>/',update_feature),
    path('delete_feature/<int:project_id>/<int:feature_id>/',delete_feature),
    path('journal/<int:project_id>/',journal),
    path('update_journal/<int:project_id>/<int:journal_id>/',update_journal),
    path('delete_journal/<int:project_id>/<int:journal_id>/',delete_journal),
    path('journal/<int:project_id>/<int:journal_id>/images/',upload_journal_image),
    path('bugs/<int:project_id>/',bugs),
    path('update_bug/<int:project_id>/<int:bug_id>/',update_bug),
    path('delete_bug/<int:project_id>/<int:bug_id>/',delete_bug),
    path('bugs/<int:project_id>/<int:bug_id>/images/',upload_bug_image),
    path('architecture/<int:project_id>/',architecture),
    path('update_architecture/<int:project_id>/',update_architecture),
    path('delete_architecture/<int:project_id>/',delete_architecture),
    path('database_schema/<int:project_id>/',database_schema),
    path('update_database_schema/<int:project_id>/',update_database_schema),
    path('delete_database_schema/<int:project_id>/',delete_database_schema),
]
