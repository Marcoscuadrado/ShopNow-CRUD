"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ProductoInventario {
  id_producto: number;
  cantidad: number;
  created_at: string;
  updated_at: string;
}

export default function InventarioPage() {
  const [inventario, setInventario] = useState<ProductoInventario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // Estados para el formulario
  const [formId, setFormId] = useState("");
  const [formCantidad, setFormCantidad] = useState("");

  const cargarInventario = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("http://marcoscuadrado.ddns.net:8002/v1/inventario", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!res.ok) throw new Error("Error al obtener los datos, intentelo mas tarde");
      const data = await res.json();
      setInventario(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarInventario();
  }, []);

  // --- FUNCIÓN POST: Agregar nuevo stock ---
  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    try {
      const res = await fetch("http://marcoscuadrado.ddns.net:8002/v1/inventario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_producto: parseInt(formId),
          cantidad: parseInt(formCantidad)
        }),
      });

      if (!res.ok) throw new Error("Error al agregar el inventario (¿El ID ya existe?)");
      
      setFormId("");
      setFormCantidad("");
      cargarInventario(); // Recargamos la tabla
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- FUNCIÓN PATCH: Actualizar stock existente ---
  const handleActualizar = async () => {
    if (!formId || !formCantidad) return alert("Llena ambos campos para actualizar");
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://marcoscuadrado.ddns.net:8002/v1/inventario/${formId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cantidad: parseInt(formCantidad)
        }),
      });

      if (!res.ok) throw new Error("Error al actualizar (Verifica que el ID exista)");
      
      setFormId("");
      setFormCantidad("");
      cargarInventario();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- FUNCIÓN DELETE: Eliminar registro ---
  const handleEliminar = async (id_producto: number) => {
    const confirmar = window.confirm(`¿Estás seguro de eliminar el producto ${id_producto} del almacén?`);
    if (!confirmar) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://marcoscuadrado.ddns.net:8002/v1/inventario/${id_producto}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al eliminar el registro");
      cargarInventario();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (cargando) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Departamento de Inventario</h1>
          <button onClick={cerrarSesion} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition">
            Cerrar Sesión
          </button>
        </div>

        {/* Panel de Control CRUD */}
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <h2 className="text-lg font-bold mb-4 text-gray-700">Gestionar Stock</h2>
          <form onSubmit={handleAgregar} className="flex gap-4 items-end">
            <div>
              <label className="block text-sm text-gray-600 mb-1">ID Producto</label>
              <input 
                type="number" 
                value={formId} 
                onChange={(e) => setFormId(e.target.value)} 
                className="border p-2 rounded-lg w-32 outline-none focus:ring-2 focus:ring-blue-500" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Cantidad</label>
              <input 
                type="number" 
                value={formCantidad} 
                onChange={(e) => setFormCantidad(e.target.value)} 
                className="border p-2 rounded-lg w-32 outline-none focus:ring-2 focus:ring-blue-500" 
                required 
              />
            </div>
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition">
              Agregar Nuevo
            </button>
            <button type="button" onClick={handleActualizar} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
              Actualizar Existente
            </button>
          </form>
        </div>

        {/* Tabla de Datos */}
        {error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 border-b">
                  <th className="p-4 font-semibold">ID Producto</th>
                  <th className="p-4 font-semibold">Cantidad en Stock</th>
                  <th className="p-4 font-semibold">Última Actualización</th>
                  <th className="p-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {inventario.map((item) => (
                  <tr key={item.id_producto} className="border-b hover:bg-gray-50 transition">
                    <td className="p-4 font-medium text-gray-900">{item.id_producto}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${item.cantidad > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {item.cantidad} unidades
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">
                      {new Date(item.updated_at).toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleEliminar(item.id_producto)}
                        className="text-red-500 hover:text-red-700 font-bold transition"
                        title="Eliminar registro"
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