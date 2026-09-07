from rest_framework import serializers
from .models import Project,Feature,Journal,Bug,SystemArchitecture,DatabaseSchema,JournalImage,BugImage

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'

class FeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feature
        fields = '__all__'  

class JournalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Journal
        fields = '__all__'

class BugSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bug
        fields = '__all__'

class SystemArchitectureSerializer(serializers.ModelSerializer):    
    class Meta:
        model = SystemArchitecture
        fields = '__all__'

class DatabaseSchemaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatabaseSchema
        fields = '__all__'

class JournalImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalImage
        fields = '__all__'

class BugImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = BugImage
        fields = '__all__'

