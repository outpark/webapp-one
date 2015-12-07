# coding: utf-8
# pylint: disable=too-few-public-methods, no-self-use, missing-docstring, unused-argument
"""
Provides API logic relevant to users
"""
from flask_restful import reqparse, Resource

import auth
from google.appengine.ext import ndb

from main import API
from model import Story
from api.helpers import ArgumentValidator, make_list_response, make_empty_ok_response
from flask import request, g
from pydash import _
from api.decorators import model_by_key, user_by_username, authorization_required, admin_required, login_required

FB_MEMCACHE_KEY = 'fb_access_token'
FB_APP_ID = '1044653762222445'
FB_APP_SECRET = 'e36b138e1e3cb2a068a5126735dcd478'
FB_PAGE_ID = '392757500918335'

@API.resource('/api/v1/stories')
class StoriesApi(Resource):
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('cursor', type=ArgumentValidator.create('cursor'))
        args = parser.parse_args()

        stories_future = Story.query() \
            .order(-Story.modified) \
            .fetch_page_async(30, start_cursor=args.cursor)

        total_count_future = Story.query().count_async(keys_only=True)
        stories, next_cursor, more = stories_future.get_result()
        stories = [s.to_dict(include=Story.get_public_properties()) for s in stories]
        return make_list_response(stories, next_cursor, more, total_count_future.get_result())

    @login_required
    def post(self):
        """Creates new project if provided valid arguments"""
        current_user = auth.current_user_db()
        parser = reqparse.RequestParser()
        parser.add_argument('text', required=True)
        args = parser.parse_args()

        story_db = Story.get_by_id(current_user.email)
        if not story_db:
            story_db = Story(
                id=('%s' % current_user.email)
            )
        story_db.populate(**{
            'text': args.text,
            'owner_name': current_user.name,
            'owner_username': current_user.username,
            'owner_key': current_user.key,
            'owner_location': current_user.location,
            'owner_program': current_user.program,
            'owner_institution': current_user.institution,
            'owner_avatar': current_user.avatar_url
        })
        story_db.put()
        current_user.has_story = True
        current_user.put()
        return story_db.to_dict(include=Story.get_public_properties())

@API.resource('/api/v1/stories/<string:key>')
class StoriesByUserAPI(Resource):

    def get(self, key):
        story_db = Story.get_by_id(key)
        if not story_db:
            return make_empty_ok_response()
        else:
            return story_db.to_dict(include=Story.get_public_properties())