/**
 * Configuración y gestión de la conexión a la base de datos PostgreSQL
 * utilizando el módulo 'pg' (Node-Postgres).
 */
import pg from "pg";
import dotenv from 'dotenv'

// Carga las variables de entorno
dotenv.config()

/**
 * Crea un Pool de conexiones a PostgreSQL.
 * Las credenciales se obtienen de las variables de entorno.
 */
const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

/**
 * Función para probar la conexión a la base de datos.
 * Ejecuta una consulta simple para verificar que PostgreSQL esté respondiendo.
 */
export const connectDB = async () => {
    try {
        await pool.query("SELECT 1");
        console.log("✅ PostgreSQL responde correctamente");
    } catch (error) {
        console.error("❌ Error de conexión a la base de datos:", error);
    }
};

// Exporta el Pool de conexiones para ser utilizado en los controladores
export default pool;
