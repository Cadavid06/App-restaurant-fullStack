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

function AdminPage() {
  const {
    category,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    product,
    getProducts,
    createProducts,
    updateProduct,
    deleteProduct,
  } = useAdminContext();

  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [openProduct, setOpenProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    getCategories();
    getProducts();
  }, []);

  const handleSave = async (data) => {
    if (data.id) {
      await updateCategory(data.id, data);
    } else {
      await createCategory(data);
    }
    getCategories();
  };

  const handleSaveProduct = async (data) => {
    if (data.id) {
      await updateProduct(data.id, data);
    } else {
      await createProducts(data);
    }
    getProducts();
  };

  const handleEdit = (cat) => {
    setSelectedCategory(cat);
    setOpen(true);
  };

  const handleEditProduct = (prod) => {
    setSelectedProduct(prod);
    setOpenProduct(true);
  };

  const handleDelete = async (id) => {
    if (confirm("¿Seguro que deseas eliminar esta categoría?")) {
      await deleteCategory(id);
      getCategories();
    }
  };

  const handleDeleteProduct = async (id) => {
    if (confirm("¿Seguro que deseas eliminar este producto?")) {
      await deleteProduct(id);
      getProducts();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 space-y-4 md:space-y-6">
      {" "}
      {/* ✅ Padding adaptativo */}
      <h1 className="text-xl md:text-2xl font-bold text-gray-900">
        Gestión de Productos
      </h1>{" "}
      {/* ✅ Tamaño adaptativo */}
      <p className="text-gray-500 text-sm">
        Administra productos y categorías del menú
      </p>
      {/* Tabs principales */}
      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
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
      </Tabs>
      {/* Modal */}
      <CategoryFormDialog
        open={open}
        onOpenChange={setOpen}
        category={selectedCategory}
        onSave={handleSave}
      />
      <ProductFormDialog
        open={openProduct}
        onOpenChange={setOpenProduct}
        product={selectedProduct}
        categories={category || []}
        onSave={handleSaveProduct}
      />
    </div>
  );
}

export default AdminPage;
