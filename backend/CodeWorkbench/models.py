from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Project(models.Model):
    user=models.ForeignKey(User,on_delete=models.CASCADE,related_name="projects")
    title=models.CharField(max_length=200)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    tech_stack=models.CharField(max_length=200)
    objectives=models.TextField()
    last_opened_at=models.DateTimeField(null=True,blank=True)

    def __str__(self):
        return self.title

class Feature(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='features')
    feature = models.CharField(max_length=100)
    is_completed=models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.feature

class Journal(models.Model):
    project=models.ForeignKey(Project,on_delete=models.CASCADE,related_name='journals')
    title=models.CharField(max_length=200)
    date=models.DateField(auto_now_add=True)
    entry=models.TextField()
    FLAG_CHOICES=[("GENERAL","General"),("IDEA","Idea"),("DECISION","Decision"),("DISCARDED","Discarded")]
    flag=models.CharField(max_length=20,default="GENERAL",choices=FLAG_CHOICES)

class Bug(models.Model):
    project=models.ForeignKey(Project,on_delete=models.CASCADE,related_name='bugs')
    bug=models.CharField(max_length=200)
    created_at=models.DateTimeField(auto_now_add=True)
    entry=models.TextField()
    solution=models.TextField(blank=True)
    is_completed=models.BooleanField(default=False)

class SystemArchitecture(models.Model):
    project = models.OneToOneField(
        Project,
        on_delete=models.CASCADE,
        related_name='architecture'
    )
    text=models.TextField(blank=True)
    drawing_data=models.JSONField(blank=True,null=True)

class DatabaseSchema(models.Model):
    project = models.OneToOneField(
        Project,
        on_delete=models.CASCADE,
        related_name='database'
    )
    text=models.TextField(blank=True)
    drawing_data=models.JSONField(blank=True,null=True)

class JournalImage(models.Model):
    journal=models.ForeignKey(Journal,on_delete=models.CASCADE,related_name='images')
    image=models.ImageField(upload_to='journal_images/')

class BugImage(models.Model):
    bug=models.ForeignKey(Bug,on_delete=models.CASCADE,related_name='images')
    image=models.ImageField(upload_to='bug_images/')

   