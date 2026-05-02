from pathlib import Path

from extract import read_excel
from load import save_excel
from transform import clean_data

INPUT_PATH = Path(__file__).parent / "ferreteria_50000_datos_modificado.xlsx"
OUTPUT_PATH = Path(__file__).parent / "data" / "output.xlsx"


def main() -> None:
    print("[ETL] Iniciando pipeline de extracción, transformación y carga")
    print(f"[ETL] Leyendo archivo de entrada: {INPUT_PATH}")
    df = read_excel(INPUT_PATH)
    print(f"[ETL] Archivo leído con {len(df)} filas")

    print("[ETL] Limpiando y transformando los datos")
    df_clean = clean_data(df)
    print(f"[ETL] Transformación completada: {len(df_clean)} filas limpias")

    print(f"[ETL] Guardando resultado en: {OUTPUT_PATH}")
    save_excel(df_clean, OUTPUT_PATH)
    print("[ETL] Proceso finalizado")


if __name__ == "__main__":
    main()
