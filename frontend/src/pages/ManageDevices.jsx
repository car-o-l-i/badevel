import { useEffect, useState } from "react";
import axios from "axios";

const ManageDevices = () => {
  const [devices, setDevices] = useState([]);
  const [newDevice, setNewDevice] = useState("");

  // Cargar los dispositivos al iniciar
  useEffect(() => {
    axios.get("http://127.0.0.1:5000/devices")
      .then(response => setDevices(response.data.devices))
      .catch(error => console.error("Error al obtener dispositivos:", error));
  }, []);

  // Agregar un dispositivo
  const handleAddDevice = () => {
    if (!newDevice.trim()) return;
    axios.post("http://127.0.0.1:5000/devices", { name: newDevice })
      .then(() => {
        setDevices([...devices, { name: newDevice }]);
        setNewDevice("");
      })
      .catch(error => console.error("Error al agregar dispositivo:", error));
  };

  // Eliminar un dispositivo
  const handleDeleteDevice = (name) => {
    axios.delete(`http://127.0.0.1:5000/devices/${name}`)
      .then(() => setDevices(devices.filter(device => device.name !== name)))
      .catch(error => console.error("Error al eliminar dispositivo:", error));
  };

  return (
    <div className="flex h-screen w-screen">
      {/* Sidebar de Sensores */}
      <div className="w-1/5 bg-yellow-500 p-6 text-center text-lg font-bold text-white shadow-lg h-full flex items-center justify-center">
        Sensores
      </div>

      {/* Sección principal que ocupa todo el espacio restante */}
      <div className="w-4/5 p-8 bg-white shadow-md rounded-lg flex flex-col justify-between">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-700">Gestión de Dispositivos IoT</h2>

        {/* Botones superiores alineados */}
        <div className="flex justify-between mb-6">
          <button className="bg-orange-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-orange-600 transition">
            📂 Importar CSV
          </button>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 transition" onClick={() => handleAddDevice()}>
            ➕ Agregar Dispositivo
          </button>
        </div>

        {/* Contenedor de tabla con diseño mejorado */}
        <div className="flex-grow overflow-hidden rounded-lg shadow-lg border">
          <table className="w-full border-collapse bg-white">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="border p-4 text-left">Nombre</th>
                <th className="border p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {devices.length > 0 ? (
                devices.map((device, index) => (
                  <tr key={index} className="border hover:bg-gray-100 transition">
                    <td className="border p-4">{device.name}</td>
                    <td className="border p-4 flex justify-center gap-4">
                      <button className="bg-red-500 text-white px-4 py-1 rounded-lg shadow-md hover:bg-red-700 transition" onClick={() => handleDeleteDevice(device.name)}>
                        ❌ Borrar
                      </button>
                      <button className="bg-yellow-500 text-white px-4 py-1 rounded-lg shadow-md hover:bg-yellow-600 transition">
                        ✏️ Editar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="text-center p-6 text-gray-500">No hay dispositivos registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Input para agregar un nuevo dispositivo */}
        <div className="mt-6 flex justify-center items-center gap-4">
          <input
            type="text"
            className="border p-3 flex-grow max-w-lg rounded-lg shadow-sm focus:ring focus:ring-blue-300"
            placeholder="Nombre del dispositivo"
            value={newDevice}
            onChange={(e) => setNewDevice(e.target.value)}
          />
          <button className="bg-green-500 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow-md transition" onClick={handleAddDevice}>
            ✅ Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageDevices;
