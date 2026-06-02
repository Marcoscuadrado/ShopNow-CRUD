"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Interfaz alineada exactamente con tus modelos Pedido y PedidoNuevo
interface Pedido {
  id_pedido: number;
  id_cliente: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  descuento_pct: number;
  costo: number;
  total: number;
  estado: string;
  fecha_pedido: string;
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // Estados del formulario expandidos
  const [formId, setFormId] = useState("");
  const [formCliente, setFormCliente] = useState("");
  const [formProducto, setFormProducto] = useState("");
  const [formCantidad, setFormCantidad] = useState("");
  const [formPrecio, setFormPrecio] = useState("");
  const [formDescuento, setFormDescuento] = useState("0");
  const [formCosto, setFormCosto] = useState("");
  const [formTotal, setFormTotal] = useState("");
  const [formEstado, setFormEstado] = useState("pendiente");

  const cargarPedidos = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("http://marcoscuadrado.ddns.net:8003/v1/pedidos", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!res.ok) throw new Error("Error al obtener la lista de pedidos, intentelo mas tarde");
      const data = await res.json();
      setPedidos(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  // --- FUNCIÓN POST: Crear pedido nuevo ---
  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación de que los campos numéricos esenciales existan
    if (!formCliente || !formProducto || !formCantidad || !formPrecio || !formCosto || !formTotal) {
        return alert("Faltan datos obligatorios para crear el pedido (Cliente, Producto, Cantidad, Precio, Costo o Total).");
    }
    
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://marcoscuadrado.ddns.net:8003/v1/pedidos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // Mapeo exacto al modelo PedidoNuevo
        body: JSON.stringify({
          id_cliente: parseInt(formCliente),
          id_producto: parseInt(formProducto),
          cantidad: parseInt(formCantidad),
          precio_unitario: parseFloat(formPrecio),
          descuento_pct: parseFloat(formDescuento),
          costo: parseFloat(formCosto),
          total: parseFloat(formTotal),
          estado: formEstado
        }),
      });

      if (!res.ok) throw new Error("Error al registrar el pedido. Revisa que el Cliente y el Producto existan.");
      
      // Limpiar formulario tras éxito
      setFormCliente("");
      setFormProducto("");
      setFormCantidad("");
      setFormPrecio("");
      setFormDescuento("0");
      setFormCosto("");
      setFormTotal("");
      setFormEstado("pendiente");
      cargarPedidos(); 
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- FUNCIÓN PATCH: Actualizar pedido ---
  const handleActualizar = async () => {
    if (!formId) return alert("Necesitas el ID del pedido para actualizarlo");
    const token = localStorage.getItem("token");

    // Mapeo exacto al modelo PedidoActualizar
    const datosActualizados: any = {};
    if (formCliente) datosActualizados.id_cliente = parseInt(formCliente);
    if (formProducto) datosActualizados.id_producto = parseInt(formProducto);
    if (formCantidad) datosActualizados.cantidad = parseInt(formCantidad);
    if (formEstado) datosActualizados.estado = formEstado;

    try {
      const res = await fetch(`http://marcoscuadrado.ddns.net:8003/v1/pedidos/${formId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(datosActualizados),
      });

      if (!res.ok) throw new Error("Error al actualizar (Verifica que el ID exista)");
      
      setFormId("");
      cargarPedidos();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEliminar = async (id_pedido: number) => {
    const confirmar = window.confirm(`¿Estás seguro de cancelar/eliminar el pedido ${id_pedido}?`);
    if (!confirmar) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://marcoscuadrado.ddns.net:8003/v1/pedidos/${id_pedido}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al eliminar el pedido");
      cargarPedidos();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (cargando) return <div className="min-h-screen flex items-center justify-center">Cargando pedidos...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Departamento de Pedidos</h1>
          <button onClick={cerrarSesion} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition">
            Cerrar Sesión
          </button>
        </div>

        {/* Panel de Control CRUD */}
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <h2 className="text-lg font-bold mb-4 text-gray-700">Gestión de Órdenes</h2>
          <form className="flex flex-col gap-4" onSubmit={handleAgregar}>
            
            {/* Primera Fila: IDs y Cantidad */}
            <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">ID (Actualizar)</label>
                  <input type="number" value={formId} onChange={(e) => setFormId(e.target.value)} className="border p-2 rounded-lg w-24 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white" placeholder="Ej. 1"/>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">ID Cliente</label>
                  <input type="number" value={formCliente} onChange={(e) => setFormCliente(e.target.value)} className="border p-2 rounded-lg w-28 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">ID Producto</label>
                  <input type="number" value={formProducto} onChange={(e) => setFormProducto(e.target.value)} className="border p-2 rounded-lg w-28 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Cantidad</label>
                  <input type="number" value={formCantidad} onChange={(e) => setFormCantidad(e.target.value)} className="border p-2 rounded-lg w-28 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Estado</label>
                  <select value={formEstado} onChange={(e) => setFormEstado(e.target.value)} className="border p-2 rounded-lg w-36 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white">
                    <option value="pendiente">Pendiente</option>
                    <option value="pagado">Pagado</option>
                    <option value="enviado">Enviado</option>
                    <option value="entregado">Entregado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
            </div>

            {/* Segunda Fila: Financieros */}
            <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Precio Unitario ($)</label>
                  <input type="number" step="0.01" value={formPrecio} onChange={(e) => setFormPrecio(e.target.value)} className="border p-2 rounded-lg w-36 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Descuento (%)</label>
                  <input type="number" step="0.01" value={formDescuento} onChange={(e) => setFormDescuento(e.target.value)} className="border p-2 rounded-lg w-32 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Costo ($)</label>
                  <input type="number" step="0.01" value={formCosto} onChange={(e) => setFormCosto(e.target.value)} className="border p-2 rounded-lg w-32 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white" />
                </div>
                <div className="flex-grow">
                  <label className="block text-sm text-gray-600 mb-1">Total ($)</label>
                  <input type="number" step="0.01" value={formTotal} onChange={(e) => setFormTotal(e.target.value)} className="border p-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white" />
                </div>
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition h-10 mt-6">
                  Crear Pedido
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
                  <th className="p-4 font-semibold"># Pedido</th>
                  <th className="p-4 font-semibold">Cliente/Prod</th>
                  <th className="p-4 font-semibold">Financieros</th>
                  <th className="p-4 font-semibold">Estado</th>
                  <th className="p-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido) => (
                  <tr key={pedido.id_pedido} className="border-b hover:bg-gray-50 transition">
                    <td className="p-4 font-medium text-gray-900">
                      {pedido.id_pedido}<br/>
                      <span className="text-xs text-gray-400">{new Date(pedido.fecha_pedido || '').toLocaleDateString()}</span>
                    </td>
                    <td className="p-4 text-gray-800">
                      <div>👤 ID: {pedido.id_cliente}</div>
                      <div>📦 ID: {pedido.id_producto} <span className="text-gray-500">(x{pedido.cantidad})</span></div>
                    </td>
                    <td className="p-4 text-gray-600 text-sm">
                      <div>P.U: ${pedido.precio_unitario}</div>
                      <div>Desc: {pedido.descuento_pct}%</div>
                      <div className="font-bold text-gray-900 mt-1">Total: ${pedido.total}</div>
                    </td>
                    <td className="p-4">
                        <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider
                          ${pedido.estado === 'entregado' ? 'bg-green-100 text-green-700' : 
                            pedido.estado === 'cancelado' ? 'bg-red-100 text-red-700' : 
                            pedido.estado === 'pagado' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'}`}>
                          {pedido.estado}
                        </span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleEliminar(pedido.id_pedido)}
                        className="text-red-500 hover:text-red-700 font-bold transition"
                      >
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pedidos.length === 0 && (
              <div className="p-8 text-center text-gray-500">No hay pedidos registrados en el sistema.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}