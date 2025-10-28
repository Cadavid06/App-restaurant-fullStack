import { useForm } from "react-hook-form"
import { useAuth } from "../context/AuthContext"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const { signIn, errors: loginErrors, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 1) navigate("/dashboard")
      else if (user.role === 2) navigate("/menu")
    }
  }, [isAuthenticated, user, navigate])

  const onSubmit = handleSubmit((data) => signIn(data))

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      {/* Encabezado */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Sistema de Gestión</h1>
        <p className="text-gray-500 mt-1">Ingresa tus credenciales para continuar</p>
      </div>

      {/* Tarjeta de Login */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-85 max-w-md p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Iniciar Sesión</h2>
        <p className="text-sm text-gray-500 mb-6">Ingresa tu correo y contraseña</p>

        {/* Errores */}
        {Array.isArray(loginErrors) && loginErrors.length > 0 && (
          <div className="space-y-2 mb-4">
            {loginErrors.map((error, i) => (
              <div
                key={i}
                className="bg-red-500 text-white text-sm p-2 rounded-md text-center"
              >
                {error}
              </div>
            ))}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              className="w-full px-4 py-2 bg-gray-100 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 focus:bg-white transition"
              {...register("email", { required: "El email es obligatorio" })}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-gray-100 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 focus:bg-white transition"
              {...register("password", { required: "La contraseña es obligatoria" })}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-md font-semibold transition-all bg-gray-900 text-white hover:bg-gray-800"
          >Ingresar
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
