# coding: utf-8
"""Provides implementation of User model and User"""
from __future__ import absolute_import

import hashlib
import logging

from google.appengine.ext import ndb
import model
import util


class ProfileValidator(model.BaseValidator):
    bio = [0, 140]
    occupation = [0, 200]
    organization = [0, 200]


class Workplace(model.StructuredBase):
    key = ndb.StringProperty(required=True)
    company = ndb.StringProperty(required=True)
    position = ndb.StringProperty(required=True)
    city = ndb.StringProperty()
    image = ndb.StringProperty()
    description = ndb.TextProperty()
    start_date = ndb.StringProperty(required=True)
    end_date = ndb.StringProperty()
    is_present = ndb.BooleanProperty()

    PUBLIC_PROPERTIES = ['company', 'position', 'city', 'image', 'description',
                         'start_date', 'end_date', 'is_present', 'key']

    JSON_NAME = 'workplaces_struct'

    @classmethod
    def is_valid(cls, model):
        errors = {}
        if not model.company:
            errors["company"] = 'Please provide a company name'
        if not model.position:
            errors["position"] = 'Please provide your position'
        if not model.start_date:
            errors["start_date"] = "Please provide a start date"
        if not (model.is_present or model.end_date):
            errors["end_date"] = "Please check off 'I currently work here' or provide an end date"
        if errors != {}:
            return False, errors
        else:
            return True, errors


class College(model.StructuredBase):
    key = ndb.StringProperty(required=True)
    name = ndb.StringProperty(required=True)
    start_date = ndb.StringProperty(required=True)
    graduation_date = ndb.StringProperty()
    is_present = ndb.BooleanProperty()
    image = ndb.StringProperty()
    description = ndb.TextProperty()
    concentrations = ndb.StringProperty()
    attended_for = ndb.StringProperty()

    PUBLIC_PROPERTIES = ['name', 'graduated', 'concentrations', 'image', 'description', 'start_date',
                         'attended_for', 'graduation_date', 'is_present', 'key']

    JSON_NAME = 'colleges_struct'

    @classmethod
    def is_valid(cls, model):
        errors = {}
        if not model.name:
            errors["name"] = 'Please provide the college name'
        if not model.concentrations:
            errors["name"] = 'Please tell us what you studied at the college'
        if not (model.graduation_date):
            errors["graduation_date"] = "Please provide a graduation date"
        if errors != {}:
            return False, errors
        else:
            return True, errors


class School(model.StructuredBase):
    key = ndb.StringProperty(required=True)
    name = ndb.StringProperty(required=True)
    image = ndb.StringProperty()
    start_date = ndb.StringProperty(required=True)
    graduation_date = ndb.StringProperty()
    is_present = ndb.BooleanProperty()
    description = ndb.TextProperty()


    PUBLIC_PROPERTIES = ['key', 'name', 'image', 'start_date', 'graduation_date', 'is_present', 'description']

    JSON_NAME = 'schools_struct'

    @classmethod
    def is_valid(cls, model):
        errors = {}
        if not model.name:
            errors["name"] = 'Please provide the high school name'
        if not (model.graduation_date):
            errors["graduation_date"] = "Please provide a graduation date"
        if errors != {}:
            return False, errors
        else:
            return True, errors



class Profile(model.Base): # denormalized profile data (has to be updated when user model changes)
    user_id = ndb.IntegerProperty(required=True)
    name = ndb.StringProperty(required=True)
    username = ndb.StringProperty(required=True)
    email = ndb.StringProperty(required=True)

    workplaces_struct = ndb.StructuredProperty(Workplace, repeated=True)
    colleges_struct = ndb.StructuredProperty(College, repeated=True)
    schools_struct = ndb.StructuredProperty(School, repeated=True)
    bio = ndb.StringProperty(validator=ProfileValidator.create('bio'))
    twitter_handle = ndb.StringProperty()
    website = ndb.StringProperty()

    public_properties = ndb.StringProperty(repeated=True) # can be changed in the privacy settings by user
    ALL_NON_STRUCTURED_PROPERTIES = ['bio', 'name', 'username', 'email',
                                     'user_id', 'public_properties', 'twitter_handle', 'website']
    ALL_STRUCTURED_PROPERTIES = {
        "workplaces_struct": Workplace,
        "colleges_struct": College,
        "schools_struct": School
    }

    def get_all_properties(self):
        return ['city', 'workplaces_struct', 'colleges_struct', 'schools_struct',
                'bio', 'name', 'username', 'email', 'user_id',
                'public_properties', 'twitter_handle', 'website']

    @classmethod
    def get_or_create(cls, user_db):
        profile = cls.get_by('user_id', user_db.id())
        if not profile:
            profile = cls(
                user_id = user_db.id(),
                public_properties=['city', 'workplaces_struct', 'colleges_struct', 'schools_struct', 'bio',
                                   'name', 'username'], # default
                name=user_db.name,
                username=user_db.username,
                email=user_db.email
            )
            profile.put()
        return profile

    @classmethod
    def update_user(cls, user_db):
        profile = cls.get_by('user_id', user_db.id())
        profile.name = user_db.name
        profile.username = user_db.username
        profile.email = user_db.email

        profile.put()
        return profile