/**
 * Configuración y gestión de la conexión a la base de datos PostgreSQL (Neon)
 */
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

/**
 * Crea un Pool de conexiones a PostgreSQL (Neon)
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // 🔒 Necesario para Neon
  },
});

/**
 * Función para probar la conexión
 */
export const connectDB = async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("✅ Conectado correctamente a Neon PostgreSQL");
  } catch (error) {
    console.error("❌ Error de conexión a Neon:", error.message);
  }
};

export default pool;
