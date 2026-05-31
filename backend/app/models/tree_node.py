"""
Modelo que representa un nodo del árbol de derivación.
Cada nodo tiene un símbolo y una lista de hijos.
"""


class TreeNode:
    """
    Representa un nodo en el árbol de derivación de la gramática CFG.

    Attributes:
        symbol (str): símbolo del nodo, puede ser terminal o no terminal.
        children (list): lista de nodos hijos.
    """

    def __init__(self, symbol: str):
        """
        Inicializa el nodo con su símbolo y sin hijos.

        Args:
            symbol (str): símbolo que representa este nodo.
        """
        self.symbol = symbol
        self.children = []

    def add_child(self, child):
        """
        Agrega un nodo hijo a este nodo.

        Args:
            child (TreeNode): nodo hijo a agregar.
        """
        self.children.append(child)

    def to_dict(self):
        """
        Convierte el nodo y sus hijos a un diccionario serializable a JSON.

        Returns:
            dict: representación del nodo con su símbolo e hijos.
        """
        return {
            "symbol": self.symbol,
            "children": [child.to_dict() for child in self.children]
        }