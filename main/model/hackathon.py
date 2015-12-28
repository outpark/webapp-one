# coding: utf-8
"""Provides implementation of User model and User"""
from __future__ import absolute_import
from google.appengine.ext import ndb
import model

class Hackathon(model.Base): # denormalized hackathon data (has to be updated manually when user model changes)
    user_id = ndb.IntegerProperty(required=True)
    name = ndb.StringProperty(required=True)
    username = ndb.StringProperty(required=True)
    email = ndb.StringProperty(required=True)
    hometown = ndb.StringProperty()

    rsvp = ndb.StringProperty()
    resume = ndb.StringProperty()
    skills = ndb.JsonProperty(repeated=True)
    makers = ndb.StringProperty(repeated=True)
    phone = ndb.StringProperty()
    shirt = ndb.StringProperty()
    gender = ndb.StringProperty()
    superpower = ndb.TextProperty()
    which = ndb.StringProperty(default='spring_2016') # has to be changed every hackathon
    is_complete = ndb.BooleanProperty(default=False)

    PUBLIC_PROPERTIES = ['rsvp', 'resume', 'skills', 'makers', 'phone', 'shirt', 'gender', 'superpower',
                         'which', 'username', 'name',  'email', 'hometown', 'is_complete']

    @classmethod
    def get_or_create(cls, user_db, which):
        item_db = cls.query(cls.user_id==user_db.id() and cls.which==which).get()
        if not item_db:
            item_db = cls(
                user_id = user_db.id(),
                name=user_db.name,
                username=user_db.username,
                email=user_db.email,
                hometown=user_db.hometown,
                which=which
            )
        return item_db

    @classmethod
    def update_user(cls, user_db):
        item_db = cls.get_by('user_id', user_db.id())
        item_db.name = user_db.name
        item_db.username = user_db.username
        item_db.email = user_db.email
        item_db.hometown = user_db.hometown

        item_db.put()
        return item_db