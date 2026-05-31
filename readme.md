# CFG Analyzer - APE 08

Analizador de expresiones logicas booleanas basado en Gramaticas Libres de Contexto.
Construido con Flask (backend) y Angular 21 (frontend).

## Requisitos

- Python 3.10 o superior
- Node.js 20 o superior
- Angular CLI 21

## Estructura del proyecto

```
APE08U2AT/
  backend/       <- API Flask
  frontend/      <- Aplicacion Angular
  docs/          <- Documentacion tecnica
```

## Levantar el backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install flask flask-cors
python run.py
```

El backend queda disponible en http://localhost:5000.

Para verificar que esta corriendo:

```bash
curl http://localhost:5000/api/health
```

Debe retornar: `{"status": "ok"}`

## Levantar el frontend

Abrir una terminal separada:

```bash
cd frontend
npm install
ng serve
```

La aplicacion queda disponible en http://localhost:4200.

## Uso

1. Escribe una expresion booleana en el panel izquierdo o usa los botones de operadores y variables.
2. La tabla de analisis lexico aparece en tiempo real mientras escribes.
3. Si hay un error en la expresion, el input se marca en rojo y el boton queda deshabilitado.
4. Presiona Analizar expresion.
5. En el tab Derivacion aparecen todos los pasos de la derivacion por izquierda.
6. En el tab Arbol puedes construir el arbol nodo por nodo con los botones Anterior y Siguiente.

## Endpoints disponibles

| Metodo | Ruta           | Descripcion                              |
|--------|----------------|------------------------------------------|
| POST   | /api/analizar  | Analiza una expresion completa           |
| POST   | /api/validar   | Valida una expresion en tiempo real      |
| GET    | /api/health    | Verifica que el servidor esta corriendo  |

## Documentacion adicional

- `docs/EJERCICIOS.md` - logica detallada de los ejercicios y como analizar cualquier expresion
- `docs/BACKEND.md`   - documentacion tecnica del backend: models, services y routers
- `docs/FRONTEND.md`  - documentacion del frontend: componentes, servicio y algoritmos

## Repositorio

https://github.com/cesar050/APE08U2AT