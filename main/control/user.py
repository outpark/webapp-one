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


@app.route('/reset/<token>/', methods=['GET']) # pylint: disable=missing-docstring
def user_reset(token=None):
    """Verifies user's token from url, if it's valid redirects user to page, where he can
    set new password"""
    user_db = model.User.get_by('token', token)
    if not user_db:
        flask.flash('Sorry, password reset link is either invalid or expired.', 'danger')
        return flask.redirect(flask.url_for('index'))

    if auth.is_logged_in():
        login.logout_user()
        return flask.redirect(flask.request.path)

    # note this is url with '#', so it leads to angular state
    return flask.redirect('%s#!/reset/%s' % (flask.url_for('index'), token))


@app.route('/user/verify/<token>/', methods=['GET']) # pylint: disable=missing-docstring
def user_verify(token):
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
        flask.flash('Account activated. Please log in to continue!', category='success')
    else:
        flask.flash('Sorry, activation link is either invalid or expired.', category='danger')
    return flask.redirect('/app/login')
