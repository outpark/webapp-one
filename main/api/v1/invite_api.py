# coding: utf-8
# pylint: disable=too-few-public-methods, no-self-use, missing-docstring, unused-argument
"""
Provides API logic relevant to users
"""
import string
import uuid
from flask_restful import reqparse, Resource, inputs

import auth
import random
from google.appengine.ext import ndb

from main import API, task
from model import Invite, User, UserValidator
from api.helpers import ArgumentValidator, make_list_response, make_empty_ok_response
from flask import request, g, abort
from pydash import _
from api.decorators import admin_required, login_required, verify_captcha


@API.resource('/api/v1/invitations')
class InvitesApi(Resource):

    def post(self):
        current_user = auth.current_user_db()
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=UserValidator.create('name'), required=True)
        parser.add_argument('username', type=UserValidator.create('username'), required=True)
        parser.add_argument('email', type=UserValidator.create('email'), required=True)
        parser.add_argument('is_attending', required=True, type=inputs.natural)
        args = parser.parse_args()

        invite_user = User.get_by_email(args.email)
        if not invite_user:
            parser.add_argument('username', type=UserValidator.create('unique_username'))
            args = parser.parse_args()
            rand_password = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(6))
            user_db = auth.create_user_db(
                auth_id=None,
                name=args.name,
                username=args.username,
                email=args.email,
                verified=False,
                password=rand_password,
                avatar_url=User.get_gravatar_url(args.email)
            )
            user_db.put()
            task.set_password_notification(user_db)

        invite = None

        if invite_user:
            invite = Invite.create(invite_user.name, invite_user.username, invite_user.email, 'Workshop 1', args.is_attending)
        else:
            invite = Invite.create(args.name, args.username, args.email, 'Workshop 1', args.is_attending)
        print invite
        if invite.is_attending:
            task.send_invite_notification(invite)
        return invite.to_dict(include=Invite.get_public_properties())


    @admin_required
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('cursor', type=ArgumentValidator.create('cursor'))
        args = parser.parse_args()

        invites_future = Invite.query() \
            .order(-Invite.modified) \
            .fetch_page_async(30, start_cursor=args.cursor)

        total_count_future = Invite.query().count_async(keys_only=True)
        invites, next_cursor, more = invites_future.get_result()
        invites = [s.to_dict(include=Invite.get_public_properties()) for s in invites]
        return make_list_response(invites, next_cursor, more, total_count_future.get_result())