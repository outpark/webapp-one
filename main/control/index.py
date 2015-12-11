# coding: utf-8
"""
Provides logic for rendering index template
"""
import flask

from flask import request, make_response
from google.appengine.ext import ndb
from google.appengine.ext.blobstore import blobstore
from werkzeug.http import parse_options_header
from main import app
import auth
import config
from model import User, UserValidator, Config
from api.helpers import ArgumentValidator

# Uploads images for user
@app.route('/uploadimage', methods=['POST'])
def upload():
    if request.method == 'POST':
        f = request.files['file']
        header = f.headers['Content-Type']
        parsed_header = parse_options_header(header)
        blob_key = parsed_header[1]['blob-key']
        user_image_key = ndb.Key(urlsafe=request.args.get('key'))
        if blob_key and user_image_key:
            user_image = user_image_key.get()
            if user_image:
                user_image.blob_key = blob_key
                user_image.put()
                return flask.jsonify(user_image.to_dict())
        return 400


# Retrieves images based on key
@app.route("/images/<bkey>")
def img(bkey):
    blob_info = blobstore.get(bkey)
    response = make_response(blob_info.open().read())
    response.headers['Content-Type'] = blob_info.content_type
    return response


# index - home page
@app.route('/<year>')
def index():
    """Render index template"""
    return flask.render_template('index.html')


# app - login and dashboard
@app.route('/app')
def app_route():
    """Render the app template"""
    return flask.render_template('app.html')


# Injects user model into every page request
@app.context_processor
def inject_user():
    """Injects 'user' variable into jinja template, so it can be passed into angular. See base.html"""
    user = False
    if auth.is_logged_in():
        user = auth.current_user_db().to_dict(include=User.get_private_properties())
    return {
        'user': user
    }


# Injects app config into every page request
@app.context_processor
def inject_config():
    """Injects 'app_config' variable into jinja template, so it can be passed into angular. See base.html"""
    config_properties = Config.get_all_properties() if auth.is_admin() else Config.get_public_properties()
    app_config = config.CONFIG_DB.to_dict(include=config_properties)
    app_config['development'] = config.DEVELOPMENT
    return {
        'app_config': app_config
    }


# Injects validators for forms into every page request
@app.context_processor
def inject_validators():
    """Injects 'validators' variable into jinja template, so it can be passed into angular. See base.html
    Model validators are passed to angular so it can be used for frontend input validation as well
    This prevents code repetition, as we e.g we change property of UserValidator.name to [5, 20]
    and the same validation of user's name (length between 5-20 characters) will be performed in frontend
    as well as in backend
    """
    return {
        'validators': {
            'arg': ArgumentValidator.to_dict(),
            'user': UserValidator.to_dict()
        }
    }


@app.route('/_ah/warmup')
def warmup():
    """Warmup requests load application code into a new instance before any live requests reach that instance.
    For more info see GAE docs"""
    return 'success'