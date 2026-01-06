-- 1. TABLA: RESTAURANTES (La base de todo)
CREATE TABLE public.restaurants (
    restaurant_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(200),
    phone VARCHAR(20),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- 2. TABLA: ROLES
CREATE TABLE public.role (
    role_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name_role VARCHAR(50) NOT NULL UNIQUE
);

-- 3. TABLA: CATEGORIAS
CREATE TABLE public.category (
    category_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    restaurant_id INTEGER REFERENCES public.restaurants(restaurant_id)
);

-- 4. TABLA: TAMAÑOS (SIZES)
CREATE TABLE public.sizes (
    size_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    restaurant_id INTEGER REFERENCES public.restaurants(restaurant_id)
);

-- 5. TABLA: USUARIOS (EMPLEADOS/ADMINS)
CREATE TABLE public.users (
    user_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    role_id INTEGER NOT NULL REFERENCES public.role(role_id) ON DELETE RESTRICT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    restaurant_id INTEGER REFERENCES public.restaurants(restaurant_id)
);

-- 6. TABLA: PRODUCTOS
CREATE TABLE public.product (
    product_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES public.category(category_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    size_id INTEGER REFERENCES public.sizes(size_id) ON DELETE RESTRICT,
    restaurant_id INTEGER REFERENCES public.restaurants(restaurant_id)
);

-- 7. TABLA: PEDIDOS (ORDERS)
CREATE TABLE public."order" (
    order_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employee_id INTEGER REFERENCES public.users(user_id) ON DELETE SET NULL,
    date_time TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    table_number INTEGER NOT NULL CHECK (table_number >= 0),
    status VARCHAR(50) DEFAULT 'Pendiente' NOT NULL,
    restaurant_id INTEGER REFERENCES public.restaurants(restaurant_id)
);

-- 8. TABLA: DETALLE DE PEDIDO
CREATE TABLE public.order_detail (
    detail_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES public."order"(order_id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES public.product(product_id) ON DELETE SET NULL,
    amount INTEGER NOT NULL CHECK (amount > 0),
    unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
    UNIQUE (order_id, product_id)
);

-- 9. TABLA: FACTURAS (INVOICES)
CREATE TABLE public.invoice (
    invoice_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id INTEGER UNIQUE REFERENCES public."order"(order_id) ON DELETE SET NULL,
    date_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total_payment NUMERIC(10,2) NOT NULL CHECK (total_payment >= 0),
    payment_method VARCHAR(50) NOT NULL,
    employee_id INTEGER REFERENCES public.users(user_id) ON DELETE SET NULL,
    restaurant_id INTEGER REFERENCES public.restaurants(restaurant_id)
);

-- 10. TABLA: GESTION ADMIN (AUDITORIA)
CREATE TABLE public.gestion_admin (
    admin_id INTEGER NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES public.product(product_id) ON DELETE CASCADE,
    fecha_gestion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (admin_id, producto_id)
);

-- DATOS INICIALES NECESARIOS (Semilla)
INSERT INTO public.role (name_role) VALUES ('Administrador'), ('Empleado');
-- Puedes crear un restaurante por defecto para empezar a probar
INSERT INTO public.restaurants (name, address) VALUES ('Mi Restaurante Principal', 'Calle 123');