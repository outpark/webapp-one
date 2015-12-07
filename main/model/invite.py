# coding: utf-8
"""Provides implementation of User model and User"""
from __future__ import absolute_import

import hashlib
from google.appengine.ext import ndb
import model
import util


class Invite(model.Base):
    """A class describing datastore users."""
    name = ndb.StringProperty(required=True)
    username = ndb.StringProperty(required=True)
    email = ndb.StringProperty(required=True)
    is_attending = ndb.IntegerProperty(default=0, required=True)
    event = ndb.StringProperty(required=True)

    PUBLIC_PROPERTIES = ['name', 'email', 'is_attending', 'event']

    PRIVATE_PROPERTIES = []

    @classmethod
    def get_by_code(cls, code):
        return cls.query(cls.code == code).get()

    @classmethod
    def create(cls, name, username, email, event, rsvp):
        invite_db = Invite.query(Invite.email == email, Invite.event == event).get()
        if not invite_db:
            invite_db = Invite(
                email=email,
                username=username,
                event=event,
        )

        invite_db.name = name
        invite_db.is_attending = rsvp
        invite_db.put()
        return invite_db

