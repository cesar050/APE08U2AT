# Documentacion del frontend

## Estructura general

El frontend esta construido con Angular 21 usando componentes standalone.

```
frontend/src/app/
  components/
    entrada/      <- panel izquierdo con input y tabla lexica
    derivacion/   <- tab que muestra la derivacion por izquierda
    arbol/        <- tab que muestra el arbol nodo por nodo
  services/
    grammar.ts    <- comunicacion con el backend
  app.ts          <- componente raiz
  app.html        <- layout principal con tabs
  app.css         <- estilos del layout
```

---

## Como esta organizado visualmente

La pantalla se divide en dos paneles que ocupan toda la altura sin scroll:

Panel izquierdo (ancho fijo de 420px)
Contiene el componente app-entrada. Aqui el usuario construye su expresion
usando los botones de operadores y variables, o escribiendo directamente.
Mientras escribe, aparece la tabla de analisis lexico en tiempo real.

Panel derecho (ocupa el resto del ancho)
Contiene dos tabs: Derivacion y Arbol. Solo uno es visible a la vez.
Cuando el usuario presiona Analizar, los resultados aparecen en este panel.
Antes de analizar, el panel derecho muestra un mensaje de bienvenida.

---

## Servicio GrammarService

`services/grammar.ts`

Es el unico punto de contacto con el backend.
Todos los componentes que necesitan datos del servidor los piden a traves de este servicio.
Ningun componente hace peticiones HTTP directamente.

Interfaces definidas en este archivo:

`TokenLexico`: representa un token con su valor, tipo y posicion.

`TreeNode`: representa un nodo del arbol con su simbolo y sus hijos.
Es una interfaz recursiva porque `children` es una lista de `TreeNode`.

`AnalisisResult`: resultado completo del analisis. Contiene expresion,
tokens, tabla lexica, pasos de derivacion y arbol.

`ValidacionResult`: resultado de la validacion en tiempo real.
Contiene la tabla lexica y un posible error.

Metodo `analizar(expresion)`:
Envia la expresion completa al endpoint `/api/analizar`.
Retorna un Observable que emite un `AnalisisResult` cuando el servidor responde.

Metodo `validar(expresion)`:
Envia la expresion parcial al endpoint `/api/validar`.
Se llama en cada cambio del input para actualizar la tabla lexica.
Solo ejecuta el lexer en el backend, no el parser completo.

---

## Componente EntradaComponent

`components/entrada/`

Responsabilidades:
- Mostrar los botones de operadores y variables
- Gestionar el input de la expresion
- Llamar a `validar()` en cada tecla para actualizar la tabla lexica
- Mostrar errores de sintaxis en tiempo real con color rojo en el input
- Llamar a `analizar()` cuando el usuario presiona el boton
- Emitir el resultado al componente padre mediante @Output resultadoEmitido

El decorador `@Output()` permite que un componente hijo envie datos al padre.
Cuando el usuario presiona Analizar y el backend responde, EntradaComponent
emite el resultado usando `resultadoEmitido.emit(resultado)`.
AppComponent lo recibe en el metodo `onResultado()`.

La tabla lexica se actualiza usando el evento `(ngModelChange)` en el input.
Cada vez que el valor cambia, se llama a `onInput()` que llama al servicio `validar()`.

Cada fila de la tabla tiene un color segun el tipo de token:
- Amarillo: identificadores (ID)
- Azul: operador AND
- Verde: operador OR
- Rojo: operador NOT
- Morado: parentesis

El boton Analizar queda deshabilitado si hay un error de validacion en tiempo real.
Esto evita enviar expresiones invalidas al backend.

---

## Componente DerivacionComponent

`components/derivacion/`

Recibe el resultado del analisis mediante @Input resultado.
Muestra directamente todos los pasos de la derivacion por izquierda sin interaccion adicional.

Cada paso tiene un color segun el nivel de la gramatica al que pertenece:
- Morado: pasos que aplican reglas de Exp (nivel 1)
- Verde: pasos que aplican reglas de Term (nivel 2)
- Naranja: pasos que aplican reglas de Factor (nivel 3)

El metodo `claseDelPaso(paso)` determina el color leyendo los primeros caracteres del paso.
Si empieza con "Exp" es nivel 1, si empieza con "Term" es nivel 2, si empieza con "Factor" es nivel 3.

---

## Componente ArbolComponent

`components/arbol/`

Recibe el arbol de derivacion mediante @Input arbol.
Dibuja el arbol usando SVG dentro del template Angular.

### Algoritmo de posicionamiento en dos pasadas

El arbol se dibuja con un algoritmo en dos pasadas porque no es posible
calcular la posicion del padre antes de saber donde quedaron sus hijos.

Pasada 1 - calcular posiciones:

Las hojas se numeran de izquierda a derecha con un espacio fijo (`EH = 60px`) entre ellas.
Un contador `hojas` va incrementando cada vez que se llega a un nodo sin hijos.
Los nodos internos se centran sobre sus hijos: su x es el promedio entre
el x del hijo mas a la izquierda y el x del hijo mas a la derecha.
Cada nivel baja `EV = 90px` mas que el nivel anterior.

Al final de la pasada 1, cada nodo tiene su posicion definitiva en un Map.

Pasada 2 - trazar lineas:

Se recorre el arbol de nuevo y para cada par padre-hijo se crea una linea
usando las coordenadas ya calculadas del Map.
Esto garantiza que todas las lineas conecten exactamente los nodos correctos.

Por que no se puede hacer en una sola pasada?
Porque en la recursion, cuando se procesa el padre, los hijos todavia no han
calculado su posicion x definitiva. Si se trazara la linea en ese momento,
el x del hijo seria 0 y la linea quedaria mal.

### Orden de aparicion de los nodos

Los nodos se insertan en el arreglo `nodos` usando `unshift()` en vez de `push()`.

`push()` agrega al final del arreglo.
`unshift()` agrega al inicio del arreglo.

Dado que el algoritmo es recursivo y procesa los hijos antes que el padre
(post-order), sin `unshift()` los nodos quedarian en orden de hojas primero.
Con `unshift()` el padre queda siempre antes que sus hijos,
lo que hace que al presionar Siguiente los nodos aparezcan de raiz hacia abajo.

### Navegacion con botones

El atributo `paso` es un contador que indica cuantos nodos son visibles.
Al presionar Siguiente, `paso` aumenta en 1 y el nodo en esa posicion se hace visible.
Al presionar Anterior, `paso` disminuye en 1 y el ultimo nodo visible se oculta.
Esto permite construir el arbol paso a paso para explicar cada nodo en la defensa.

---

## AppComponent

`app.ts` y `app.html`

Es el componente raiz. Coordina los demas componentes.

Cuando EntradaComponent emite un resultado mediante resultadoEmitido,
AppComponent lo recibe en el metodo `onResultado()` y lo almacena en `resultado`.
Luego Angular propaga ese valor a DerivacionComponent y ArbolComponent mediante @Input.

### Por que los tabs usan style.display en vez de *ngIf

Con `*ngIf`, Angular destruye el componente cuando su condicion es falsa
y lo recrea cuando vuelve a ser verdadera. Al recrearlo pierde todo su estado:
cuantos nodos son visibles en el arbol, en que paso va la navegacion.

Con `[style.display]="tabActivo === 'arbol' ? 'flex' : 'none'"` el componente
siempre existe en el DOM. Solo cambia su visibilidad CSS.
El estado se conserva aunque el usuario cambie de tab y vuelva.

---

## Como levantar el frontend

```bash
cd frontend
npm install
ng serve
```

La aplicacion queda disponible en http://localhost:4200.
El backend debe estar corriendo en http://localhost:5000 para que funcione.