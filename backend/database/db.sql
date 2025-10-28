CREATE TABLE Rol (
    rol_id SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO Rol (nombre_rol) VALUES ('Administrador'), ('Empleado');

SELECT * FROM Rol; 

CREATE TABLE Usuario (
    usuario_id SERIAL PRIMARY KEY,
    rol_id INTEGER NOT NULL REFERENCES Rol (rol_id),
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    contraseña VARCHAR(255) NOT NULL
);

INSERT INTO
    Usuario (
        rol_id,
        nombre,
        email,
        contraseña
    )
VALUES (
        1,
        'Admin',
        'admin@gmail.com',
        'admin'
    ),
    (
        2,
        'Carlos',
        'carlos@gmail.com',
        'carlos'
    );

SELECT * FROM Usuario; 

CREATE TABLE Categoria (
    categoria_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE Producto (
    producto_id SERIAL PRIMARY KEY,
    categoria_id INTEGER NOT NULL REFERENCES Categoria (categoria_id),
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
    UNIQUE (nombre, categoria_id)
);

CREATE TABLE Pedido (
    pedido_id SERIAL PRIMARY KEY,
    empleado_id INTEGER NOT NULL REFERENCES Usuario (usuario_id),
    fecha_hora TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    numero_mesa INTEGER NOT NULL CHECK (numero_mesa >= 0),
    estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente'
);

CREATE TABLE Detalle_pedido (
    detalle_id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES Pedido (pedido_id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES Producto (producto_id),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10, 2) NOT NULL CHECK (precio_unitario >= 0),
    UNIQUE (pedido_id, producto_id)
);

CREATE TABLE Factura (
    factura_id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL UNIQUE REFERENCES Pedido (pedido_id),
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total_pago NUMERIC(10, 2) NOT NULL CHECK (total_pago >= 0),
    metodo_pago VARCHAR(50) NOT NULL
);

CREATE TABLE Gestion_admin (
    admin_id INTEGER NOT NULL REFERENCES Usuario (usuario_id),
    producto_id INTEGER NOT NULL REFERENCES Producto (producto_id),
    fecha_gestion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (admin_id, producto_id)
);