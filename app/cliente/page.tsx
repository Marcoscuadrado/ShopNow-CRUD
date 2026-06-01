"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Actualizamos la estructura para coincidir con tu backend
interface Cliente {
  id_cliente: number;
  nombre: string;
  correo: string;
  direccion: string;
  telefono: string;
  activo?: boolean;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // Estados para el formulario expandido
  const [formId, setFormId] = useState("");
  const [formNombre, setFormNombre] = useState("");
  const [formCorreo, setFormCorreo] = useState("");
  const [formDireccion, setFormDireccion] = useState("");
  const [formTelefono, setFormTelefono] = useState("");

  const cargarClientes = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8001/v1/clientes", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!res.ok) throw new Error("Error al obtener los datos de los clientes, intentelo mas tarde");
      const data = await res.json();
      setClientes(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  // --- FUNCIÓN POST: Agregar cliente nuevo ---
  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    // Ahora validamos que los 4 campos existan
    if (!formNombre || !formCorreo || !formDireccion || !formTelefono) {
        return alert("Llena Nombre, Correo, Dirección y Teléfono para agregar");
    }
    
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://127.0.0.1:8001/v1/clientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // Enviamos la estructura exacta que pide ClienteNuevo
        body: JSON.stringify({
          nombre: formNombre,
          correo: formCorreo,
          direccion: formDireccion,
          telefono: formTelefono
        }),
      });

      if (!res.ok) throw new Error("Error al registrar el cliente. Revisa los datos.");
      
      // Limpiamos todo al terminar
      setFormNombre("");
      setFormCorreo("");
      setFormDireccion("");
      setFormTelefono("");
      cargarClientes(); 
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- FUNCIÓN PATCH: Actualizar cliente ---
  const handleActualizar = async () => {
    if (!formId) return alert("Necesitas el ID del cliente para actualizarlo");
    const token = localStorage.getItem("token");

    // Construimos el body dinámicamente con ClienteActualizar
    const datosActualizados: any = {};
    if (formNombre) datosActualizados.nombre = formNombre;
    if (formCorreo) datosActualizados.correo = formCorreo;
    if (formDireccion) datosActualizados.direccion = formDireccion;
    if (formTelefono) datosActualizados.telefono = formTelefono;

    try {
      const res = await fetch(`http://127.0.0.1:8001/v1/clientes/${formId}`, {
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
      setFormCorreo("");
      setFormDireccion("");
      setFormTelefono("");
      cargarClientes();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- FUNCIÓN DELETE ---
  const handleEliminar = async (id_cliente: number) => {
    const confirmar = window.confirm(`¿Estás seguro de eliminar al cliente ${id_cliente}?`);
    if (!confirmar) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://127.0.0.1:8001/v1/clientes/${id_cliente}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al eliminar el cliente");
      cargarClientes();
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
          <h1 className="text-3xl font-bold text-gray-800">Departamento de Clientes</h1>
          <button onClick={cerrarSesion} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition">
            Cerrar Sesión
          </button>
        </div>

        {/* Panel de Control CRUD */}
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <h2 className="text-lg font-bold mb-4 text-gray-700">Gestión de Clientes</h2>
          <form className="flex flex-col gap-4" onSubmit={handleAgregar}>
            
            {/* Primera Fila de Inputs */}
            <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">ID (Actualizar)</label>
                  <input 
                    type="number" 
                    value={formId} 
                    onChange={(e) => setFormId(e.target.value)} 
                    className="border p-2 rounded-lg w-28 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    placeholder="Ej. 5"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Nombre</label>
                  <input 
                    type="text" 
                    value={formNombre} 
                    onChange={(e) => setFormNombre(e.target.value)} 
                    className="border p-2 rounded-lg w-48 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Correo</label>
                  <input 
                    type="email" 
                    value={formCorreo} 
                    onChange={(e) => setFormCorreo(e.target.value)} 
                    className="border p-2 rounded-lg w-56 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white" 
                  />
                </div>
            </div>

            {/* Segunda Fila de Inputs y Botones */}
            <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Teléfono</label>
                  <input 
                    type="text" 
                    value={formTelefono} 
                    onChange={(e) => setFormTelefono(e.target.value)} 
                    className="border p-2 rounded-lg w-40 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white" 
                  />
                </div>
                <div className="flex-grow">
                  <label className="block text-sm text-gray-600 mb-1">Dirección</label>
                  <input 
                    type="text" 
                    value={formDireccion} 
                    onChange={(e) => setFormDireccion(e.target.value)} 
                    className="border p-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white" 
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

        {/* Tabla de Datos */}
        {error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 border-b">
                  <th className="p-4 font-semibold">ID</th>
                  <th className="p-4 font-semibold">Nombre</th>
                  <th className="p-4 font-semibold">Contacto</th>
                  <th className="p-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente) => (
                  <tr key={cliente.id_cliente} className="border-b hover:bg-gray-50 transition">
                    <td className="p-4 font-medium text-gray-900">{cliente.id_cliente}</td>
                    <td className="p-4 text-gray-800">
                        <div className="font-bold">{cliente.nombre}</div>
                        <div className="text-sm text-gray-500">{cliente.direccion}</div>
                    </td>
                    <td className="p-4 text-gray-600">
                        <div>{cliente.correo}</div>
                        <div className="text-sm text-gray-500">{cliente.telefono}</div>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleEliminar(cliente.id_cliente)}
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