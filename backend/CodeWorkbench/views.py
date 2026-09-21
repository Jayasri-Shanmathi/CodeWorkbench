from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Project,Feature,Journal
from .serializers import ProjectSerializer,FeatureSerializer,JournalSerializer,JournalImageSerializer
from django.shortcuts import get_object_or_404


#Creating a Project

@api_view(["POST", "GET"])
def project(request):
    if request.method == "GET":
        projects = Project.objects.all()
        result = []
        for project in projects:
            total = project.features.count()
            completed = project.features.filter(is_completed=True).count()
            if total == 0:
                progress = 0
            else:
                progress = (completed / total) * 100
            serializer = ProjectSerializer(project)
            data = serializer.data
            data["progress"] = progress
            result.append(data)
        return Response(result)
    
    elif request.method=="POST":
        serializer = ProjectSerializer(data=request.data)
        if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
   #NO ELSE CLAUSE REQUIRED AS THE DECORATOR WOULD AUTOMATICALLY FILTER OUT ANY OTHER REQUEST METHODS

#Updating a project
@api_view(["PATCH"])
def update_project(request,id):
    project=get_object_or_404(Project,id=id)
    serializer=ProjectSerializer(project,data=request.data,partial=True)
    if serializer.is_valid():
         serializer.save()
         return Response(serializer.data,status=200)
    return Response(serializer.errors,status=400)

#Deleting a project
@api_view(["DELETE"])
def delete_project(request,id):
     project=get_object_or_404(Project,id=id)
     project.delete()
     return Response({"message":"Project successfully Deleted"},status=200)


#Creating features and retrieving features of a project
@api_view(["GET","POST"])
def features(request,project_id):
    project=get_object_or_404(Project,id=project_id)
    if request.method=="GET":
        features=project.features.all()
        serializer=FeatureSerializer(features,many=True)
        return Response(serializer.data,status=200)

    elif request.method=="POST":
        serializer=FeatureSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(project=project)
            return Response(serializer.data,status=201)
        return Response(serializer.errors,status=400)


#Updating a feature
@api_view(["PATCH"])
def update_feature(request,project_id,feature_id):
    project=get_object_or_404(Project,id=project_id)
    feature = get_object_or_404(
    Feature,
    id=feature_id,
    project=project
)
    serializer=FeatureSerializer(feature,data=request.data,partial=True)
    if serializer.is_valid():
         serializer.save()
         return Response(serializer.data,status=200)
    return Response(serializer.errors,status=400)

#Deleting a feature
@api_view(["DELETE"])
def delete_feature(request,project_id,feature_id):
     project=get_object_or_404(Project,id=project_id)
     feature = get_object_or_404(
    Feature,
    id=feature_id,
    project=project
)
     feature.delete()
     return Response({"message":"Successfully deleted feature"},status=200)

#Creatinga and retrieving journal
@api_view(["POST","GET"])
def journal(request,project_id):
    project=get_object_or_404(Project,id=project_id)
    if request.method=="GET":
        journals=project.journals.all()
        serializer=JournalSerializer(journals,many=True)
        return Response(serializer.data,status=200)

    elif request.method=="POST":
        serializer=JournalSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(project=project)
            return Response(serializer.data,status=201)
        return Response(serializer.errors,status=400)

#Updating a journal
@api_view(["PATCH"])
def update_journal(request,project_id,journal_id):
    project=get_object_or_404(Project,id=project_id)
    journal=get_object_or_404(Journal,id=journal_id,project=project)
    serializer=JournalSerializer(journal,data=request.data,partial=True)
    if serializer.is_valid():
         serializer.save()
         return Response(serializer.data,status=200)
    return Response(serializer.errors,status=400)

#Deleting a journal
@api_view(["DELETE"])
def delete_journal(request,project_id,journal_id):
        project=get_object_or_404(Project,id=project_id)
        journal=get_object_or_404(Journal,id=journal_id,project=project)
        journal.delete()
        return Response({"message":"Successfully deleted journal"},status=200)
#Uploading journal images
@api_view(["POST"])
def upload_journal_image(request, project_id, journal_id):
    project = get_object_or_404(Project, id=project_id)
    journal = get_object_or_404(
        Journal,
        id=journal_id,
        project=project
    )
    serializer = JournalImageSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(journal=journal)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)
