from pathlib import Path

import pandas as pd


def read_excel(path: Path | str) -> pd.DataFrame:
    path = Path(path)

    if not path.exists():
        raise FileNotFoundError(f"El archivo de entrada no existe: {path}")

    print(f"[ETL] Extrayendo datos desde: {path}")
    df = pd.read_excel(path, engine="openpyxl", dtype=str)
    print(f"[ETL] Extracción completa: {len(df)} filas leídas")
    return df
