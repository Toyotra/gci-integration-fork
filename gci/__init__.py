import os
from flask import Flask

def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'gci.sqlite'),
        UPLOAD_FOLDER=os.path.join(app.instance_path, 'media'),
        MAX_CONTENT_LENGTH=16*1024*1024
    )

    if test_config is None:
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.from_mapping(test_config)

    os.makedirs(app.instance_path, exist_ok=True)
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    from . import db
    db.init_app(app)

    from . import routes
    app.register_blueprint(routes.bp, url_prefix='')

    return app