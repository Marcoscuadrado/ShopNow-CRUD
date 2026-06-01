"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Producto {
  id_producto: number;
  nombre: string;
  descripcion: string;
  precio: number;
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // Estados expandidos para coincidir con tu modelo Pydantic
  const [formId, setFormId] = useState("");
  const [formNombre, setFormNombre] = useState("");
  const [formDescripcion, setFormDescripcion] = useState("");
  const [formPrecio, setFormPrecio] = useState("");
  const [formStock, setFormStock] = useState("0");

  const cargarProductos = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8004/v1/productos/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!res.ok) throw new Error("Error al obtener el catálogo de productos, intentelo mas tarde");
      const data = await res.json();
      setProductos(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  // --- FUNCIÓN POST: Agregar producto ---
  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre || !formDescripcion || !formPrecio) {
        return alert("El Nombre, Descripción y Precio son obligatorios.");
    }
    
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://127.0.0.1:8004/v1/productos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: formNombre,
          descripcion: formDescripcion,
          precio: parseFloat(formPrecio),
          stock_inicial: parseInt(formStock) || 0
        }),
      });

      if (!res.ok) throw new Error("Error al registrar el producto. Verifica los datos.");
      
      setFormNombre("");
      setFormDescripcion("");
      setFormPrecio("");
      setFormStock("0");
      cargarProductos(); 
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- FUNCIÓN PATCH: Actualizar producto ---
  const handleActualizar = async () => {
    if (!formId) return alert("Necesitas el ID del producto para actualizarlo");
    const token = localStorage.getItem("token");

    // Construimos el body dinámicamente según ProductoActualizar
    const datosActualizados: any = {};
    if (formNombre) datosActualizados.nombre = formNombre;
    if (formDescripcion) datosActualizados.descripcion = formDescripcion;
    if (formPrecio) datosActualizados.precio = parseFloat(formPrecio);
    // Tu modelo ProductoActualizar permite actualizar el 'stock', si quisieras habilitarlo, iría aquí

    try {
      const res = await fetch(`http://127.0.0.1:8004/v1/productos/${formId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(datosActualizados),
      });

      if (!res.ok) throw new Error("Error al actualizar (Verifica que el ID exista)");
      
      setFormId("");
      setFormNombre("");
      setFormDescripcion("");
      setFormPrecio("");
      cargarProductos();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEliminar = async (id_producto: number) => {
    const confirmar = window.confirm(`¿Estás seguro de eliminar el producto ${id_producto}?`);
    if (!confirmar) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://127.0.0.1:8004/v1/productos/${id_producto}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al eliminar el producto");
      cargarProductos();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (cargando) return <div className="min-h-screen flex items-center justify-center">Cargando catálogo...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Departamento de Productos</h1>
          <button onClick={cerrarSesion} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition">
            Cerrar Sesión
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <h2 className="text-lg font-bold mb-4 text-gray-700">Gestión del Catálogo</h2>
          <form className="flex flex-col gap-4" onSubmit={handleAgregar}>
            
            <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">ID (Actualizar)</label>
                  <input 
                    type="number" 
                    value={formId} 
                    onChange={(e) => setFormId(e.target.value)} 
                    className="border p-2 rounded-lg w-28 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    placeholder="Ej. 10"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Nombre Corto</label>
                  <input 
                    type="text" 
                    value={formNombre} 
                    onChange={(e) => setFormNombre(e.target.value)} 
                    className="border p-2 rounded-lg w-48 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white" 
                    placeholder="Ej. Laptop Gamer"
                  />
                </div>
                <div className="flex-grow">
                  <label className="block text-sm text-gray-600 mb-1">Descripción Detallada</label>
                  <input 
                    type="text" 
                    value={formDescripcion} 
                    onChange={(e) => setFormDescripcion(e.target.value)} 
                    className="border p-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white" 
                    placeholder="Ej. 16GB RAM, RTX 3060..."
                  />
                </div>
            </div>

            <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Precio ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formPrecio} 
                    onChange={(e) => setFormPrecio(e.target.value)} 
                    className="border p-2 rounded-lg w-40 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white" 
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Stock Inicial</label>
                  <input 
                    type="number" 
                    value={formStock} 
                    onChange={(e) => setFormStock(e.target.value)} 
                    className="border p-2 rounded-lg w-48 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white" 
                  />
                </div>
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition h-10 mt-6">
                  Agregar Nuevo
                </button>
                <button type="button" onClick={handleActualizar} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition h-10 mt-6">
                  Actualizar ID
                </button>
            </div>
          </form>
        </div>

        {error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 border-b">
                  <th className="p-4 font-semibold">ID</th>
                  <th className="p-4 font-semibold">Producto</th>
                  <th className="p-4 font-semibold">Precio</th>
                  <th className="p-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((prod) => (
                  <tr key={prod.id_producto} className="border-b hover:bg-gray-50 transition">
                    <td className="p-4 font-medium text-gray-900">{prod.id_producto}</td>
                    <td className="p-4">
                        <div className="text-sm text-gray-500">{prod.descripcion}</div>
                    </td>
                    <td className="p-4 text-gray-600">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold">
                            ${typeof prod.precio === 'number' ? prod.precio.toFixed(2) : prod.precio}
                        </span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleEliminar(prod.id_producto)}
                        className="text-red-500 hover:text-red-700 font-bold transition"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}