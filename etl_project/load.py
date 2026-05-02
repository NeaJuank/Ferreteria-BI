from pathlib import Path

import pandas as pd


def save_excel(df: pd.DataFrame, path: Path | str) -> None:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    df.to_excel(path, index=False, engine="openpyxl")
    print(f"Archivo de salida generado en: {path}")


def save_to_supabase(df: pd.DataFrame, project_url: str | None = None, api_key: str | None = None, table_name: str = "ventas") -> None:
    """Placeholder para futura integración con Supabase."""
    if not project_url or not api_key:
        print("Supabase no está configurado. Proporciona project_url y api_key para habilitar esta función.")
        return

    print("Supabase integration is not implemented yet. Use the Supabase client to upload the cleaned DataFrame.")
