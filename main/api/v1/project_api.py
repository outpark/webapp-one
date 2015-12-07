# coding: utf-8
# pylint: disable=too-few-public-methods, no-self-use, missing-docstring, unused-argument
"""
Provides API logic relevant to users
"""
import uuid
from flask_restful import reqparse, Resource

import auth
import util
import task
from google.appengine.ext import ndb
from google.appengine.ext.blobstore import blobstore

from main import API
from model import Project, ProjectValidator, ProjectMember, User
from api.helpers import ArgumentValidator, make_list_response, make_empty_ok_response
from flask import request, g, abort
from pydash import _
from api.decorators import model_by_key, user_by_username, authorization_required, admin_required, login_required


@API.resource('/api/v1/projects')
class ProjectsAPI(Resource):
    """Gets list of users. Uses ndb Cursor for pagination. Obtaining users is executed
    in parallel with obtaining total count via *_async functions
    """

    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('cursor', type=ArgumentValidator.create('cursor'))
        args = parser.parse_args()

        projects_future = Project.query(Project.is_public == True) \
            .order(-Project.modified) \
            .fetch_page_async(30, start_cursor=args.cursor)

        total_count_future = Project.query().count_async(keys_only=True)
        projects, next_cursor, more = projects_future.get_result()
        projects = [p.to_dict(include=Project.get_public_properties()) for p in projects]
        return make_list_response(projects, next_cursor, more, total_count_future.get_result())

    @login_required
    def post(self):
        """Creates new project if provided valid arguments"""
        current_user = auth.current_user_db()
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=ProjectValidator.create('name'), required=True)
        args = parser.parse_args()

        owner_project_member = ProjectMember(
            user_key=current_user.key,
            username=current_user.username,
            email=current_user.email,
            avatar_url=current_user.avatar_url,
            invitation_sent=True,
            has_joined=True,
            role=Project.ROLE_PROJECT_LEADER,
            name=current_user.name
        )
        project_db = Project(
            name=args.name,
            owner_email=current_user.email,
            owner_key=current_user.key,
            owner_name=current_user.name,
            members_struct=[owner_project_member, ]
        )
        project_db.put()
        current_user.has_project = True
        current_user.put()
        return project_db.to_dict(include=Project.get_public_properties())


@API.resource('/api/v1/projects/<string:key>')
class ProjectByKeyAPI(Resource):
    def get(self, key):
        project_db_key = ndb.Key(urlsafe=key)
        if project_db_key:
            project_db = project_db_key.get()
            if project_db:
                return project_db.to_dict(include=Project.get_public_properties())
        return make_empty_ok_response()

    @login_required
    @model_by_key
    def put(self, key):
        current_user = auth.current_user_db()
        if g.model_db.owner_email != current_user.email:
            return abort(403)

        # """Updates project's properties"""
        update_properties = ['name', 'elevator', 'members_struct', 'story', 'website',
                             'feature']

        new_data = _.pick(request.json, update_properties)
        g.model_db.populate(**new_data)

        # iterate over members
        for member in g.model_db.members_struct:
            if member.has_joined:  # if already joined then continue
                continue

            # try to find if the member exists on server
            user_db = User.get_by_email(member.email)
            if user_db:
                member.populate(**user_db.to_dict())
            else:  # set a gravatar
                member.avatar = User.get_gravatar_url(member.email)

            if not member.invitation_sent:
                task.invite_project_member(g.model_db, member.email)
                member.invitation_sent = True

        g.model_db.check_completed()
        g.model_db.put()
        return g.model_db.to_dict(include=Project.get_public_properties())

    @login_required
    @model_by_key
    def delete(self, key):
        current_user = auth.current_user_db()
        if g.model_db.owner_email != current_user.email:
            return abort(403)
        """Deletes project"""
        g.model_key.delete()
        return make_empty_ok_response()



@API.resource('/api/v1/users/<string:key>/projects')
class UserProjectApi(Resource):

    @model_by_key
    def get(self, key):
        parser = reqparse.RequestParser()
        parser.add_argument('cursor', type=ArgumentValidator.create('cursor'))
        args = parser.parse_args()

        projects_future = Project.query(Project.owner_email == g.model_db.email) \
            .order(-Project.modified) \
            .fetch_page_async(30, start_cursor=args.cursor)

        total_count_future = Project.query().count_async(keys_only=True)
        projects, next_cursor, more = projects_future.get_result()
        projects = [p.to_dict(include=Project.get_public_properties()) for p in projects]
        return make_list_response(projects, next_cursor, more, total_count_future.get_result())