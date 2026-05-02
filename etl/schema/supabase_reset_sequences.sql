-- Reset TABLEs for all tables to restart ID counter from 1
-- Execute this in Supabase SQL Editor after running supabase_clean.py

TRUNCATE TABLE dim_segmento_cliente RESTART IDENTITY CASCADE;
TRUNCATE TABLE dim_producto RESTART IDENTITY CASCADE;
TRUNCATE TABLE dim_vendedor RESTART IDENTITY CASCADE;
TRUNCATE TABLE dim_metodo_pago RESTART IDENTITY CASCADE;
TRUNCATE TABLE dim_tiempo RESTART IDENTITY CASCADE;
TRUNCATE TABLE fact_ventas RESTART IDENTITY CASCADE;
