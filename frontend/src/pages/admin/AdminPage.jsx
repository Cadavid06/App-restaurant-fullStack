import { useState, useEffect } from "react";
import { useAdminContext } from "../../context/AdminContext";
import { Button } from "../../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/layouts/Tabs";
import { ProductsTable } from "../../components/products/ProductsTable";
import { ProductFormDialog } from "../../components/products/ProductsForm";
import { CategoryTable } from "../../components/categories/CategoriesTable";
import { CategoryFormDialog } from "../../components/categories/CategoriesForm";
import { SizeTable } from "../../components/sizes/SizesTable";
import { SizeFormDialog } from "../../components/sizes/SizesForm";
import {
  showDeleteConfirm,
  showSuccess,
  showError,
} from "../../utils/sweetAlert";

function AdminPage() {
  const {
    category,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    size,
    createSize,
    getSizes,
    updateSize,
    deleteSize,
    product,
    getProducts,
    createProducts,
    updateProduct,
    deleteProduct,
  } = useAdminContext();

  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [openSize, setOpenSize] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);

  const [openProduct, setOpenProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    getCategories();
    getSizes();
    getProducts();
  }, []);

  const handleSave = async (data) => {
    try {
      if (data.id) {
        await updateCategory(data.id, data);
        showSuccess(
          "Categoría Actualizada",
          `La categoría "${data.name}" ha sido actualizada.`
        );
      } else {
        await createCategory(data);
        showSuccess(
          "Categoría Creada",
          `La categoría "${data.name}" ha sido creada.`
        );
      }
      getCategories();
      // Asumo que aquí cierras el modal, si usas setOpen:
      setOpen(false);
    } catch (error) {
      const msg =
        error.response?.data?.message || "No se pudo guardar la categoría.";
      showError("Error", msg);
    }
  };

  const handleSaveSize = async (data) => {
    try {
      if (data.id) {
        await updateSize(data.id, data);
        showSuccess(
          "Tamaño Actualizado",
          `El tamaño "${data.name}" ha sido actualizado.`
        );
      } else {
        await createSize(data);
        showSuccess(
          "Tamaño Creado",
          `El tamaño "${data.name}" ha sido creado.`
        );
      }
      getSizes();
      setOpenSize(false); // Cerrar modal de tamaños
    } catch (error) {
      const msg =
        error.response?.data?.message || "No se pudo guardar el tamaño.";
      showError("Error", msg);
    }
  };

  const handleSaveProduct = async (data) => {
    try {
      if (data.id) {
        await updateProduct(data.id, data);
        showSuccess(
          "Producto Actualizado",
          `El producto "${data.name}" se actualizó.`
        );
      } else {
        await createProducts(data);
        showSuccess(
          "Producto Creado",
          `El producto "${data.name}" se ha creado.`
        );
      }
      getProducts(); // Refrescar tabla
      setOpenProduct(false); // Cerrar modal
    } catch (error) {
      // Si tu backend devuelve el mensaje de error en error.response.data.message
      const msg =
        error.response?.data?.message || "Ocurrió un error inesperado";
      showError("Error al guardar", msg);
    }
  };

  const handleEdit = (cat) => {
    setSelectedCategory(cat);
    setOpen(true);
  };

  const handleEditSize = (siz) => {
    setSelectedSize(siz);
    setOpenSize(true);
  };

  const handleEditProduct = (prod) => {
    setSelectedProduct(prod);
    setOpenProduct(true);
  };

  const handleDelete = async (id) => {
    // 1. Preguntar primero
    const confirmed = await showDeleteConfirm("categoría");

    // 2. Si el usuario dijo "Sí"
    if (confirmed) {
      try {
        await deleteCategory(id);
        getCategories(); // Recargar lista
        showSuccess(
          "Eliminado",
          "La categoría ha sido eliminada correctamente."
        );
      } catch (error) {
        showError(
          "Error",
          "No se pudo eliminar la categoría (quizás tiene productos asociados)."
        );
      }
    }
  };

  const handleDeleteSize = async (id) => {
    const confirmed = await showDeleteConfirm("tamaño");
    if (confirmed) {
      try {
        await deleteSize(id);
        getSizes();
        showSuccess("Eliminado", "El tamaño ha sido eliminado.");
      } catch (error) {
        showError("Error", "No se pudo eliminar el tamaño.");
      }
    }
  };

  const handleDeleteProduct = async (id) => {
    const confirmed = await showDeleteConfirm("producto");
    if (confirmed) {
      try {
        await deleteProduct(id);
        getProducts();
        showSuccess("Eliminado", "El producto ha sido eliminado del menú.");
      } catch (error) {
        showError("Error", "No se pudo eliminar el producto.");
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4 w-full sm:max-w-4/5 lg:max-w-3/4 mx-auto h-auto ">
      {" "}
      {/* ✅ Padding adaptativo */}
      <h1 className="text-xl md:text-2xl font-bold text-gray-900">
        Gestión de Productos
      </h1>{" "}
      {/* ✅ Tamaño adaptativo */}
      <p className="text-gray-500 text-sm">
        Gestiona las categorías, tamaños y productos del menú
      </p>
      {/* Tabs principales */}
      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
          <TabsTrigger value="sizes">Tamaños</TabsTrigger>
        </TabsList>

        {/* === TAB PRODUCTOS === */}
        <TabsContent value="products">
          <div className="space-y-4 mt-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
              {" "}
              {/* ✅ Stack en móviles */}
              <h2 className="text-lg md:text-xl font-semibold">
                Productos
              </h2>{" "}
              {/* ✅ Tamaño adaptativo */}
              <Button
                onClick={() => {
                  setSelectedProduct(null);
                  setOpenProduct(true);
                }}
                className="bg-black text-white hover:bg-gray-800 rounded-lg px-4 py-2 text-sm md:text-base w-full md:w-auto" // ✅ Ancho y tamaño adaptativo
              >
                + Nuevo Producto
              </Button>
            </div>

            <ProductsTable
              products={product || []}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          </div>
        </TabsContent>

        {/* === TAB CATEGORÍAS === */}
        <TabsContent value="categories">
          <div className="space-y-4 mt-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
              {" "}
              {/* ✅ Stack en móviles */}
              <h2 className="text-lg md:text-xl font-semibold">
                Categorías
              </h2>{" "}
              {/* ✅ Tamaño adaptativo */}
              <Button
                onClick={() => {
                  setSelectedCategory(null);
                  setOpen(true);
                }}
                className="bg-black text-white hover:bg-gray-800 rounded-lg px-4 py-2 text-sm md:text-base w-full md:w-auto" // ✅ Ancho y tamaño adaptativo
              >
                + Nueva Categoría
              </Button>
            </div>

            <CategoryTable
              categories={category || []}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </TabsContent>

        {/* === TAB TAMAÑOS === */}
        <TabsContent value="sizes">
          <div className="space-y-4 mt-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
              {" "}
              {/* ✅ Stack en móviles */}
              <h2 className="text-lg md:text-xl font-semibold">Tamaños</h2>{" "}
              {/* ✅ Tamaño adaptativo */}
              <Button
                onClick={() => {
                  setSelectedSize(null);
                  setOpenSize(true);
                }}
                className="bg-black text-white hover:bg-gray-800 rounded-lg px-4 py-2 text-sm md:text-base w-full md:w-auto" // ✅ Ancho y tamaño adaptativo
              >
                + Nuevo tamaño
              </Button>
            </div>

            <SizeTable
              sizes={size || []}
              onEdit={handleEditSize}
              onDelete={handleDeleteSize}
            />
          </div>
        </TabsContent>
      </Tabs>
      {/* Modals */}
      <CategoryFormDialog
        open={open}
        onOpenChange={setOpen}
        category={selectedCategory}
        onSave={handleSave}
      />
      <SizeFormDialog
        open={openSize}
        onOpenChange={setOpenSize}
        size={selectedSize}
        onSave={handleSaveSize}
      />
      <ProductFormDialog
        open={openProduct}
        onOpenChange={setOpenProduct}
        product={selectedProduct}
        categories={category || []}
        sizes={size || []}
        onSave={handleSaveProduct}
      />
    </div>
  );
}

export default AdminPage;
