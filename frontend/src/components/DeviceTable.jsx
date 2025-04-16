import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as XLSX from "xlsx";
import { getDevices, createDevice, deleteDevice } from "../api/api";


const DeviceTable = () => {
  const [devices, setDevices] = useState([]);
  const [newDevice, setNewDevice] = useState({ name: "", type: "", location: "" });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Charge the dispos 
  useEffect(() => {
    console.log("DeviceTable se está ejecutando...");
    getDevices().then((data) => {
      console.log("Datos recibidos:", data);
      setDevices(data || []);
      setLoading(false);
    });
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);
      if (parsedData.length > 0) {
        setNewDevice(parsedData[0]); // Solo toma la primera fila para autocompletar
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleAddDevice = async () => {
    if (!newDevice.name) return;
    await createDevice(newDevice.name);
    setDevices([...devices, newDevice]);
    setShowForm(false);
    setNewDevice({ name: "", type: "", location: "" });
  };

  const handleDeleteDevice = async (name) => {
    await deleteDevice(name);
    setDevices(devices.filter((device) => device.name !== name));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Dispositivos IoT</h2>
      {loading ? (
        <p className="text-gray-500">Cargando dispositivos...</p>
      ) : devices.length === 0 ? (
        <p className="text-gray-500">No hay dispositivos disponibles.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Nombre</th>
              <th className="border p-2">Tipo</th>
              <th className="border p-2">Ubicación</th>
              <th className="border p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device, index) => (
              <tr key={index} className="border">
                <td className="border p-2">{device.name}</td>
                <td className="border p-2">{device.type}</td>
                <td className="border p-2">{device.location}</td>
                <td className="border p-2">
                  <Button className="mr-2" variant="outline">
                    Editar
                  </Button>
                  <Button variant="destructive" onClick={() => handleDeleteDevice(device.name)}>
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Button className="mt-4" onClick={() => setShowForm(true)}>
        Agregar Dispositivo
      </Button>

      {showForm && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <h3 className="text-lg font-bold mb-2">Nuevo Dispositivo</h3>
          <Input
            type="file"
            accept=".csv, .xlsx"
            className="mb-2"
            onChange={handleFileUpload}
          />
          <Input
            className="mb-2"
            placeholder="Nombre"
            value={newDevice.name}
            onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
          />
          <Input
            className="mb-2"
            placeholder="Tipo"
            value={newDevice.type}
            onChange={(e) => setNewDevice({ ...newDevice, type: e.target.value })}
          />
          <Input
            className="mb-2"
            placeholder="Ubicación"
            value={newDevice.location}
            onChange={(e) => setNewDevice({ ...newDevice, location: e.target.value })}
          />
          <Button onClick={handleAddDevice}>Guardar</Button>
        </div>
      )}
    </div>
  );
};

export default DeviceTable;
