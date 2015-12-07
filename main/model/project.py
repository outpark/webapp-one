# coding: utf-8
"""Provides implementation of User model and User"""
from __future__ import absolute_import

import hashlib
from google.appengine.ext import ndb
import model
import util


class ProjectValidator(model.BaseValidator):
    """Defines how to create validators for user properties. For detailed description see BaseValidator"""
    name = [1, 50]
    elevator = [1, 140]
    email = util.EMAIL_REGEX


class ProjectMember(model.Base):
    user_key = ndb.KeyProperty()
    username = ndb.StringProperty()
    avatar_url = ndb.StringProperty(required=True)
    email = ndb.StringProperty(required=True)
    invitation_sent = ndb.BooleanProperty(default=False, required=True)
    has_joined = ndb.BooleanProperty(default=False, required=True)
    name = ndb.StringProperty()
    role = ndb.StringProperty(required=True)

    PUBLIC_PROPERTIES = ['username', 'avatar_url', 'email', 'invitation_sent', 'has_joined', 'name', 'role']


class Project(model.Base):
    """A class describing datastore users."""
    name = ndb.StringProperty(required=True, validator=ProjectValidator.create('name'))
    elevator = ndb.StringProperty(validator=ProjectValidator.create('elevator'))
    members_struct = ndb.StructuredProperty(ProjectMember, repeated=True)
    owner_key = ndb.KeyProperty(required=True)
    owner_email = ndb.StringProperty(required=True)
    owner_name = ndb.StringProperty(required=True)
    is_public = ndb.BooleanProperty(required=True, default=False)
    story = ndb.TextProperty()
    website = ndb.StringProperty()
    feature = ndb.StringProperty()

    PUBLIC_PROPERTIES = ['name', 'elevator', 'members_struct', 'story', 'website',
                         'feature', 'owner_email', 'is_public']
    PRIVATE_PROPERTIES = ['owner_key']

    ROLE_PROJECT_LEADER = 'Project Leader'

    def check_completed(self):
        if self.name and self.elevator and self.story and self.feature:
            self.is_public = True
        else:
            self.is_public = False
