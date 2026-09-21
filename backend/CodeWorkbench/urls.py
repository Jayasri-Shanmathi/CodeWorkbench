from .views import project,update_project,delete_project,features,update_feature,delete_feature,journal,update_journal,delete_journal,upload_journal_image,bugs,update_bug,delete_bug,upload_bug_image
from django.urls import path


urlpatterns = [
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

]
