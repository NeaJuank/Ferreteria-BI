from pathlib import Path

import pandas as pd
from utils import logging_step_process, logging_etl_process

def read_excel(path: Path | str) -> pd.DataFrame:
    logging_step_process("Leyendo archivo de entrada")
    path = Path(path)

    if not path.exists():
        raise FileNotFoundError(f"El archivo de entrada no existe: {path}")

    logging_etl_process(f"Extrayendo datos desde: {path}")
    df = pd.read_excel(path, engine="openpyxl", dtype=str)
    logging_etl_process(f"Extracción completa: {len(df)} filas leídas")
    return df
