# coding: utf-8
"""Provides implementation of User model and User"""
from __future__ import absolute_import

import hashlib
from google.appengine.ext import ndb
import model
import util


class Application(model.Base):
    """A class describing datastore users."""
    owner_name = ndb.StringProperty(required=True)
    owner_key = ndb.KeyProperty(required=True)
    owner_location = ndb.StringProperty(required=True)
    owner_avatar = ndb.StringProperty(required=True)
    owner_program = ndb.StringProperty(required=True)
    owner_institution = ndb.StringProperty(required=True)
    owner_username = ndb.StringProperty(required=True)
    interest = ndb.TextProperty()
    skills = ndb.TextProperty()
    expectations = ndb.TextProperty()
    superpower = ndb.TextProperty()
    first_choice_workshop = ndb.IntegerProperty()
    second_choice_workshop = ndb.IntegerProperty()
    is_submitted = ndb.BooleanProperty(default=False, required=True)


    PUBLIC_PROPERTIES = ['owner_name', 'owner_location', 'owner_program', 'owner_institution',
                         'interest', 'skills', 'expectations', 'superpower', 'first_choice_workshop',
                         'second_choice_workshop', 'is_submitted']

    PRIVATE_PROPERTIES = ['owner_key']

    def can_submit(self):
        if self.interest and self.skills and \
            self.expectations and self.superpower and \
                        self.first_choice_workshop >= 0 and self.second_choice_workshop >= 0:
            return True
        return False