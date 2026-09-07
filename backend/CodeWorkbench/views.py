from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Project
from .serializers import ProjectSerializer
from django.shortcuts import get_object_or_404


#Creating a Project

@api_view(["POST","GET"])
def project(request):
    if request.method=="GET":
        projects=Project.objects.all()
        serializer=ProjectSerializer(projects,many=True)
        return Response(serializer.data)

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

         




