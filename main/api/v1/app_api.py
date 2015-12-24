# coding: utf-8
# pylint: disable=too-few-public-methods, no-self-use, missing-docstring, unused-argument
"""
Hello api: introduction to the website and test data generators
**Only works for development
"""
from flask_restful import Resource, abort

from api.helpers import make_json_ok_response, make_empty_ok_response
from google.appengine.ext import ndb

from main import API
from model import Config
from model.factories import UserFactory
import config



@API.resource('/api/v1/app/about')
class AppApi(Resource):
    def get(self):
        config_properties = Config.get_all_properties()
        app_config = config.CONFIG_DB.to_dict(include=config_properties)
        if not config.DEVELOPMENT:
            abort(404)
        return make_json_ok_response({
            "api": "v1",
            "app_config": app_config
        })


"""
Generate Mock Data
"""
@API.resource('/api/v1/app/mockdata/<string:data_type>')
class MockDataAPI(Resource):
    @ndb.toplevel
    def post(self, data_type):
        """Generates mock data for development purposes"""
        if not config.DEVELOPMENT:
            abort(404)
        # UserFactory.create_batch(50)
        return make_empty_ok_response()