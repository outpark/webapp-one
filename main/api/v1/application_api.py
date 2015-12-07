# coding: utf-8
# pylint: disable=too-few-public-methods, no-self-use, missing-docstring, unused-argument
"""
Provides API logic relevant to users
"""
from flask_restful import reqparse, Resource

import auth
from google.appengine.ext import ndb

from main import API
from model import Application
from api.helpers import ArgumentValidator, make_list_response, make_empty_ok_response, make_bad_request_exception
from flask import request, g
from pydash import _
from api.decorators import model_by_key, user_by_username, authorization_required, admin_required, login_required


@API.resource('/api/v1/applications')
class ApplicationsApi(Resource):
    @admin_required
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('cursor', type=ArgumentValidator.create('cursor'))
        args = parser.parse_args()

        app_future = Application.query() \
            .order(Application.modified) \
            .fetch_page_async(30, start_cursor=args.cursor)

        total_count_future = Application.query().count_async(keys_only=True)
        apps, next_cursor, more = app_future.get_result()
        apps = [s.to_dict(include=Application.get_public_properties()) for s in apps]
        return make_list_response(apps, next_cursor, more, total_count_future.get_result())

    @login_required
    def post(self):
        """Creates new project if provided valid arguments"""
        current_user = auth.current_user_db()
        parser = reqparse.RequestParser()
        parser.add_argument('interest', default=None)
        parser.add_argument('skills', default=None)
        parser.add_argument('expectations', default=None)
        parser.add_argument('superpower', default=None)
        parser.add_argument('first_choice_workshop', type=int)
        parser.add_argument('second_choice_workshop', type=int)
        parser.add_argument('is_submitted', required=True, type=bool)
        args = parser.parse_args()

        app_db = Application.get_by_id(current_user.email)
        if not app_db:
            app_db = Application(
                id=('%s' % current_user.email)
            )
        app_db.populate(**{
            'owner_name': current_user.name,
            'owner_username': current_user.username,
            'owner_key': current_user.key,
            'owner_location': current_user.location,
            'owner_program': current_user.program,
            'owner_institution': current_user.institution,
            'owner_avatar': current_user.avatar_url,
            'interest': args.interest,
            'skills': args.skills,
            'expectations': args.expectations,
            'superpower': args.superpower,
            'first_choice_workshop': args.first_choice_workshop,
            'second_choice_workshop': args.second_choice_workshop
        })

        print app_db.can_submit()

        if app_db.can_submit():
            if args.is_submitted:
                app_db.is_submitted = True
                current_user.has_applied = True
                current_user.put()
        else:
            if args.is_submitted:
                return make_bad_request_exception('Unable to submit, please complete all required fields.')
            else:
                app_db.is_submitted = False
        app_db.put()
        return app_db.to_dict(include=Application.get_public_properties())


@API.resource('/api/v1/applications/<string:key>')
class ApplicationsByUserAPI(Resource):

    def get(self, key):
        app_db = Application.get_by_id(key)
        if not app_db:
            return make_empty_ok_response()
        else:
            return app_db.to_dict(include=Application.get_public_properties())
