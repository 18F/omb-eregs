# -*- coding: utf-8 -*-
# Generated by Django 1.11.5 on 2018-01-10 22:45
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reqs', '0009_remove_requirement_docnode'),
    ]

    operations = [
        migrations.AddField(
            model_name='policy',
            name='workflow_phase',
            field=models.CharField(blank=True, choices=[('edit', 'Edit'), ('cleanup', 'Cleanup'), ('failed', 'Failed Import'), ('published', 'Published'), ('review', 'Review')], max_length=32),
        ),
    ]
