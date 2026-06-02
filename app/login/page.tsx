"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // EL TRUCO DE FASTAPI: OAuth2 espera datos de formulario (x-www-form-urlencoded)
    // NO un JSON normal. Si mandas un JSON, FastAPI te rechazará con error 422.
    const formData = new URLSearchParams();
    formData.append("username", correo); // FastAPI siempre lo llama "username" internamente
    formData.append("password", password);

    try {
      // Ajusta el puerto (ej. 8001) al microservicio donde pusiste la función /token
      const res = await fetch("http://marcoscuadrado.ddns.net:8001/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Correo o contraseña (PIN) incorrectos");
      }

      const data = await res.json();

      // Guardamos el "Pase VIP" en la memoria del navegador
      localStorage.setItem("token", data.access_token);

      // Si todo sale bien, lo mandamos al departamento de inventario
      router.push("/inventario");
      
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Acceso Administrativo
        </h1>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
              placeholder="ejemplo@correo.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PIN de Acceso
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
              placeholder="Tu contraseña maestra"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            Entrar al Sistema
          </button>
        </form>
      </div>
    </div>
  );
}