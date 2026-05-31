"""
Router principal de la API.
Expone endpoints para análisis léxico y sintáctico.
"""
from flask import Blueprint, request, jsonify
from app.services.lexer import tokenizar
from app.services.parser import Parser

grammar_bp = Blueprint("grammar", __name__)


@grammar_bp.after_request
def after_request(response):
    """
    Asegura que todas las respuestas tengan el header Content-Type correcto.
    Esto es necesario para que Angular pueda parsear los errores 400.
    """
    response.headers['Content-Type'] = 'application/json'
    return response


@grammar_bp.route("/analizar", methods=["POST"])
def analizar():
    """
    Analiza una expresión booleana.
    Retorna tokens con tipos léxicos, pasos de derivación y árbol.

    Body JSON:
        { "expresion": "A & ~ B | C" }

    Returns:
        JSON con tokens, pasos, árbol y tabla léxica.
        Error 400 si la expresión es inválida con mensaje descriptivo.
    """
    datos = request.get_json()

    if not datos or "expresion" not in datos:
        return jsonify({"error": "Se requiere el campo 'expresion'"}), 400

    expresion = datos["expresion"].strip()

    if not expresion:
        return jsonify({"error": "La expresión no puede estar vacía"}), 400

    try:
        tokens = tokenizar(expresion)

        if not tokens:
            return jsonify({"error": "No se encontraron tokens válidos"}), 400

        parser = Parser(tokens)
        arbol = parser.parsear()

        return jsonify({
            "expresion": expresion,
            "tokens": [t["valor"] for t in tokens],
            "tabla_lexica": tokens,
            "pasos": parser.pasos,
            "arbol": arbol.to_dict()
        })

    except (ValueError, SyntaxError) as e:
        response = jsonify({"error": str(e)})
        response.status_code = 400
        return response


@grammar_bp.route("/validar", methods=["POST"])
def validar():
    """
    Valida una expresión en tiempo real mientras el usuario escribe.
    Retorna los tokens reconocidos hasta el momento y si hay error.

    Body JSON:
        { "expresion": "A &" }

    Returns:
        JSON con tabla_lexica y error si existe.
    """
    datos = request.get_json()

    if not datos or "expresion" not in datos:
        return jsonify({"tabla_lexica": [], "error": None})

    expresion = datos["expresion"].strip()

    if not expresion:
        return jsonify({"tabla_lexica": [], "error": None})

    try:
        tokens = tokenizar(expresion)
        return jsonify({
            "tabla_lexica": tokens,
            "error": None
        })
    except ValueError as e:
        return jsonify({
            "tabla_lexica": [],
            "error": str(e)
        })


@grammar_bp.route("/health", methods=["GET"])
def health():
    """
    Verificación de estado del servidor.

    Returns:
        JSON confirmando que el servidor está activo.
    """
    return jsonify({"status": "ok"})