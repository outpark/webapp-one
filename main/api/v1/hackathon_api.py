# coding: utf-8
# pylint: disable=too-few-public-methods, no-self-use, missing-docstring, unused-argument
"""
Provides API logic relevant to users
"""
import json
import uuid
from flask_restful import reqparse, Resource
from google.appengine.ext import ndb

import auth
import util
from google.appengine.ext.blobstore import blobstore

from main import API
from model import Hackathon
from api.helpers import ArgumentValidator, make_list_response, make_empty_ok_response, ApiException
from flask import request, g
from pydash import _
from api.decorators import model_by_key, user_by_username, authorization_required, admin_required, login_required
from model.profile import Workplace


@API.resource('/api/v1/hackathons')
class HackathonApi(Resource):
    """Gets list of profiles. Uses ndb Cursor for pagination. Obtaining users is executed
    in parallel with obtaining total count via *_async functions
    """
    #Todo: Make admin only
    @login_required
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('cursor', type=ArgumentValidator.create('cursor'))
        args = parser.parse_args()

        items_future = Hackathon.query() \
            .order(-Hackathon.modified) \
            .fetch_page_async(10, start_cursor=args.cursor)

        total_count_future = Hackathon.query().count_async(keys_only=True)
        items, next_cursor, more = items_future.get_result()
        items = [u.to_dict(include=Hackathon.get_public_properties()) for u in items]
        return make_list_response(items, next_cursor, more, total_count_future.get_result())


@API.resource('/api/v1/users/<string:key>/hackathons')
class HackathonByUserKeyApi(Resource):
    @login_required
    @model_by_key
    def get(self, key):
        parser = reqparse.RequestParser()
        parser.add_argument('cursor', type=ArgumentValidator.create('cursor'))
        args = parser.parse_args()

        user_id = g.model_db.id()
        if auth.current_user_db().id() != user_id: # not allowed to access other registrations
            return ApiException.error(403)

        items_future = Hackathon.query(Hackathon.user_id==user_id) \
            .order(-Hackathon.modified) \
            .fetch_page_async(10, start_cursor=args.cursor)

        total_count_future = Hackathon.query(Hackathon.user_id==user_id).count_async(keys_only=True)
        items, next_cursor, more = items_future.get_result()
        items = [u.to_dict(include=Hackathon.get_public_properties()) for u in items]
        return make_list_response(items, next_cursor, more, total_count_future.get_result())

    @login_required
    @model_by_key
    def post(self, key):
        user_id = g.model_db.id()
        if auth.current_user_db().id() != user_id: # not allowed to create registrations for other people
            return ApiException.error(403)

        item_db = Hackathon.get_or_create(g.model_db, 'spring_2016') # this is the name of the hackathon on feb 19, 2016
        update_properties = ['rsvp', 'resume', 'skills', 'maker', 'phone', 'shirt', 'gender', 'superpower']
        new_item_data = _.pick(request.json, update_properties)
        item_db.populate(**new_item_data)
        item_db.put()

        return item_db.to_dict(include=Hackathon.get_public_properties())


@API.resource('/api/v1/users/<string:key>/hackathons/<string:item_key>')
class HackathonByKeyApi(Resource):
    @login_required
    @model_by_key
    def get(self, key, item_key):
        item_db = ndb.Key(urlsafe=item_key).get()
        if not item_db:
            return ApiException.error(404)

        if auth.current_user_db().id() != item_db.user_id:
            return ApiException.error(403)
        return item_db.to_dict(include=Hackathon.get_public_properties())


    @login_required
    @model_by_key
    def put(self, key, item_key):
        item_db = ndb.Key(urlsafe=item_key).get()
        if not item_db:
            return ApiException.error(404)

        if auth.current_user_db().id() != item_db.user_id:
            return ApiException.error(403)

        update_properties = ['rsvp', 'resume', 'skills', 'makers', 'phone', 'shirt', 'gender', 'superpower']
        new_profile_data = _.pick(request.json, update_properties)
        item_db.populate(**new_profile_data)
        item_db.put()

        return item_db.to_dict(include=Hackathon.get_public_properties())