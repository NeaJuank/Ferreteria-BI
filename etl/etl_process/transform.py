from pathlib import Path

import pandas as pd
from utils import logging_etl_process, logging_step_process

from utils import (
    normalize_header,
    normalize_text,
    parse_date,
    parse_float,
    parse_int,
    validate_text_field,
)

EXPECTED_COLUMNS = [
    "factura",
    "fecha",
    "zona",
    "ciudad",
    "vendedor",
    "producto",
    "color",
    "cantidad",
    "valor unitario",
    "valor total",
    "mes",
    "año",
    "categoría",
    "proveedor",
    "método de pago",
    "tipo de cliente",
    "día",
]

TEXT_COLUMNS = {
    "factura",
    "zona",
    "ciudad",
    "vendedor",
    "producto",
    "color",
    "categoría",
    "proveedor",
    "método de pago",
    "tipo de cliente",
}

NUMERIC_COLUMNS = {
    "cantidad",
    "valor unitario",
    "valor total",
    "mes",
    "año",
    "día",
}

DATE_COLUMNS = {"fecha"}


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    logging_step_process("Limpiando y transformando los datos")
    df = df.copy()

    normalized_headers = [normalize_header(col) for col in df.columns]
    header_map = {normalize_header(col): col for col in EXPECTED_COLUMNS}

    renamed_columns = {
        original: header_map[normalized]
        for original, normalized in zip(df.columns, normalized_headers)
        if normalized in header_map
    }

    df = df.rename(columns=renamed_columns)

    for expected in EXPECTED_COLUMNS:
        if expected not in df.columns:
            df[expected] = ""

    df = df[EXPECTED_COLUMNS]

    for column in df.columns:
        if column in TEXT_COLUMNS:
            df[column] = df[column].apply(normalize_text)
        elif column in NUMERIC_COLUMNS:
            if column in {"mes", "año", "día"}:
                df[column] = df[column].apply(
                    lambda x: int(parse_int(x)) if pd.notna(x) and parse_int(x) is not None else None
                )
            elif column == "cantidad":
                df[column] = df[column].apply(
                    lambda x: int(round(parse_float(x))) if pd.notna(x) and parse_float(x) is not None else None
                )
            elif column in {"valor unitario", "valor total"}:
                df[column] = df[column].apply(
                    lambda x: float(parse_float(x)) if pd.notna(x) and parse_float(x) is not None else None
                )
            else:
                df[column] = df[column].apply(parse_float)
        elif column in DATE_COLUMNS:
            df[column] = df[column].apply(parse_date)
        else:
            df[column] = df[column].apply(lambda value: normalize_text(value))

    # Auto-corregir swaps de datos
    logging_etl_process("Aplicando correcciones automáticas de ubicación de campos")
    df = auto_correct_swaps(df)

    # Resolver datos numéricos faltantes entre cantidad, valor unitario y valor total
    logging_etl_process(
        "Resolviendo valores faltantes en cantidad / valor unitario / valor total"
    )

    def resolve_amounts(row: pd.Series) -> pd.Series:
        cantidad = row["cantidad"]
        valor_unitario = row["valor unitario"]
        valor_total = row["valor total"]

        has_cantidad = cantidad is not None and not (isinstance(cantidad, float) and pd.isna(cantidad))
        has_unitario = valor_unitario is not None and not (isinstance(valor_unitario, float) and pd.isna(valor_unitario))
        has_total = valor_total is not None and not (isinstance(valor_total, float) and pd.isna(valor_total))

        if has_cantidad and has_unitario and not has_total:
            valor_total = float(cantidad) * float(valor_unitario)
        elif has_total and has_unitario and not has_cantidad:
            cantidad = int(round(float(valor_total) / float(valor_unitario))) if float(valor_unitario) != 0 else 1
        elif has_total and has_cantidad and not has_unitario:
            valor_unitario = float(valor_total) / float(cantidad) if float(cantidad) != 0 else 1.0
        elif sum([has_cantidad, has_unitario, has_total]) == 1:
            if has_cantidad:
                valor_unitario = 1.0
                valor_total = 1.0
            elif has_unitario:
                cantidad = 1
                valor_total = 1.0
            elif has_total:
                cantidad = 1
                valor_unitario = 1.0

        row["cantidad"] = (
            int(round(cantidad))
            if cantidad is not None and not (isinstance(cantidad, float) and pd.isna(cantidad))
            else None
        )
        row["valor unitario"] = (
            float(valor_unitario)
            if valor_unitario is not None and not (isinstance(valor_unitario, float) and pd.isna(valor_unitario))
            else None
        )
        row["valor total"] = (
            float(valor_total)
            if valor_total is not None and not (isinstance(valor_total, float) and pd.isna(valor_total))
            else None
        )
        return row

    df = df.apply(resolve_amounts, axis=1)

    # Calcular promedios para año/mes/día y rellenar el resto
    logging_etl_process("Calculando promedios para año/mes/día y rellenando valores numéricos N/A")
    averages: dict[str, int] = {}
    current_year = pd.Timestamp.now().year
    for col in {"año", "mes", "día"}:
        values = df[col].dropna().astype(float)
        if len(values) > 0:
            averages[col] = int(round(values.mean()))
        else:
            averages[col] = current_year if col == "año" else 1

    df["cantidad"] = df["cantidad"].fillna(1).astype(int)
    df["valor unitario"] = df["valor unitario"].fillna(1.0)
    df["valor total"] = df["valor total"].fillna(1.0)

    for col, avg in averages.items():
        df[col] = df[col].fillna(avg).astype(int)

    # Rellenar vacíos en columnas de texto y fecha con "N/A"
    logging_etl_process("Rellenando valores vacíos con N/A")
    for col in df.columns:
        if col in NUMERIC_COLUMNS:
            continue
        df[col] = df[col].apply(
            lambda x: "N/A"
            if x is None or (isinstance(x, float) and pd.isna(x)) or str(x).strip() == ""
            else x
        )

    issues = validate_dataframe(df)
    if issues:
        logging_etl_process(f"Se encontraron {len(issues)} posibles inconsistencias durante la validación:")
        for issue in issues[:20]:
            print(f"Fila {issue['fila'] + 2}, columna '{issue['columna']}': {issue['mensaje']}")
        if len(issues) > 20:
            print(f"...y {len(issues) - 20} problemas adicionales.")

    df_clean = df
    logging_etl_process(f"{len(df_clean)} filas limpias después de la transformación")
    return df


def format_money(value: float | int | None) -> str | None:
    if value is None:
        return None

    amount = int(round(value))
    return f"{amount:,}".replace(",", ".")


def auto_correct_swaps(df: pd.DataFrame) -> pd.DataFrame:
    # Intentar recuperar información moviendo datos mal colocados
    ciudades_posibles = {
        "bogota",
        "bogota d c",
        "b/quilla",
        "bquilla",
        "cali",
        "medellin",
        "barranquilla",
        "cartagena",
        "cucuta",
        "bucaramanga",
        "pereira",
        "santa marta",
        "ibague",
        "palmira",
        "neiva",
        "popayan",
        "sincelejo",
        "valledupar",
        "monteria",
        "tunja",
        "florencia",
        "yopal",
        "mocoa",
        "san andres",
        "leticia",
        "mitu",
        "puerto carreno",
        "inirida",
        "manizales",
        "pasto",
        "armenia",
        "villavicencio",
        "riohacha",
    }

    changes = []
    for idx, row in df.iterrows():
        ciudad_actual = str(row.get("ciudad", "")).strip().lower()

        for col in TEXT_COLUMNS:
            if col == "ciudad":
                continue
            valor = str(row.get(col, "")).strip().lower()
            if valor in ciudades_posibles:
                if not ciudad_actual:
                    changes.append((idx, "ciudad", valor))
                    ciudad_actual = valor
                changes.append((idx, col, "N/A"))

        # Para zona "norte", setear a N/A
        zona = str(row.get("zona", "")).strip().lower()
        if zona == "norte":
            changes.append((idx, "zona", "N/A"))

    for idx, col, val in changes:
        df.at[idx, col] = val

    return df


def validate_dataframe(df: pd.DataFrame) -> list[dict[str, object]]:
    issues: list[dict[str, object]] = []

    for row_index, row in df.iterrows():
        for column, value in row.items():
            if column in TEXT_COLUMNS or column in NUMERIC_COLUMNS or column in DATE_COLUMNS:
                problem = validate_text_field(column, value)
                if problem:
                    issues.append({"fila": row_index, "columna": column, "mensaje": problem})

    return issues
