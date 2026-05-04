from postgrest import APIError
from .supabase_client import get_supabase_client


def clear_supabase_data() -> None:
    client = get_supabase_client()
    tables = [
        "fact_ventas",
        "dim_segmento_venta",
        "dim_producto",
        "dim_vendedor",
        "dim_metodo_pago",
        "dim_tiempo",
    ]

    print("[Supabase] Iniciando limpieza de datos")
    for table in tables:
        print(f"[Supabase] Eliminando todos los registros de {table}")
        try:
            client.table(table).delete().gt("id", 0).execute()
        except APIError as exc:
            raise RuntimeError(f"Error al eliminar datos de {table}: {exc}") from exc

        print(f"[Supabase] {table} limpiada correctamente")

    print("[Supabase] Limpieza completada")
    print("\n⚠️  IMPORTANTE: Para resetear los contadores de ID, ejecuta esto en Supabase SQL Editor:")
    print("   - Abre: https://supabase.com/ → Tu proyecto → SQL Editor")
    print("   - Copia y pega el contenido de ../schema/supabase_reset_sequences.sql")
    print("   - Esto evitará que los IDs sigan creciendo desde 50k\n")


if __name__ == "__main__":
    clear_supabase_data()
