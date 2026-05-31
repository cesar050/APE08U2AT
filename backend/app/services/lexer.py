"""
Servicio de análisis léxico.
Convierte una expresión booleana en tokens con su tipo y valor.
"""

TIPOS_TOKEN = {
    '|': 'OR',
    '&': 'AND',
    '~': 'NOT',
    '(': 'LPAREN',
    ')': 'RPAREN',
}


def tokenizar(expresion: str) -> list:
    """
    Convierte una expresión booleana en una lista de tokens.
    Cada token tiene su valor, tipo y posición.

    Args:
        expresion (str): cadena de texto con la expresión booleana.

    Returns:
        list: lista de dicts con valor, tipo y posición.

    Raises:
        ValueError: si se encuentra un carácter no reconocido.

    Example:
        tokenizar("A & ~ B") → [
            {"valor": "A", "tipo": "ID", "posicion": 0},
            {"valor": "&", "tipo": "AND", "posicion": 2},
            ...
        ]
    """
    tokens = []
    i = 0
    expresion = expresion.strip()

    while i < len(expresion):
        char = expresion[i]

        if char == ' ':
            i += 1
            continue

        if char in TIPOS_TOKEN:
            tokens.append({
                "valor": char,
                "tipo": TIPOS_TOKEN[char],
                "posicion": i
            })
            i += 1

        elif char.isalpha():
            j = i
            while j < len(expresion) and expresion[j].isalpha():
                j += 1
            valor = expresion[i:j]
            tokens.append({
                "valor": valor,
                "tipo": "ID",
                "posicion": i
            })
            i = j

        else:
            raise ValueError(f"Carácter no reconocido: '{char}' en posición {i}")

    return tokens