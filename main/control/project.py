# coding: utf-8
"""
Provides logic for non-api routes related to user
"""
import flask_login as login
import flask

import auth
import model
import util

from main import app

@app.route('/project/join/<token>/<email>', methods=['GET']) # pylint: disable=missing-docstring
def join_project(token, email):
    """Verifies user's email by token provided in url"""
    if auth.is_logged_in():
        login.logout_user()
        return flask.redirect(flask.request.path)

    user_db = model.User.get_by('token', token)
    if user_db and not user_db.verified:
        # setting new token is necessary, so this one can't be reused
        user_db.token = util.uuid()
        user_db.verified = True
        user_db.put()
        flask.flash('Account activated. Please log in to continue!')
    else:
        flask.flash('Sorry, activation link is either invalid or expired.')

    return flask.redirect('/login')
