"""
Inicialización de la aplicación Flask.
Registra los blueprints y configura CORS.
"""
from flask import Flask
from flask_cors import CORS
from app.routers.grammar import grammar_bp


def create_app():
    """
    Crea y configura la instancia de la aplicación Flask.

    Returns:
        Flask: instancia configurada de la aplicación.
    """
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "expose_headers": ["Content-Type"]
    }})
    app.register_blueprint(grammar_bp, url_prefix="/api")
    return app