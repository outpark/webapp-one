# coding: utf-8
# pylint: disable=too-few-public-methods, no-self-use, missing-docstring, unused-argument
"""
Provides API logic relevant to users
"""
import uuid
from flask_restful import reqparse, Resource

import auth
import util
from google.appengine.ext.blobstore import blobstore

from main import API
from model import User, UserValidator, UserImage
from api.helpers import ArgumentValidator, make_list_response, make_empty_ok_response, ApiException
from flask import request, g
from pydash import _
from api.decorators import model_by_key, user_by_username, authorization_required, admin_required, login_required


@API.resource('/api/v1/users')
class UsersAPI(Resource):
    """Gets list of users. Uses ndb Cursor for pagination. Obtaining users is executed
    in parallel with obtaining total count via *_async functions
    """
    @login_required
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('cursor', type=ArgumentValidator.create('cursor'))
        args = parser.parse_args()

        users_future = User.query() \
            .order(-User.created) \
            .fetch_page_async(10, start_cursor=args.cursor)

        total_count_future = User.query().count_async(keys_only=True)
        users, next_cursor, more = users_future.get_result()
        users = [u.to_dict(include=User.get_public_properties()) for u in users]
        return make_list_response(users, next_cursor, more, total_count_future.get_result())


@API.resource('/api/v1/users/<string:username>')
class UserByUsernameAPI(Resource):
    @user_by_username
    def get(self, username):
        """Loads user's properties. If logged user is admin it loads also non public properties"""
        if auth.is_admin():
            properties = User.get_private_properties()
        else:
            properties = User.get_public_properties()
        return g.user_db.to_dict(include=properties)


@API.resource('/api/v1/users/<string:key>')
class UserByKeyAPI(Resource):
    @authorization_required
    @model_by_key
    def post(self, key):
        """Updates user's properties"""
        update_properties = ['first_name', 'last_name', 'avatar_url', 'email', 'username']
        if auth.is_admin():
            update_properties += ['verified', 'active', 'admin']
        new_user_data = _.pick(request.json, update_properties)

        new_email_set = False
        new_email = new_user_data.get('email')
        if new_email != g.model_db.email:
            UserValidator.create('unique_email')(new_email)
            new_email_set = True
        new_username = new_user_data.get('username')
        if new_username != g.model_db.username:
            UserValidator.create('unique_username')(new_username)

        g.model_db.populate(**new_user_data)
        g.model_db.put()
        return g.model_db.to_dict(include=User.get_public_properties())

    @admin_required
    @model_by_key
    def delete(self, key):
        """Deletes user"""
        g.model_key.delete()
        return make_empty_ok_response()


@API.resource('/api/v1/users/<string:key>/password')
class UserPasswordAPI(Resource):
    @authorization_required
    @model_by_key
    def post(self, key):
        """Changes user's password"""
        parser = reqparse.RequestParser()
        parser.add_argument('currentPassword', type=UserValidator.create('password', required=False), dest='current_password')
        parser.add_argument('newPassword', type=UserValidator.create('password'), dest='new_password')
        args = parser.parse_args()
        # Users, who signed up via social networks have empty password_hash, so they have to be allowed
        # to change it as well
        if g.model_db.password_hash != '' and not g.model_db.has_password(args.current_password):
            raise ValueError('Given password is incorrect.')
        g.model_db.password_hash = util.password_hash(args.new_password)
        g.model_db.put()
        return make_empty_ok_response()


@API.resource('/api/v1/users/<string:key>/uploadurl')
class UserImageAPI(Resource):
    @authorization_required
    @model_by_key
    def post(self, key):
        parser = reqparse.RequestParser()
        parser.add_argument('size', type=int, help='Not a valid size')
        parser.add_argument('crop', type=bool, help='Crop can be true or false')
        args = parser.parse_args()

        secret = str(uuid.uuid4())

        options = None
        if args.size or args.crop:
            options = {
                "size" : args.size,
                "crop" : args.crop
            }

        user_image = UserImage(
            secret=secret,
            user_key=str(g.model_db.key),
            username=g.model_db.username,
            name=g.model_db.name,
            options=options
        )
        user_image.put()
        upload_url = blobstore.create_upload_url('/uploadimage?key=' + str(user_image.key.urlsafe()))
        repr_dict = {
            'upload_url': upload_url
        }
        return repr_dict
