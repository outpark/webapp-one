# coding: utf-8
"""Provides implementation of User model and User"""
from __future__ import absolute_import

import hashlib
from google.appengine.ext import ndb
import model
import util


class UserValidator(model.BaseValidator):
    """Defines how to create validators for user properties. For detailed description see BaseValidator"""
    name = [1, 64]
    '''
    >>> username = [3, 64]
    '''
    password = [6, 100]
    email = util.EMAIL_REGEX


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
        return util.constrain_string(username, 3, 64)


class ProfileValidator(model.BaseValidator):
    location = [0, 100]
    bio = [0, 140]
    occupation = [0, 200]
    organization = [0, 200]


class Profile(model.Base):
    show_profile_wizard = ndb.IntegerProperty(default=1, required=True) # 0: don't show, 1,2,...the step of the wizard to show
    terms_accepted = ndb.BooleanProperty(default=False, required=True)
    location = ndb.StringProperty(validator=ProfileValidator.create('location'))
    workplaces = ndb.JsonProperty(repeated=True)
    colleges = ndb.JsonProperty(repeated=True)
    schools = ndb.JsonProperty(repeated=True)
    bio = ndb.StringProperty(validator=ProfileValidator.create('bio'))
    first_run = ndb.BooleanProperty(default=True, required=True)

    PUBLIC_PROPERTIES = ['location', 'workplaces', 'colleges', 'schools', 'bio', 'organization'] # accessible by everyone

    PRIVATE_PROPERTIES = ['show_profile_wizard', 'terms_accepted', 'first_run'] # accessible only by the user


class User(model.Base):
    # Define roles for all members
    # Gives larger control over role
    class Roles(object):
        MEMBER = "member"

    # Granular control over each action
    class Permissions(object):
        pass

    """A class describing datastore users."""
    first_name = ndb.StringProperty(validator=UserValidator.create('name'), required=True)
    last_name = ndb.StringProperty(validator=UserValidator.create('name'), required=True)
    name = ndb.ComputedProperty(lambda self: self.first_name.title() + ' ' + self.last_name.title())
    username = ndb.StringProperty(default='', required=True, validator=UserValidator.create('username_validator'))
    email = ndb.StringProperty(default='', validator=UserValidator.create('email', required=True))
    auth_ids = ndb.StringProperty(repeated=True)
    active = ndb.IntegerProperty(default=1) # 1: active, 0: deactivated by user, 2: suspended, 3: forbidden, 4: deleted
    admin = ndb.BooleanProperty(default=False) # True if user has global permissions (most powerful setting)
    roles = ndb.StringProperty(repeated=True)
    permissions = ndb.StringProperty(repeated=True)
    verified = ndb.BooleanProperty(default=False)
    token = ndb.StringProperty(default='') # For password setting / reset
    password_hash = ndb.StringProperty(default='')
    avatar_url = ndb.StringProperty(default='')
    profile = ndb.StructuredProperty(Profile)

    PUBLIC_PROPERTIES = ['first_name', 'last_name', 'name', 'username', 'avatar_url'] # accessible by everyone

    PRIVATE_PROPERTIES = ['email', 'active', 'admin', 'roles', 'permissions', 'verified'] # accessible only by user

    ## Gets the link to the user gravatar
    @classmethod
    def get_gravatar_url(cls, email):
        """Returns gravatar url, created from user's email or username"""
        return 'http://gravatar.com/avatar/%(hash)s?d=identicon&r=x' % {
            'hash': hashlib.md5(
                (email).encode('utf-8')).hexdigest()
        }

    ## Checks password (hashed)
    def has_password(self, password):
        """Tests if user has given password"""
        return self.password_hash == util.password_hash(password)

    ## Checks whether the given username is available
    @classmethod
    def is_username_available(cls, username):
        """Tests if user has username is available"""
        return cls.get_by('username', username) is None

    ## get a user by credentials
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


## Stores user images
class UserImage(model.Base):
    secret = ndb.StringProperty(required=True) # for uploading purpose
    user_key = ndb.StringProperty(required=True)
    username = ndb.StringProperty(required=True)
    name = ndb.StringProperty(default='')
    blob_key = ndb.StringProperty(default='')
    url = ndb.StringProperty()
    options = ndb.JsonProperty()
