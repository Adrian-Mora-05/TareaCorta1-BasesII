\connect restaurantdb

SET search_path TO restaurant;

-- limpiar tablas de catálogo antes de insertar
TRUNCATE TABLE rol_usuario RESTART IDENTITY CASCADE;
TRUNCATE TABLE estado_reservacion RESTART IDENTITY CASCADE;
TRUNCATE TABLE estado_pedido RESTART IDENTITY CASCADE;
TRUNCATE TABLE tipo_pedido RESTART IDENTITY CASCADE;

INSERT INTO rol_usuario(nombre) VALUES
('admin'),
('cliente');

INSERT INTO estado_reservacion(nombre) VALUES
('reservada'),
('cancelada');

INSERT INTO estado_pedido(nombre) VALUES
('solicitado'),
('entregado'),
('cancelado');

INSERT INTO tipo_pedido(nombre) VALUES
('comer aquí'),
('para llevar');