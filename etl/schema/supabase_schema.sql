-- Dimensiones para el modelo estrella

create table dim_segmento_cliente (
  id serial primary key,
  ciudad text,
  zona text,
  tipo_cliente text,
  proveedor text,
  unique (ciudad, zona, tipo_cliente, proveedor)
);

create table dim_producto (
  id serial primary key,
  nombre text,
  categoria text,
  color text
);

create table dim_vendedor (
  id serial primary key,
  nombre text
);

create table dim_metodo_pago (
  id serial primary key,
  metodo text
);

create table dim_tiempo (
  id serial primary key,
  fecha date unique,
  ano int,
  mes int,
  dia int
);

create table fact_ventas (
  id serial primary key,
  factura text,
  cliente_id int references dim_segmento_cliente(id),
  producto_id int references dim_producto(id),
  vendedor_id int references dim_vendedor(id),
  metodo_pago_id int references dim_metodo_pago(id),
  tiempo_id int references dim_tiempo(id),
  cantidad int,
  valor_unitario numeric(14,2),
  valor_total numeric(16,2)
);
