# Ferretería BI

Este repositorio combina una aplicación React/Vite y un pipeline ETL en Python.

## React / Frontend

### Requisitos

- Node.js 18+ o compatible
- Yarn o npm

### Instalar dependencias

```bash
cd "c:\Users\migue\OneDrive\Documentos\ferreteria project\Ferreteria-BI"
# Si usas npm
npm install
# Si usas Yarn
yarn install
```

### Ejecutar la aplicación en modo desarrollo

```bash
npm run dev
# o
yarn dev
```

La aplicación quedará disponible en `http://localhost:3000`.

## Backend / ETL Python

### Requisitos

- Python 3.11+
- `pip`

### Instalar dependencias

```bash
pip install -r requirements.txt
```

### Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto `Ferreteria-BI` con las siguientes variables. Quitar los $:

```env
SUPABASE_URL= $https$://wbucudmgdxzjycszfmws.supabase.co$
SUPABASE_KEY= $sb_$secret_UpyW1e4qziE21uGtazPRtg_jrJZb_oP$
```

### Ejecutar pipeline ETL

```bash
py -m etl.main
```

### Salida

El archivo generado sale en:

```bash
etl/data/output.xlsx
```

## Notas

- El frontend y el ETL son independientes.
- El ETL se ejecuta dentro de `etl_project`.
- La aplicación React se inicia desde la raíz del repositorio.
- El etl generado se subirá a supabse donde se consumira los datos para el dashboard

## Notas 2:
- si se genera problemas al hacer el yarn install, probablemente se deba a la version del yarn. se recomienda eliminar el yarn lock, los pnp's, y la carpeta yarn, con eso seria suficiente
