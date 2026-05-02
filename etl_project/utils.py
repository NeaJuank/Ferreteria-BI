import re
import unicodedata
from datetime import datetime

import pandas as pd
from unidecode import unidecode


CORRECTIONS = {
    "súr": "sur",
    "orieñte": "oriente",
    "occideñte": "occidente",
    "tárjeta": "tarjeta",
    "eféctivo": "efectivo",
    "néqui": "nequi",
    "dáviplata": "daviplata",
    "miñorista": "minorista",
    "máyorista": "mayorista",
    "mayorista": "mayorista",
    "minorista": "minorista",
    "contratista": "contratista",
    "v. unitario": "valor unitario",
    "v. total": "valor total",
}


def normalize_text(value: object) -> str:
    if pd.isna(value):
        return ""

    text = str(value).strip()
    # Aplicar unidecode para transliterar a ASCII
    text = unidecode(text)
    text = text.lower()
    text = CORRECTIONS.get(text, text)  # Aplicar correcciones específicas
    text = re.sub(r"[^\w\s/\-]", " ", text)  # Mantener letras, números, espacios, guiones, slash
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def normalize_header(value: object) -> str:
    if pd.isna(value):
        return ""

    text = str(value).strip()
    # Aplicar unidecode para transliterar a ASCII
    text = unidecode(text)
    text = text.lower()
    text = CORRECTIONS.get(text, text)  # Aplicar correcciones específicas
    text = re.sub(r"[^\w\s\.\-]", " ", text)  # Mantener puntos
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def parse_float(value: object) -> float | None:
    if pd.isna(value):
        return None

    text = str(value).strip().replace("$", "").replace(" ", "").replace(",", ".")
    if text == "":
        return None

    try:
        return float(text)
    except ValueError:
        return None


def parse_int(value: object) -> int | None:
    if pd.isna(value):
        return None

    text = str(value).strip().replace("$", "").replace(".", "").replace(",", "")
    if text == "":
        return None

    try:
        return int(float(text))
    except ValueError:
        return None


def parse_date(value: object) -> str:
    if pd.isna(value):
        return ""

    if isinstance(value, datetime):
        return value.date().isoformat()

    text = str(value).strip()
    # Remove time part if present
    if " " in text:
        text = text.split(" ")[0]
    if "T" in text:
        text = text.split("T")[0]

    for fmt in (
        "%Y-%m-%d",
        "%Y-%m-%d",
        "%d/%m/%Y",
        "%d-%m-%Y",
        "%m/%d/%Y",
        "%Y/%m/%d",
    ):
        try:
            return datetime.strptime(text, fmt).date().isoformat()
        except ValueError:
            continue

    return text


def is_blank(value: object) -> bool:
    if pd.isna(value):
        return True
    return str(value).strip() == ""


def validate_text_field(column: str, value: object) -> str | None:
    if pd.isna(value):
        return None

    if isinstance(value, str) and value.strip().upper() == "N/A":
        return None

    if column in {"cantidad", "mes", "año", "día"}:
        if not isinstance(value, (int, float)):
            return f"{column.capitalize()} debe ser numérico: {value}"
        if column == "cantidad":
            if not (isinstance(value, int) or (isinstance(value, float) and value.is_integer())):
                return f"Cantidad debe ser un entero: {value}"
        elif column == "mes":
            if not (1 <= value <= 12):
                return f"Mes inválido: {value}"
        elif column == "año":
            if not (2000 <= value <= 2030):  # Rango razonable
                return f"Año inválido: {value}"
        elif column == "día":
            if not (1 <= value <= 31):
                return f"Día inválido: {value}"
        return None

    # Para columnas de texto
    text = normalize_text(value)
    if column == "zona":
        zonas_validas = {"centro", "sur", "oriente", "occidente", "n/a"}
        if text and text not in zonas_validas:
            return f"Zona desconocida: {value}"

    if column == "ciudad" and any(char.isdigit() for char in text):
        return f"Ciudad no debe contener números: {value}"

    if column == "vendedor" and any(char.isdigit() for char in text):
        return f"Vendedor no debe contener números: {value}"

    if column == "tipo de cliente":
        tipos_validos = {"mayorista", "minorista", "contratista", "n/a"}
        if text and text not in tipos_validos:
            return f"Tipo de cliente desconocido: {value}"

    if column == "método de pago":
        metodos_validos = {"tarjeta", "efectivo", "nequi", "daviplata", "transferencia", "n/a"}
        if text and text not in metodos_validos:
            return f"Método de pago desconocido: {value}"

    return None
