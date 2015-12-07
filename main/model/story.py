# coding: utf-8
"""Provides implementation of User model and User"""
from __future__ import absolute_import

import hashlib
from google.appengine.ext import ndb
import model
import util


class Story(model.Base):
    """A class describing datastore users."""
    owner_name = ndb.StringProperty(required=True)
    owner_key = ndb.KeyProperty(required=True)
    owner_location = ndb.StringProperty(required=True)
    owner_avatar = ndb.StringProperty(required=True)
    owner_program = ndb.StringProperty(required=True)
    owner_institution = ndb.StringProperty(required=True)
    owner_username = ndb.StringProperty(required=True)
    text = ndb.TextProperty(required=True)
    rank = ndb.IntegerProperty(default=100, required=True)

    PUBLIC_PROPERTIES = ['owner_name', 'owner_location', 'owner_program', 'owner_institution',
                         'text', 'owner_avatar', 'owner_username']

    PRIVATE_PROPERTIES = ['owner_key']
