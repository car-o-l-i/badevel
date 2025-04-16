import { useEffect, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";
import ChatbotFloating from "../components/ChatbotFloating";
import PropTypes from "prop-types";

function ManageDevices({ userRole, darkMode, toggleDarkMode }) {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [editingDevice, setEditingDevice] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [showGraph, setShowGraph] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await axios.get("http://localhost:5000/devices");
      setDevices(response.data.devices);
    } catch (error) {
      console.error("Erreur lors de la récupération des appareils:", error);
    }
  };

  const deleteDevice = async (name) => {
    try {
      await axios.delete(`http://localhost:5000/devices/${name}`);
      fetchDevices();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'appareil:", error);
    }
  };

  const startEdit = (name) => {
    setEditingDevice(name);
    setEditedName(name);
  };

  const saveEdit = async (oldName) => {
    try {
      await axios.put(`http://localhost:5000/devices/${oldName}`, {
        new_name: editedName,
      });
      setEditingDevice(null);
      fetchDevices();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'appareil:", error);
    }
  };

  const handleCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("http://localhost:5000/upload-csv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchDevices();
    } catch (error) {
      console.error("Erreur lors du chargement du CSV:", error);
    }
  };

  return (
    <div className="container" style={{ marginTop: "0", paddingTop: "0" }}>
     <div className="d-flex align-items-center justify-content-between mb-4 px-3">
  <div style={{ flex: 1 }}></div>
  <h2 className="m-0 text-center" style={{ flex: 1, color: "var(--text-color)", fontWeight: 600 }}>
    Gestion des appareils
  </h2>
  <div style={{ flex: 1 }} className="text-end">
    <button
      className="btn btn-outline-light btn-sm px-2 py-1"
      onClick={toggleDarkMode}
      style={{ fontSize: "0.75rem", lineHeight: "1", borderRadius: "8px" }}
    >
      {darkMode ? "☀️ Mode clair" : "🌃 Mode sombre"}
    </button>
  </div>
</div>
      {/* Sección de relación entre nodos */}
      <div className="d-flex justify-content-center align-items-center gap-2 mb-4">
        <select className="form-select form-select-sm shadow-sm" style={{ width: "180px" }}>
          <option>Appareil</option>
        </select>
        <select className="form-select form-select-sm shadow-sm" style={{ width: "180px" }}>
          <option>Connexion</option>
        </select>
        <select className="form-select form-select-sm shadow-sm" style={{ width: "180px" }}>
          <option>Entité</option>
        </select>
        <button className="btn btn-success btn-sm">Ajouter</button>
      </div>

      <div className="d-flex justify-content-center align-items-center gap-2 mb-4">
        <label htmlFor="csvInput" className="btn btn-outline-secondary btn-sm">
          📂 Charger un fichier CSV
        </label>
        <input
          type="file"
          id="csvInput"
          accept=".csv"
          onChange={handleCsvUpload}
          style={{ display: "none" }}
        />
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={() => setShowGraph(!showGraph)}
        >
          {showGraph ? "Masquer le graphe" : "Voir le graphe"}
        </button>
      </div>

      {showGraph && (
        <div className="mb-4 text-center">
          <p style={{ color: "var(--text-color)" }}>
            📊 Ici s&apos;affichera le graphe de dispositifs (à intégrer)
          </p>
        </div>
      )}

      <div className="d-flex flex-wrap justify-content-center gap-4">
        {devices.map((device, index) => (
          <div
            key={index}
            className="position-relative"
            style={{
              width: "300px",
              background: "var(--card-bg)",
              borderRadius: "20px",
              padding: "20px",
              color: "var(--text-color)",
              boxShadow: "var(--card-shadow)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.1)"
            }}
          >
            <button
              onClick={() => deleteDevice(device)}
              className="position-absolute top-0 end-0 btn btn-link p-2"
              style={{ color: "#ff6b6b", fontSize: "1.2rem" }}
              title="Supprimer"
            >
              <X size={20} />
            </button>

            {editingDevice === device ? (
              <>
                <input
                  className="form-control mb-2"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                />
                <button
                  className="btn btn-outline-light btn-sm me-2"
                  onClick={() => saveEdit(device)}
                >
                  Enregistrer
                </button>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setEditingDevice(null)}
                >
                  Annuler
                </button>
              </>
            ) : (
              <>
                <h5 className="card-title fw-semibold">{device}</h5>
                <p className="card-text small">
                  Appareil enregistré dans la base de données.
                </p>

                {selectedDevice === device && (
                  <div className="text-muted mt-2 small">
                    <p><strong>Nom :</strong> {device}</p>
                    <p><strong>Dernière mise à jour :</strong> {new Date().toLocaleString()}</p>
                  </div>
                )}

                <div className="d-flex justify-content-between mt-3">
                  <button
                    className="btn btn-outline-info btn-sm"
                    onClick={() => setSelectedDevice(device)}
                  >
                    Voir détails
                  </button>
                  <button
                    className="btn btn-outline-warning btn-sm"
                    onClick={() => startEdit(device)}
                  >
                    Modifier
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {userRole === "admin" && <ChatbotFloating />}
    </div>
  );
}

ManageDevices.propTypes = {
  userRole: PropTypes.string.isRequired,
  darkMode: PropTypes.bool,
  toggleDarkMode: PropTypes.func,
};

export default ManageDevices;
