"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Si el usuario está en el login o en la raíz, NO mostramos la barra de navegación
  const ocultarBarra = pathname === "/login" || pathname === "/";

  if (ocultarBarra) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      
      {/* BARRA LATERAL (SIDEBAR) SIMPLE */}
      <aside className="w-full md:w-64 bg-gray-900 text-white flex flex-col shrink-0 shadow-xl">
        <div className="p-5 border-b border-gray-800 font-bold text-xl tracking-wider text-blue-400 flex items-center gap-2">
          ⚙️ Panel SOA
        </div>
        
        {/* Enlaces de navegación con detección de página activa */}
        <nav className="flex-grow p-4 space-y-2">
          <Link 
            href="/productos" 
            className={`block p-3 rounded-lg font-medium transition ${pathname === '/productos' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
          >
            📦 Productos
          </Link>
          <Link 
            href="/inventario" 
            className={`block p-3 rounded-lg font-medium transition ${pathname === '/inventario' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
          >
            📊 Inventario
          </Link>
          <Link 
            href="/cliente" 
            className={`block p-3 rounded-lg font-medium transition ${pathname === '/cliente' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
          >
            👥 Clientes
          </Link>
          <Link 
            href="/pedidos" 
            className={`block p-3 rounded-lg font-medium transition ${pathname === '/pedidos' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
          >
            🛒 Pedidos
          </Link>
        </nav>
        
        <div className="p-4 border-t border-gray-800 text-xs text-center text-gray-500">
          Infraestructura Web • ITQ
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO PRINCIPAL */}
      <main className="flex-grow overflow-y-auto">
        {children}
      </main>

    </div>
  );
}