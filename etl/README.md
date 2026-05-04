# ETL Project - Ferretería BI

Este proyecto contiene un pipeline ETL en Python para procesar el archivo Excel de datos de la ferretería y generar un archivo limpio de salida.

## Requisitos

- Python 3.11+ recomendado
- `pip` disponible
- `venv` o cualquier entorno virtual de Python

## Instalación rápida

1. Abre una terminal en `etl_project`:

```bash
cd "....\Ferreteria-BI"
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
py -m etl.main
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

Si actualizas paquetes nuevos, genera de nuevo el archivo de dependencias con:

```bash
pip freeze > requirements.txt
```

## Supabase

1. Copia el archivo `.env.example` y renómbralo a `.env` en la raíz del proyecto. Reemplaza los valores de ejemplo con tus credenciales reales de Supabase:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-service-key
```

2. Si no deseas subir datos a Supabase, el pipeline aún generará `etl/data/output.xlsx` localmente.

3. Tablas de Supabase por si no se desea mirar allí: `supabase_schema.sql`.

3. Ejecuta la limpieza total de datos si necesitas comenzar desde cero:

```bash
py supabaseClient.supabase_clean
```

Luego, para resetear los contadores de ID (evitar que sigan creciendo desde 50k):
- Abre [Supabase SQL Editor](https://supabase.com/)
- Copia y pega el contenido de `supabase_reset_sequences.sql`
- Ejecuta

4. Sube los datos limpios al warehouse si ya existe el output y no se desea generar otra vez:

```bash
python etl.etl_process.load
```

### Qué hace la carga a Supabase

- inserta valores únicos en `dim_segmento_cliente`, `dim_producto`, `dim_vendedor`, `dim_metodo_pago` y `dim_tiempo`
- luego inserta los registros en `fact_ventas`
- las claves foráneas se resuelven usando los valores ya cargados en las dimensiones
