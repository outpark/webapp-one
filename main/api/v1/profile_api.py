# coding: utf-8
# pylint: disable=too-few-public-methods, no-self-use, missing-docstring, unused-argument
"""
Provides API logic relevant to users
"""
import json
import uuid
from flask_restful import reqparse, Resource

import auth
import util
from google.appengine.ext.blobstore import blobstore

from main import API
from model import User, UserValidator, Profile
from api.helpers import ArgumentValidator, make_list_response, make_empty_ok_response, ApiException
from flask import request, g
from pydash import _
from api.decorators import model_by_key, user_by_username, authorization_required, admin_required, login_required
from model.profile import Workplace


@API.resource('/api/v1/profiles')
class ProfilesApi(Resource):
    """Gets list of profiles. Uses ndb Cursor for pagination. Obtaining users is executed
    in parallel with obtaining total count via *_async functions
    """
    # @login_required
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('cursor', type=ArgumentValidator.create('cursor'))
        args = parser.parse_args()

        profiles_future = Profile.query() \
            .order(-Profile.modified) \
            .fetch_page_async(10, start_cursor=args.cursor)

        total_count_future = Profile.query().count_async(keys_only=True)
        profiles, next_cursor, more = profiles_future.get_result()
        profiles = [u.to_dict(include=u.public_properties) for u in profiles]
        return make_list_response(profiles, next_cursor, more, total_count_future.get_result())


@API.resource('/api/v1/users/<string:key>/profile')
class ProfileByUserKeyApi(Resource):
    @login_required
    @model_by_key
    def get(self, key):
        user_id = g.model_db.id()
        profile = Profile.get_or_create(g.model_db)
        if auth.current_user_db().id() == user_id:
            return profile.to_dict(include=profile.get_all_properties())
        return profile.to_dict(include=profile.public_properties)

    @login_required
    @model_by_key
    def put(self, key):
        user_id = g.model_db.id()
        profile = Profile.get_by('user_id', user_id)
        if auth.current_user_db().id() != user_id: # logged in
            return ApiException.error(108)

        new_profile_data = _.pick(request.json, Profile.ALL_NON_STRUCTURED_PROPERTIES)
        profile.populate(**new_profile_data)
        profile.put()

        return profile.to_dict(include=profile.get_all_properties())


@API.resource('/api/v1/users/<string:key>/profile/<string:item_type>')
class ProfileItemByUserKeyApi(Resource):
    @login_required
    @model_by_key
    def post(self, key, item_type):
        user_id = g.model_db.id()
        profile = Profile.get_by('user_id', user_id)
        if auth.current_user_db().id() != user_id: # check profile belongs to current_user
            return ApiException.error(108)

        ModelClass = Profile.ALL_STRUCTURED_PROPERTIES.get(item_type)
        data = request.json
        if not data:
            return ApiException.error(200)

        success, value = ModelClass.create(profile, data)
        if success:
            return value
        else:
            return ApiException.error(200, value)


@API.resource('/api/v1/users/<string:key>/profile/<string:item_type>/<string:item_key>')
class ProfileItemByKeyApi(Resource):

    def update_item(self, profile, item_type, item_key):
        ModelClass = Profile.ALL_STRUCTURED_PROPERTIES.get(item_type)

        data = request.json
        if not data:
            return ApiException.error(200)

        success, value = ModelClass.update(profile, item_key, data)
        if success:
            return value
        else:
            return ApiException.error(200, value)

    @login_required
    @model_by_key
    def put(self, key, item_type, item_key): # updates an existing profile item
        user_id = g.model_db.id()
        profile = Profile.get_by('user_id', user_id)
        if auth.current_user_db().id() != user_id: # check profile belongs to current_user
            return ApiException.error(108)

        return self.update_item(profile, item_type, item_key)

    @login_required
    @model_by_key
    def post(self, key, item_type, item_key): # updates an existing profile item
        user_id = g.model_db.id()
        profile = Profile.get_by('user_id', user_id)
        if auth.current_user_db().id() != user_id: # check profile belongs to current_user
            return ApiException.error(108)

        return self.update_item(profile, item_type, item_key)

    @login_required
    @model_by_key
    def delete(self, key, item_type, item_key):
        user_id = g.model_db.id()
        profile = Profile.get_by('user_id', user_id)
        if auth.current_user_db().id() != user_id: # check profile belongs to current_user
            return ApiException.error(108)

        ModelClass = Profile.ALL_STRUCTURED_PROPERTIES.get(item_type)

        success, value = ModelClass.delete(profile, item_key)
        if success:
            return value
        else:
            return ApiException.error(200, value)
