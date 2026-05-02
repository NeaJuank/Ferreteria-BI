# ETL Project - Ferretería BI

Este proyecto contiene un pipeline ETL en Python para procesar el archivo Excel de datos de la ferretería y generar un archivo limpio de salida.

## Requisitos

- Python 3.11+ recomendado
- `pip` disponible
- `venv` o cualquier entorno virtual de Python

## Instalación rápida

1. Abre una terminal en `etl_project`:

```bash
cd "c:\Users\migue\OneDrive\Documentos\ferreteria project\Ferreteria-BI\etl_project"
```

2. Crea y activa un entorno virtual:

```bash
python -m venv .venv
.\.venv\Scripts\activate
```

3. Instala dependencias:

```bash
pip install -r requirements.txt
```

## Ejecutar el ETL

1. Coloca el archivo de entrada `ferreteria_50000_datos_modificado.xlsx` dentro de `etl_project`.
2. Ejecuta el script principal:

```bash
python main.py
```

3. El archivo de salida se generará en:

```bash
data\output.xlsx
```

## Qué hace el pipeline

- Lee el Excel de entrada.
- Normaliza los encabezados y valores de texto.
- Convierte fechas a formato `YYYY-MM-DD` y elimina la hora.
- Da formato a valores numéricos de `valor unitario` y `valor total` sin centavos.
- Rellena campos vacíos con `N/A`.
- Aplica correcciones de datos mal ubicados (por ejemplo, ciudades que aparecen en columnas incorrectas).

## Regenerar `requirements.txt`

Si instalas o actualizas paquetes, genera de nuevo el archivo de dependencias con:

```bash
pip freeze > requirements.txt
```

## Notas

- Si quieres ejecutar el proyecto desde otro directorio, ajusta la ruta de entrada/salida en `main.py`.
- El ETL está diseñado para ejecutarse directamente en Windows.

## Supabase

1. Copia `etl_project/.env.example` a `etl_project/.env` y completa:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

2. Crea las tablas en Supabase usando `etl_project/supabase_schema.sql`.

3. Ejecuta la limpieza total de datos si necesitas comenzar desde cero:

```bash
cd "c:\Users\migue\OneDrive\Documentos\ferreteria project\Ferreteria-BI\etl_project"
python supabase_clean.py
```

Luego, para resetear los contadores de ID (evitar que sigan creciendo desde 50k):
- Abre [Supabase SQL Editor](https://supabase.com/)
- Copia y pega el contenido de `supabase_reset_sequences.sql`
- Ejecuta

4. Sube los datos limpios al warehouse:

```bash
python load.py
```

### Qué hace la carga a Supabase

- inserta valores únicos en `dim_segmento_cliente`, `dim_producto`, `dim_vendedor`, `dim_metodo_pago` y `dim_tiempo`
- luego inserta los registros en `fact_ventas`
- las claves foráneas se resuelven usando los valores ya cargados en las dimensiones
