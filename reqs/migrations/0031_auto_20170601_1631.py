# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2017-06-01 16:31
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reqs', '0030_auto_20170517_2035'),
    ]

    operations = [
        migrations.AddField(
            model_name='policy',
            name='issuing_body',
            field=models.CharField(default='', max_length=512),
            preserve_default=False,
        ),
    ]
