# Logica de los ejercicios CFG

## Como leer cualquier expresion booleana

Antes de ver los ejercicios, hay una regla que aplica siempre:
la gramatica tiene tres niveles y el parser siempre empieza por el nivel 1.
Nunca se salta niveles. Nunca empieza por el medio.

Los tres niveles y su trabajo:

- Nivel 1 (Exp): busca el operador OR `|`. Si lo encuentra, parte la expresion en dos.
- Nivel 2 (Term): busca el operador AND `&`. Si lo encuentra, parte en dos.
- Nivel 3 (Factor): busca el NOT `~`, un parentesis `(`, o una variable `id`.

La jerarquia existe para garantizar precedencia. El `~` se resuelve antes que el `&`,
y el `&` se resuelve antes que el `|`. Igual que en matematicas donde `x` va antes que `+`.

---

## Regla para analizar cualquier expresion

1. El parser entra al nivel 1 y pregunta: hay un `|` fuera de parentesis?
   - Si si: parte ahi. Lado izquierdo es Exp, lado derecho es Term.
   - Si no: pasa al nivel 2.

2. El nivel 2 pregunta: hay un `&` fuera de parentesis?
   - Si si: parte ahi. Lado izquierdo es Term, lado derecho es Factor.
   - Si no: pasa al nivel 3.

3. El nivel 3 pregunta: empieza con `~`? con `(`? es una variable?
   - `~`: niega lo que sigue. Lo que sigue es otro Factor.
   - `(`: abre un nuevo contexto. Lo de adentro se procesa desde el nivel 1 de nuevo.
   - variable: terminal, no se descompone mas.

La clave es que los parentesis reinician el proceso desde el nivel 1 adentro de ellos.
Por eso pueden forzar que un `|` se resuelva antes que un `&`.

---

## Ejercicio 1: A & ~ B | C

### Que significa

En lenguaje natural: "(A y no B) o C".

El `&` tiene mayor precedencia que el `|`, entonces primero se calcula `A & ~B`
y luego ese resultado se une con `C` mediante el `|`.

### Recorrido nivel por nivel

El parser recibe `A & ~ B | C`.

Nivel 1 pregunta: hay un `|`?
Si, hay uno. Parte la expresion:

```
izquierda -> A & ~ B    (esto es Exp)
operador  -> |
derecha   -> C          (esto es Term)
```

Nivel 2 recibe `A & ~ B` y pregunta: hay un `&`?
Si, hay uno. Parte:

```
izquierda -> A          (esto es Term)
operador  -> &
derecha   -> ~ B        (esto es Factor)
```

Nivel 3 recibe `A` y pregunta: es una variable?
Si. Terminal. No se descompone mas.

Nivel 3 recibe `~ B` y pregunta: empieza con `~`?
Si. Parte:

```
operador -> ~
resto    -> B    (Factor, terminal)
```

Nivel 1 recibe `C` desde el lado derecho del `|`.
Baja por nivel 2 y nivel 3 hasta llegar a terminal.

### Derivacion por izquierda

```
Exp
=> Exp | Term
=> Term | Term
=> Term & Factor | Term
=> Factor & Factor | Term
=> A & Factor | Term
=> A & ~ Factor | Term
=> A & ~ B | Term
=> A & ~ B | Factor
=> A & ~ B | C
```

### Arbol

```
         Exp
        / | \
      Exp  |  Term
       |       |
      Term   Factor
     / | \     |
  Term & Factor  C
   |      / \
 Factor  ~  Factor
   |          |
   A           B
```

### Por que no es ambiguo

Solo existe un arbol posible para esta expresion. El `|` solo puede aparecer
en el nivel Exp y el `&` solo puede aparecer en el nivel Term. No hay dos reglas
que compitan por el mismo operador, por lo tanto el arbol es unico.

---

## Ejercicio 2: ~ ( A | B ) & C

### Que significa

En lenguaje natural: "no (A o B), y C".

Los parentesis fuerzan que el `|` se resuelva antes que el `&`.
Sin parentesis, el `&` ganaria. Con parentesis, el `|` queda encapsulado
y el parser lo procesa primero como una unidad completa.

### Recorrido nivel por nivel

El parser recibe `~ ( A | B ) & C`.

Nivel 1 pregunta: hay un `|` fuera de parentesis?
No hay ninguno fuera. Pasa al nivel 2.

Nivel 2 pregunta: hay un `&`?
Si, hay uno. Parte:

```
izquierda -> ~ ( A | B )    (esto es Term)
operador  -> &
derecha   -> C              (esto es Factor)
```

Nivel 3 recibe `~ ( A | B )` y pregunta: empieza con `~`?
Si. Parte:

```
operador -> ~
resto    -> ( A | B )    (Factor con parentesis)
```

Nivel 3 recibe `( A | B )` y pregunta: empieza con `(`?
Si. Abre el parentesis y procesa `A | B` desde el nivel 1 de nuevo.

Nivel 1 adentro del parentesis pregunta: hay un `|`?
Si. Parte:

```
izquierda -> A    (Exp)
operador  -> |
derecha   -> B    (Term)
```

`A` y `B` son terminales. Fin del contenido del parentesis.

Nivel 3 recibe `C` desde el lado derecho del `&`.
Terminal. Fin.

### Derivacion por izquierda

```
Exp
=> Term
=> Term & Factor
=> Factor & Factor
=> ~ Factor & Factor
=> ~ ( Exp ) & Factor
=> ~ ( Exp | Term ) & Factor
=> ~ ( Term | Term ) & Factor
=> ~ ( Factor | Term ) & Factor
=> ~ ( A | Term ) & Factor
=> ~ ( A | Factor ) & Factor
=> ~ ( A | B ) & Factor
=> ~ ( A | B ) & C
```

### Arbol

```
          Exp
           |
          Term
         / | \
      Term  &  Factor
       |          |
     Factor        C
     / \
    ~  Factor
       / | \
      ( Exp )
        / | \
      Exp  |  Term
       |        |
      Term    Factor
       |        |
     Factor     B
       |
       A
```

### Por que no es ambiguo

Los parentesis hacen que el `|` quede dentro de un Factor,
lo que lo separa completamente del nivel Exp. El parser no tiene
ninguna ambiguedad porque cada simbolo pertenece a un solo nivel.

---

## Como analizar cualquier expresion nueva

Cuando el docente ingrese una expresion diferente, el procedimiento es siempre el mismo:

1. Busca el `|` mas externo (fuera de parentesis). Si existe, ese es el punto de corte del nivel 1.
2. Si no hay `|`, busca el `&` mas externo. Ese es el punto de corte del nivel 2.
3. Si no hay ninguno de los dos, lo que tienes es un Factor: una variable, un `~`, o algo entre parentesis.
4. Si hay parentesis, repite el proceso desde el paso 1 con el contenido de adentro.

El arbol se construye de arriba hacia abajo siguiendo exactamente esos cortes.
Las hojas del arbol leidas de izquierda a derecha siempre reconstruyen la expresion original.