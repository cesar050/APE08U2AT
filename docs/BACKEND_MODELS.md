# Models del backend

## Que es un model

Un model es una clase que representa una estructura de datos.
No tiene logica de negocio ni sabe nada de HTTP.
Su unica responsabilidad es guardar datos y convertirlos a formatos utiles.

En este proyecto hay un solo model: TreeNode.

---

## TreeNode

Archivo: `backend/app/models/tree_node.py`

Representa un nodo del arbol de derivacion.

```python
class TreeNode:
    def __init__(self, symbol: str):
        self.symbol = symbol
        self.children = []
```

Cada nodo tiene dos atributos:

`symbol`: el simbolo que representa ese nodo. Puede ser un no-terminal
como `Exp`, `Term` o `Factor`, o un terminal como `A`, `B`, `&`, `~`.

`children`: lista de nodos hijos. Si la lista esta vacia, el nodo es una hoja
(un terminal). Si tiene hijos, es un nodo interno (un no-terminal).

---

## Metodo add_child

```python
def add_child(self, child):
    self.children.append(child)
```

Agrega un TreeNode hijo a la lista de hijos.
El parser llama a este metodo cada vez que aplica una produccion.

Por ejemplo, cuando aplica la produccion `Term -> Term & Factor`,
crea tres hijos y los agrega al nodo Term:

```python
nodo_term = TreeNode("Term")
nodo_term.add_child(TreeNode("Term"))    # hijo izquierdo
nodo_term.add_child(TreeNode("&"))       # operador
nodo_term.add_child(factor_derecho)      # hijo derecho
```

---

## Metodo to_dict

```python
def to_dict(self):
    return {
        "symbol": self.symbol,
        "children": [child.to_dict() for child in self.children]
    }
```

Convierte el nodo y todos sus descendientes en un diccionario Python.
Flask luego convierte ese diccionario a JSON para enviarlo al frontend.

Este metodo es recursivo. Cuando se llama en la raiz, llama a `to_dict()`
en cada hijo, y cada hijo llama a `to_dict()` en sus propios hijos.
La recursion se detiene cuando llega a un nodo sin hijos (lista vacia).

El resultado para un arbol simple como `A & B` seria:

```json
{
  "symbol": "Exp",
  "children": [
    {
      "symbol": "Term",
      "children": [
        {
          "symbol": "Term",
          "children": [
            {
              "symbol": "Factor",
              "children": [
                { "symbol": "A", "children": [] }
              ]
            }
          ]
        },
        { "symbol": "&", "children": [] },
        {
          "symbol": "Factor",
          "children": [
            { "symbol": "B", "children": [] }
          ]
        }
      ]
    }
  ]
}
```

---

## Por que solo un model

La aplicacion solo necesita representar una estructura de datos: el arbol.
Los tokens son diccionarios simples porque no necesitan metodos propios.
Si la aplicacion creciera (por ejemplo, guardando historico de analisis),
se agregarian mas models como `HistorialAnalisis` o `Expresion`.