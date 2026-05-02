from __future__ import annotations

from pathlib import Path
from typing import Any
import pandas as pd
from postgrest import APIError
from supabaseClient.supabase_client import get_supabase_client
from etl.utils import normalize_header, logging_etl_process, logging_step_process



def save_excel(df: pd.DataFrame, path: Path | str) -> None:
    logging_etl_process(f"Guardando archivo de salida en: {path}")
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    df.to_excel(path, index=False, engine="openpyxl")
    logging_etl_process(f"Archivo de salida generado exitosamente")


def normalize_value(value: Any) -> Any:
    if pd.isna(value):
        return None

    text = str(value).strip()
    if not text or text.upper() == "N/A":
        return None

    return text


def parse_currency(value: Any) -> float | None:
    if pd.isna(value):
        return None

    if isinstance(value, (int, float)):
        return float(value)

    text = str(value).strip().replace(" ", "")
    if not text or text.upper() == "N/A":
        return None

    text = text.replace(",", ".")
    try:
        return float(text)
    except ValueError:
        filtered = "".join(ch for ch in text if ch.isdigit() or ch == ".")
        if not filtered:
            return None
        try:
            return float(filtered)
        except ValueError:
            return None


def _chunked(iterable: list[Any], size: int) -> list[list[Any]]:
    return [iterable[i : i + size] for i in range(0, len(iterable), size)]


def _insert_dimension_rows(client: Any, table: str, key_columns: list[str], rows: list[dict[str, Any]]) -> dict[tuple, int]:
    print(f"[Supabase] Preparando dimensión {table}")
    try:
        response = client.table(table).select("*").execute()
    except APIError as exc:
        raise RuntimeError(f"Error al leer dimensión {table}: {exc}") from exc

    existing_rows = response.data or []
    existing_map: dict[tuple, int] = {
        tuple(row[col] for col in key_columns): row["id"] for row in existing_rows if all(col in row for col in key_columns)
    }

    missing_map: dict[tuple, dict[str, Any]] = {}
    for row in rows:
        key = tuple(row.get(col) for col in key_columns)
        if all(value is None for value in key):
            continue
        if key not in existing_map and key not in missing_map:
            missing_map[key] = row

    if missing_map:
        for batch in _chunked(list(missing_map.values()), 100):
            try:
                resp = client.table(table).insert(batch).execute()
            except APIError as exc:
                raise RuntimeError(f"Error al insertar en {table}: {exc}") from exc
            for item in resp.data or []:
                key = tuple(item.get(col) for col in key_columns)
                existing_map[key] = item["id"]

    return existing_map


def _pick_column(df: pd.DataFrame, candidates: list[str]) -> str | None:
    for candidate in candidates:
        if candidate in df.columns:
            return candidate
    return None


def upload_to_supabase(df: pd.DataFrame) -> None:
    client = get_supabase_client()
    
    logging_step_process(f"cargando datos al cloud storage")
    # Normalizar encabezados para soportar acentos y variaciones de nombre
    df = df.rename(columns={col: normalize_header(col) for col in df.columns})

    cliente_col = _pick_column(df, ["cliente", "nombre cliente", "nombre_cliente"])
    proveedor_col = _pick_column(df, ["proveedor"])
    ciudad_col = _pick_column(df, ["ciudad"])
    zona_col = _pick_column(df, ["zona"])
    tipo_cliente_col = _pick_column(df, ["tipo de cliente", "tipo_cliente"])
    producto_col = _pick_column(df, ["producto"])
    categoria_col = _pick_column(df, ["categoria", "categoría"])
    color_col = _pick_column(df, ["color"])
    vendedor_col = _pick_column(df, ["vendedor"])
    metodo_col = _pick_column(df, ["metodo de pago", "método de pago"])
    fecha_col = _pick_column(df, ["fecha"])
    mes_col = _pick_column(df, ["mes"])
    ano_col = _pick_column(df, ["ano", "año"])
    dia_col = _pick_column(df, ["dia", "día"])
    factura_col = _pick_column(df, ["factura"])
    cantidad_col = _pick_column(df, ["cantidad"])
    valor_unitario_col = _pick_column(df, ["valor unitario"])
    valor_total_col = _pick_column(df, ["valor total"])

    segmento_rows = []
    if any([ciudad_col, zona_col, tipo_cliente_col, proveedor_col]):
        segmento_rows = [
            {
                "ciudad": normalize_value(row[ciudad_col]) if ciudad_col else None,
                "zona": normalize_value(row[zona_col]) if zona_col else None,
                "tipo_cliente": normalize_value(row[tipo_cliente_col]) if tipo_cliente_col else None,
                "proveedor": normalize_value(row[proveedor_col]) if proveedor_col else None,
            }
            for _, row in df.iterrows()
        ]

    producto_rows = []
    if producto_col:
        producto_rows = [
            {
                "nombre": normalize_value(row[producto_col]),
                "categoria": normalize_value(row[categoria_col]) if categoria_col else None,
                "color": normalize_value(row[color_col]) if color_col else None,
            }
            for _, row in df.iterrows()
        ]

    vendedor_rows = []
    if vendedor_col:
        vendedor_rows = [{"nombre": normalize_value(row[vendedor_col])} for _, row in df.iterrows()]

    metodo_rows = []
    if metodo_col:
        metodo_rows = [{"metodo": normalize_value(row[metodo_col])} for _, row in df.iterrows()]

    tiempo_rows = []
    if fecha_col:
        tiempo_rows = [
            {
                "fecha": normalize_value(row[fecha_col]),
                "año": int(row[ano_col]) if ano_col and pd.notna(row[ano_col]) else None,
                "mes": int(row[mes_col]) if mes_col and pd.notna(row[mes_col]) else None,
                "dia": int(row[dia_col]) if dia_col and pd.notna(row[dia_col]) else None,
            }
            for _, row in df.iterrows()
        ]

    segmento_map = {}
    if segmento_rows:
        segmento_map = _insert_dimension_rows(client, "dim_segmento_cliente", ["ciudad", "zona", "tipo_cliente", "proveedor"], segmento_rows)

    producto_map = {}
    if producto_rows:
        producto_map = _insert_dimension_rows(client, "dim_producto", ["nombre", "categoria", "color"], producto_rows)

    vendedor_map = {}
    if vendedor_rows:
        vendedor_map = _insert_dimension_rows(client, "dim_vendedor", ["nombre"], vendedor_rows)

    metodo_map = {}
    if metodo_rows:
        metodo_map = _insert_dimension_rows(client, "dim_metodo_pago", ["metodo"], metodo_rows)

    tiempo_map = {}
    if tiempo_rows:
        tiempo_map = _insert_dimension_rows(client, "dim_tiempo", ["fecha"], tiempo_rows)

    print("[Supabase] Insertando hechos en fact_ventas")
    fact_rows: list[dict[str, Any]] = []
    for _, row in df.iterrows():
        fact_rows.append(
            {
                "factura": normalize_value(row[factura_col]) if factura_col else None,
                "segmento_cliente_id": segmento_map.get(
                    (
                        normalize_value(row[ciudad_col]) if ciudad_col else None,
                        normalize_value(row[zona_col]) if zona_col else None,
                        normalize_value(row[tipo_cliente_col]) if tipo_cliente_col else None,
                        normalize_value(row[proveedor_col]) if proveedor_col else None,
                    )
                ),
                "producto_id": producto_map.get(
                    (
                        normalize_value(row[producto_col]) if producto_col else None,
                        normalize_value(row[categoria_col]) if categoria_col else None,
                        normalize_value(row[color_col]) if color_col else None,
                    )
                ),
                "vendedor_id": vendedor_map.get((normalize_value(row[vendedor_col]),)) if vendedor_col else None,
                "metodo_pago_id": metodo_map.get((normalize_value(row[metodo_col]),)) if metodo_col else None,
                "tiempo_id": tiempo_map.get((normalize_value(row[fecha_col]),)) if fecha_col else None,
                "cantidad": int(row[cantidad_col]) if cantidad_col and pd.notna(row[cantidad_col]) else None,
                "valor_unitario": parse_currency(row[valor_unitario_col]) if valor_unitario_col else None,
                "valor_total": parse_currency(row[valor_total_col]) if valor_total_col else None,
            }
        )

    for batch in _chunked(fact_rows, 500):
        try:
            client.table("fact_ventas").insert(batch).execute()
        except APIError as exc:
            raise RuntimeError(f"Error al insertar hechos: {exc}") from exc

    print("[Supabase] Carga de datos completada")


if __name__ == "__main__":
    excel_path = Path(__file__).parent.parent / "data" / "output.xlsx"
    if not excel_path.exists():
        raise FileNotFoundError(f"No se encontró el archivo de salida: {excel_path}")

    print(f"[Supabase] Cargando datos desde {excel_path}")
    df = pd.read_excel(excel_path, engine="openpyxl")
    upload_to_supabase(df)
