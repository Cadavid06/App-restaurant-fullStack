/**
 * Middleware para validar que los parámetros ID sean números válidos
 */
export const validateId = (req, res, next) => {
  const { id } = req.params;

  // Validar que sea un número entero positivo
  if (!id || !/^\d+$/.test(String(id))) {
    return res.status(400).json({
      message: "Invalid ID format. ID must be a positive integer.",
    });
  }

  // Convertir a número y asignar de vuelta
  req.params.id = parseInt(id, 10);
  next();
};
