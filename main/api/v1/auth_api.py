# coding: utf-8
# pylint: disable=too-few-public-methods, no-self-use, missing-docstring, unused-argument
"""
Provides API logic relevant to user authentication
"""
from flask_restful import reqparse, inputs, Resource
from flask import g
import util
import auth
import config
from model import User, UserValidator, Config, Profile
import task
from main import API
from api.helpers import make_empty_ok_response, ApiException
from api.decorators import verify_captcha, parse_signin
from google.appengine.ext import ndb  # pylint: disable=import-error


@API.resource('/api/v1/auth/signup')
class SignupAPI(Resource):
    def post(self):
        """Creates new user account if provided valid arguments"""
        parser = reqparse.RequestParser()
        parser.add_argument('first_name', type=UserValidator.create('name'), required=True)
        parser.add_argument('last_name', type=UserValidator.create('name'), required=True)
        parser.add_argument('email', type=UserValidator.create('unique_email'), required=True)
        parser.add_argument('password', type=UserValidator.create('password'), required=True)
        parser.add_argument('terms', type=bool, required=True, help='Must agree to all terms and conditions')
        args = parser.parse_args()

        if not args.terms:
            return ApiException.error(107)

        count = 0
        username = util.create_username_from_email(args.email)
        while(True): # get a unique username
            if User.is_username_available(username):
                break
            username += str(count)
            count += 1

        user_db = auth.create_user_db(
            auth_id=None,
            username=util.create_username_from_email(args.email),
            email=args.email,
            verified=True if not config.CONFIG_DB.verify_email else False,
            password=args.password,
            avatar_url=User.get_gravatar_url(args.email),
            roles=[User.Roles.MEMBER],
            first_name=args.first_name,
            last_name=args.last_name,
            profile=Profile()
        )

        user_db.put()

        if config.CONFIG_DB.verify_email:
            task.verify_user_email_notification(user_db)

        # sign in user
        auth.signin_user_db(user_db, remember=True)
        user_json_response = user_db.to_dict(include=User.get_private_properties())
        user_json_response["profile"] = user_db.profile.to_dict(include=Profile.get_private_properties())
        return user_json_response


@API.resource('/api/v1/auth/signin')
class SigninAPI(Resource):
    @parse_signin
    def post(self):
        """Signs in existing user. Note, g.user_db is set inside parse_signin decorator"""
        if not g.user_db:
            return ApiException.error(106) # Invalid credentials

        # if not g.user_db.verified:
        #     return ApiException.error(105) # Email not verified

        if not g.user_db.active == 1: # something other than active
            return ApiException.error(100 + g.user_db.active) # shows error (add 100 to this property)

        # everything is good; signin
        auth.signin_user_db(g.user_db, remember=g.args.remember)
        user_json_response = g.user_db.to_dict(include=User.get_private_properties())
        user_json_response["profile"] = g.user_db.profile.to_dict(include=Profile.get_private_properties())
        return user_json_response


@API.resource('/api/v1/auth/signout')
class SignoutAPI(Resource):
    def post(self):
        """Signs out user. Also it sends back config object with public properties,
        in case signed out user was admin, we want override his config object
        with new one, since admin config contains even private properties"""
        auth.signout_user()
        app_config = config.CONFIG_DB.to_dict(include=Config.get_public_properties())
        app_config['development'] = config.DEVELOPMENT
        return app_config


@API.resource('/api/v1/auth/resend-verification')
class ResendActivationAPI(Resource):
    @parse_signin
    def post(self):
        """Resends email verification to user"""
        if g.user_db and not g.user_db.verified and g.user_db.active:
            task.verify_user_email_notification(g.user_db)
        return make_empty_ok_response()


@API.resource('/api/v1/auth/forgot')
class ForgotPasswordAPI(Resource):
    def post(self):
        """Sends email with token for resetting password to an user"""
        parser = reqparse.RequestParser()
        parser.add_argument('email', type=UserValidator.create('existing_email'))
        args = parser.parse_args()
        user_db = User.get_by('email', args.email)
        task.reset_password_notification(user_db)
        return make_empty_ok_response()


@API.resource('/api/v1/auth/reset')
class ResetPasswordAPI(Resource):
    @ndb.toplevel
    def post(self):
        """Sets new password given by user if he provided valid token
        Notice ndb.toplevel decorator here, so we can perform asynchronous put
         and signing in in parallel
        """
        parser = reqparse.RequestParser()
        parser.add_argument('token', type=UserValidator.create('token'))
        parser.add_argument('password', type=UserValidator.create('password'), dest='new_password')
        args = parser.parse_args()
        user_db = User.get_by('token', args.token)
        user_db.password_hash = util.password_hash(args.new_password)
        user_db.token = util.uuid()
        user_db.verified = True
        user_db.put_async()
        auth.signin_user_db(user_db)
        return user_db.to_dict(include=User.get_private_properties())
