"""
Parser recursivo descendente para expresiones lógicas booleanas.

Gramática implementada:
    Exp    → Exp | Term  |  Term
    Term   → Term & Factor  |  Factor
    Factor → ~ Factor  |  ( Exp )  |  id

Cada nivel corresponde a un operador con diferente precedencia:
    Nivel 1 (Exp)    → OR  |  menor precedencia
    Nivel 2 (Term)   → AND &  precedencia media
    Nivel 3 (Factor) → NOT ~  mayor precedencia
"""
from app.models.tree_node import TreeNode


class Parser:
    """
    Parser recursivo descendente.

    Attributes:
        tokens (list): lista de tokens del lexer.
        pos (int): posición actual en los tokens.
        pasos (list): pasos de la derivación por izquierda.
    """

    def __init__(self, tokens: list):
        """
        Inicializa el parser.

        Args:
            tokens (list): tokens generados por el lexer.
        """
        self.tokens = tokens
        self.pos = 0
        self.pasos = []

    def token_actual(self):
        """
        Retorna el token actual sin avanzar.

        Returns:
            dict | None: token actual o None si llegó al final.
        """
        if self.pos < len(self.tokens):
            return self.tokens[self.pos]
        return None

    def valor_actual(self):
        """
        Retorna el valor del token actual.

        Returns:
            str | None: valor del token actual.
        """
        t = self.token_actual()
        return t["valor"] if t else None

    def consumir(self, esperado: str):
        """
        Consume el token actual si coincide con el esperado.

        Args:
            esperado (str): valor del token esperado.

        Raises:
            SyntaxError: si el token no coincide.
        """
        if self.valor_actual() == esperado:
            self.pos += 1
        else:
            raise SyntaxError(
                f"Se esperaba '{esperado}' pero se encontró '{self.valor_actual()}'"
            )

    def registrar(self, produccion: str):
        """
        Registra un paso de la derivación por izquierda.

        Args:
            produccion (str): descripción de la producción aplicada.
        """
        self.pasos.append(produccion)

    def parsear(self):
        """
        Inicia el parseo desde el símbolo inicial Exp.

        Returns:
            TreeNode: raíz del árbol de derivación.

        Raises:
            SyntaxError: si la expresión es inválida.
        """
        if not self.tokens:
            raise SyntaxError("La expresión está vacía")

        nodo = self.exp()

        if self.token_actual() is not None:
            raise SyntaxError(
                f"Token inesperado al final: '{self.valor_actual()}'"
            )
        return nodo

    def exp(self):
        """
        Nivel 1 — maneja el operador OR (|).
        Regla: Exp → Exp | Term | Term

        Returns:
            TreeNode: nodo Exp.
        """
        nodo = TreeNode("Exp")
        izq = self.term()

        if self.valor_actual() == "|":
            self.registrar("Exp → Exp | Term")
            exp_izq = TreeNode("Exp")
            exp_izq.add_child(izq)
            nodo.add_child(exp_izq)
            self.consumir("|")
            nodo.add_child(TreeNode("|"))
            nodo.add_child(self.term())
        else:
            self.registrar("Exp → Term")
            nodo.add_child(izq)

        return nodo

    def term(self):
        """
        Nivel 2 — maneja el operador AND (&).
        Regla: Term → Term & Factor | Factor

        Returns:
            TreeNode: nodo Term.
        """
        nodo = TreeNode("Term")
        izq = self.factor()

        if self.valor_actual() == "&":
            self.registrar("Term → Term & Factor")
            term_izq = TreeNode("Term")
            term_izq.add_child(izq)
            nodo.add_child(term_izq)
            self.consumir("&")
            nodo.add_child(TreeNode("&"))
            nodo.add_child(self.factor())
        else:
            self.registrar("Term → Factor")
            nodo.add_child(izq)

        return nodo

    def factor(self):
        """
        Nivel 3 — maneja NOT (~), paréntesis y variables (id).
        Regla: Factor → ~ Factor | ( Exp ) | id

        Returns:
            TreeNode: nodo Factor.

        Raises:
            SyntaxError: si no se encuentra un factor válido.
        """
        nodo = TreeNode("Factor")
        actual = self.valor_actual()

        if actual == "~":
            self.registrar("Factor → ~ Factor")
            self.consumir("~")
            nodo.add_child(TreeNode("~"))
            nodo.add_child(self.factor())

        elif actual == "(":
            self.registrar("Factor → ( Exp )")
            self.consumir("(")
            nodo.add_child(TreeNode("("))
            nodo.add_child(self.exp())
            if self.valor_actual() != ")":
                raise SyntaxError("Se esperaba ')' para cerrar el paréntesis")
            self.consumir(")")
            nodo.add_child(TreeNode(")"))

        elif actual is not None and actual.replace("_", "").isalpha():
            self.registrar(f"Factor → id ({actual})")
            self.consumir(actual)
            nodo.add_child(TreeNode(actual))

        else:
            raise SyntaxError(
                f"Se esperaba una variable, '~' o '(' pero se encontró '{actual}'"
            )

        return nodo