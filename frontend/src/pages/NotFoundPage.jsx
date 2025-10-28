import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <h1 className="text-9xl font-extrabold text-red-600">404</h1>
      <p className="text-2xl font-medium text-gray-800 mb-4">Página No Encontrada</p>
      <p className="text-gray-600 mb-8">Lo sentimos, la ruta que estás buscando no existe.</p>
      <Link 
        to="/" // Redirige al usuario a un lugar seguro
        className="px-6 py-3 bg-gray-400 text-white rounded-lg shadow hover:bg-gray-500 transition duration-300"
      >
        Regresar
      </Link>
    </div>
  );
};

export default NotFoundPage;