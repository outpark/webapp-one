# coding: utf-8
"""Provides implementation of User model and User"""
from __future__ import absolute_import

import hashlib
from google.appengine.ext import ndb
import model
import util


class UserValidator(model.BaseValidator):
    """Defines how to create validators for user properties. For detailed description see BaseValidator"""
    name = [0, 100]
    username = [3, 40]
    password = [6, 70]
    email = util.EMAIL_REGEX
    location = [0, 40]
    bio = [0, 140]
    program = [0, 100]
    institution = [0, 100]

    @classmethod
    def token(cls, token):
        """Validates if given token is in datastore"""
        user_db = User.get_by('token', token)
        if not user_db:
            raise ValueError('Sorry, your token is either invalid or expired.')
        return token

    @classmethod
    def existing_email(cls, email):
        """Validates if given email is in datastore"""
        user_db = User.get_by('email', email)
        if not user_db:
            raise ValueError('This email is not in our database.')
        return email

    @classmethod
    def unique_email(cls, email):
        """Validates if given email is not in datastore"""
        user_db = User.get_by('email', email)
        if user_db:
            raise ValueError('Sorry, this email is already taken.')
        return email

    @classmethod
    def unique_username(cls, username):
        """Validates if given username is not in datastore"""
        if not User.is_username_available(username):
            raise ValueError('Sorry, this username is already taken.')
        return username

    @classmethod
    def username_validator(cls, prop, value):
        try:
            username = util.constrain_regex(value, util.ALPHANUM_NO_SPACES_REGEX)
        except ValueError:
            raise ValueError('Username can only contain letters (a-z), numbers (0-9), periods and underscores.')
        return util.constrain_string(username, 3, 40)


class User(model.Base):
    """A class describing datastore users."""
    name = ndb.StringProperty(default='', validator=UserValidator.create('name'))
    username = ndb.StringProperty(default='', required=True, validator=UserValidator.create('username_validator'))
    email = ndb.StringProperty(default='', validator=UserValidator.create('email', required=True))
    auth_ids = ndb.StringProperty(repeated=True)
    active = ndb.BooleanProperty(default=True)
    admin = ndb.BooleanProperty(default=False)
    permissions = ndb.StringProperty(repeated=True)
    verified = ndb.BooleanProperty(default=False)
    token = ndb.StringProperty(default='')
    password_hash = ndb.StringProperty(default='')
    location = ndb.StringProperty(validator=UserValidator.create('location'))
    program = ndb.StringProperty(validator=UserValidator.create('program'))
    bio = ndb.StringProperty(validator=UserValidator.create('bio'))
    institution = ndb.StringProperty(validator=UserValidator.create('institution'))
    is_complete = ndb.BooleanProperty(default=False)
    avatar_url = ndb.StringProperty(default='')
    has_applied = ndb.BooleanProperty(default=False)
    has_story = ndb.BooleanProperty(default=False)
    has_project = ndb.BooleanProperty(default=False)
    has_shared = ndb.BooleanProperty(default=False)

    PUBLIC_PROPERTIES = ['avatar_url', 'name', 'username', 'location', 'program', 'bio', 'institution', 'is_complete',
                         'has_applied', 'has_story', 'has_project', 'has_shared']

    PRIVATE_PROPERTIES = ['admin', 'active', 'auth_ids', 'email', 'permissions', 'verified']

    @classmethod
    def get_gravatar_url(cls, email):
        """Returns gravatar url, created from user's email or username"""
        return 'http://gravatar.com/avatar/%(hash)s?d=identicon&r=x' % {
            'hash': hashlib.md5(
                (email).encode('utf-8')).hexdigest()
        }

    def has_password(self, password):
        """Tests if user has given password"""
        return self.password_hash == util.password_hash(password)

    @classmethod
    def is_username_available(cls, username):
        """Tests if user has username is available"""
        return cls.get_by('username', username) is None

    @classmethod
    def get_by_credentials(cls, email_or_username, password):
        """Gets user model instance by email or username with given password"""
        try:
            email_or_username == User.email
        except ValueError:
            cond = email_or_username == User.username
        else:
            cond = email_or_username == User.email
        user_db = User.query(cond).get()

        if user_db and user_db.password_hash == util.password_hash(password):
            return user_db
        return None

    @classmethod
    def get_by_email(cls, email):
        return User.query(email.lower() == User.email).get()

    @classmethod
    def get_by_username(cls, username):
        return User.query(username.lower() == User.username).get()

    def check_completed(self):
        if self.name and self.location and self.program and self.institution:
            self.is_complete = True
        else:
            self.is_complete = False


class UserImage(model.Base):
    secret = ndb.StringProperty(required=True)
    user_key = ndb.StringProperty(required=True)
    username = ndb.StringProperty(required=True)
    name = ndb.StringProperty(default='')
    blob_key = ndb.StringProperty()
    is_used = ndb.BooleanProperty(default=False)
