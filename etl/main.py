from pathlib import Path
from etl.etl_process.extract import read_excel
from etl.etl_process.load import save_excel, upload_to_supabase
from etl.etl_process.transform import clean_data
from etl.utils import logging_step_process

INPUT_PATH = Path(__file__).parent / "data" / "ferreteria_50000_datos_modificado.xlsx"
OUTPUT_PATH = Path(__file__).parent / "data" / "output.xlsx"


def main() -> None:
    logging_step_process("Iniciando pipeline de extracción, transformación y carga")
    df = read_excel(INPUT_PATH)
    df_clean = clean_data(df)
    save_excel(df_clean, OUTPUT_PATH)
    upload_to_supabase(df_clean)
    logging_step_process("Proceso finalizado")

if __name__ == "__main__":
    main()
