/**
 * Archivo principal de configuración de la aplicación Express.
 * Se encarga de importar módulos, configurar middlewares globales
 * y montar las rutas de la API.
 */
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import users from "./routes/users.route.js";
import categories from './routes/categories.routes.js'
import products from "./routes/products.routes.js";
import orders from "./routes/orders.routes.js";
import invoice from "./routes/invoices.routes.js";
import reports from "./routes/reports.routes.js";
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'

// Carga las variables de entorno desde el archivo .env
dotenv.config()

// Inicialización de la aplicación Express
const app = express();

/**
 * Middlewares globales
 * * - express.json(): Permite que Express parseé el cuerpo de las peticiones
 * entrantes con formato JSON (body-parser).
 * - cookieParser(): Permite leer y escribir cookies en las peticiones.
 */
app.use(express.json());
app.use(cookieParser());
// TODO: Configurar CORS adecuadamente para la producción
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));

/**
 * Montaje de rutas de la API.
 * Cada ruta se prefija con "/api" y se asocia con su respectivo enrutador.
 */
app.use("/api", authRoutes);
app.use("/api", users);
app.use("/api", categories);
app.use("/api", products);
app.use("/api", orders);
app.use("/api", invoice);
app.use("/api", reports);

// Exporta la aplicación configurada
export default app;
