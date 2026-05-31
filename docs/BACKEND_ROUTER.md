# Services del backend

## Que es un service

Un service contiene la logica de negocio de la aplicacion.
No sabe nada de HTTP ni de como se muestran los datos.
Su unica responsabilidad es recibir datos, procesarlos y retornar un resultado.

En este proyecto hay dos services: el lexer y el parser.

---

## Lexer

Archivo: `backend/app/services/lexer.py`

El lexer es el primer paso del analisis. Recibe la expresion como texto
y la convierte en una lista de tokens.

### Que es un token

Un token es la unidad minima con significado en una expresion.
La expresion `A & ~ B` tiene cuatro tokens: `A`, `&`, `~`, `B`.
El lexer identifica a que categoria pertenece cada uno.

### Tipos de tokens

| Tipo    | Simbolo | Descripcion              |
|---------|---------|--------------------------|
| ID      | A, B, C | Identificador o variable |
| AND     | &       | Operador AND             |
| OR      | pipe    | Operador OR              |
| NOT     | ~       | Operador NOT             |
| LPAREN  | (       | Parentesis izquierdo     |
| RPAREN  | )       | Parentesis derecho       |

### Como funciona internamente

```python
def tokenizar(expresion: str) -> list:
    tokens = []
    i = 0
    while i < len(expresion):
        char = expresion[i]
        if char == ' ':
            i += 1
            continue
        if char in TIPOS_TOKEN:
            tokens.append({"valor": char, "tipo": TIPOS_TOKEN[char], "posicion": i})
            i += 1
        elif char.isalpha():
            j = i
            while j < len(expresion) and expresion[j].isalpha():
                j += 1
            tokens.append({"valor": expresion[i:j], "tipo": "ID", "posicion": i})
            i = j
        else:
            raise ValueError(f"Caracter no reconocido: '{char}' en posicion {i}")
```

El lexer recorre la cadena caracter por caracter con el indice `i`.

Cuando encuentra un espacio, lo salta y avanza.

Cuando encuentra un operador (`&`, `|`, `~`, `(`, `)`), lo registra
inmediatamente y avanza un lugar.

Cuando encuentra una letra, abre un segundo indice `j` y sigue leyendo
hasta que ya no haya letras. Esto captura nombres de variable completos.
Al terminar, `expresion[i:j]` es el nombre completo de la variable.

Cuando encuentra un caracter que no es ni espacio, ni operador, ni letra,
lanza un `ValueError` con la posicion exacta del error.
Esto permite mostrar al usuario donde esta el problema.

### Formato de cada token

Cada token es un diccionario con tres campos:

```python
{
    "valor": "A",        # el texto original tal como aparece en la expresion
    "tipo": "ID",        # la categoria del token
    "posicion": 0        # posicion en la cadena original (para reportar errores)
}
```

---

## Parser

Archivo: `backend/app/services/parser.py`

El parser recibe la lista de tokens del lexer y construye el arbol de derivacion.
Tambien registra cada paso de la derivacion por izquierda.

### Tipo de parser: recursivo descendente

Este parser es recursivo descendente porque:
- Hay una funcion por cada nivel de la gramatica.
- Las funciones se llaman entre si siguiendo la jerarquia de la gramatica.
- Empieza desde el simbolo inicial (Exp) y desciende hacia los terminales.

La gramatica implementada es:

```
Exp    -> Exp | Term  |  Term
Term   -> Term & Factor  |  Factor
Factor -> ~ Factor  |  ( Exp )  |  id
```

### Atributos del parser

`tokens`: lista de tokens recibida del lexer.

`pos`: puntero a la posicion actual en la lista de tokens.
Empieza en 0 y avanza cada vez que se consume un token.

`pasos`: lista de strings que registra cada produccion aplicada.
Al final contiene la derivacion por izquierda completa en orden.

### Metodos de soporte

`token_actual()`: retorna el token en la posicion actual sin avanzar.
Se usa para mirar que viene antes de decidir que produccion aplicar.

`valor_actual()`: retorna solo el campo "valor" del token actual.
Atajo para no escribir `token_actual()["valor"]` en cada comparacion.

`consumir(esperado)`: verifica que el token actual sea el esperado y avanza.
Si no coincide lanza SyntaxError con mensaje descriptivo.
Es la unica forma de avanzar el puntero.

`registrar(produccion)`: agrega un paso a la lista `pasos`.
Se llama cada vez que se aplica una produccion de la gramatica.

### Metodo exp — Nivel 1

Corresponde a la regla: `Exp -> Exp | Term | Term`

```python
def exp(self):
    nodo = TreeNode("Exp")
    izq = self.term()
    if self.valor_actual() == "|":
        self.registrar("Exp -> Exp | Term")
        exp_izq = TreeNode("Exp")
        exp_izq.add_child(izq)
        nodo.add_child(exp_izq)
        self.consumir("|")
        nodo.add_child(TreeNode("|"))
        nodo.add_child(self.term())
    else:
        self.registrar("Exp -> Term")
        nodo.add_child(izq)
    return nodo
```

Primero llama a `term()` para obtener el lado izquierdo.
Luego mira si el siguiente token es `|`.
Si lo es, envuelve el resultado de `term()` en un nodo Exp izquierdo,
consume el `|` y llama a `term()` para el lado derecho.
Si no hay `|`, el Exp es simplemente un Term.

### Metodo term — Nivel 2

Corresponde a la regla: `Term -> Term & Factor | Factor`

Identico en estructura a `exp()` pero busca `&` en vez de `|`
y llama a `factor()` en vez de `term()` para el lado derecho.

### Metodo factor — Nivel 3

Corresponde a la regla: `Factor -> ~ Factor | ( Exp ) | id`

Tiene tres casos segun el token actual:

Caso `~`:
Consume el operador, agrega un nodo `~` como hijo,
y llama a `factor()` de nuevo para procesar lo que sigue.
Esta es una recursion directa: un Factor puede contener otro Factor.

Caso `(`:
Consume el parentesis de apertura, agrega un nodo `(`,
llama a `exp()` para procesar todo el contenido del parentesis desde el nivel 1,
verifica que venga `)` y lo consume.
Esto es lo que permite que los parentesis inviertan la precedencia:
al llamar a `exp()` adentro, el nivel 1 busca el `|` dentro del parentesis.

Caso variable (id):
Si el token actual es una letra, lo consume y crea un nodo terminal con su valor.
Este es el caso base de la recursion: no llama a ninguna otra funcion.

Si no se cumple ninguno de los tres casos, la expresion es invalida
y se lanza un SyntaxError con un mensaje que indica que se encontro.

### Como se construye el arbol

Cada funcion crea un TreeNode con el nombre del no-terminal (`Exp`, `Term`, `Factor`)
y le agrega hijos a medida que procesa los tokens.
Los nodos terminales (`A`, `B`, `&`, `|`, `~`, `(`, `)`) no tienen hijos.
Al retornar, cada funcion entrega su nodo al llamador que lo agrega como hijo propio.
El resultado final es un arbol completo con `Exp` como raiz.