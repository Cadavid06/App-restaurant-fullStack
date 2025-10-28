/**
 * Punto de entrada principal de la aplicación.
 * Se encarga de iniciar la conexión a la base de datos y
 * de levantar el servidor Express.
 */
import app from './app.js'
import { connectDB } from './db.js';

const PORT = process.env.PORT || 3000;

/**
 * Función principal asíncrona que inicia la aplicación.
 */
const main = async () => {
    // Intenta conectar a la base de datos PostgreSQL
    await connectDB(); 

    // Inicia el servidor Express en el puerto definido
    app.listen(PORT, () => {
        console.log(`🚀 Servidor Corriendo en el puerto ${PORT}`);
    });
};

main();
