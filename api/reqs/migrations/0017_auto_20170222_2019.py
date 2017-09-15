# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-02-22 20:19
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reqs', '0016_auto_20170214_1551'),
    ]

    operations = [
        migrations.AddField(
            model_name='policy',
            name='policy_status',
            field=models.CharField(blank=True, max_length=32),
        ),
        migrations.AddField(
            model_name='requirement',
            name='omb_data_collection',
            field=models.CharField(blank=True, max_length=1024),
        ),
        migrations.AddField(
            model_name='requirement',
            name='precedent',
            field=models.CharField(blank=True, max_length=1024),
        ),
        migrations.AddField(
            model_name='requirement',
            name='related_reqs',
            field=models.CharField(blank=True, max_length=1024),
        ),
        migrations.AddField(
            model_name='requirement',
            name='req_status',
            field=models.CharField(blank=True, max_length=32),
        ),
    ]