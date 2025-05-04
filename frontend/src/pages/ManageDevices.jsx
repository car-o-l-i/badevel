import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Upload, Info, Database, Network, Zap, Cpu, Building, Box } from "lucide-react";
import ChatbotFloating from "../components/ChatbotFloating";
import PropTypes from "prop-types";
import GraphVisualization from "./GraphVisualization";

function ManageDevices({ userRole, darkMode, toggleDarkMode }) {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [editingDevice, setEditingDevice] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [showGraph, setShowGraph] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [selectedCsvType, setSelectedCsvType] = useState("devices");
  const [importResult, setImportResult] = useState(null);
  const [entityData, setEntityData] = useState({});
  const [selectedEntityType, setSelectedEntityType] = useState("devices");
  const [loading, setLoading] = useState(false);

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

  const getNodeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'devices':
      case 'thing':
      case 'things':
        return <Box size={20} />;
      case 'sensor':
      case 'sensors':
        return <Cpu size={20} />;
      case 'module':
        return <Cpu size={20} />;
      case 'network':
        return <Network size={20} />;
      case 'power':
        return <Zap size={20} />;
      case 'location':
      case 'department':
        return <Building size={20} />;
      default:
        return <Database size={20} />;
    }
  };

  const fetchEntityData = async (entityType) => {
    setLoading(true);
    try {
      let endpoint;
      if (entityType === 'devices') {
        endpoint = 'devices';
      } else {
        endpoint = `nodes/${entityType}`;
      }
      
      console.log(`Fetching data from ${endpoint}`);
      const response = await axios.get(`http://localhost:5000/${endpoint}`);
      console.log('API Response:', response.data);
      
      if (entityType === 'devices') {
        const devicesData = response.data.devices.map(name => ({ name, id: name }));
        console.log('Processed devices data:', devicesData);
        setEntityData(prevData => ({...prevData, [entityType]: devicesData}));
      } else if (response.data.nodes) {
        console.log('Processed nodes data:', response.data.nodes);
        setEntityData(prevData => ({...prevData, [entityType]: response.data.nodes}));
      } else {
        console.warn(`No data found for ${entityType}`, response.data);
        setEntityData(prevData => ({...prevData, [entityType]: []}));
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération des ${entityType}:`, error);
      setEntityData(prevData => ({...prevData, [entityType]: []}));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEntityType) {
      fetchEntityData(selectedEntityType);
    }
  }, [selectedEntityType]);

  // Afficher les données d'entité dans la console pour le débogage
  useEffect(() => {
    console.log('Current entity data:', entityData);
    console.log('Selected entity type:', selectedEntityType);
    console.log('Entity data for selected type:', entityData[selectedEntityType]);
  }, [entityData, selectedEntityType]);

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
      let endpoint = "upload-csv";
      
      // Utiliser des points de terminaison spécifiques basés sur le type sélectionné
      if (selectedCsvType !== "devices") {
        endpoint = `import-${selectedCsvType}`;
      }

      const response = await axios.post(`http://localhost:5000/${endpoint}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      setImportResult({
        success: true,
        message: `Importation réussie de ${response.data.imported || 0} éléments.`
      });
      
      // Mettre à jour la visualisation avec le type d'entité importé
      setSelectedEntityType(selectedCsvType);
      
      // Fermer le modal après 3 secondes
      setTimeout(() => {
        setShowCsvModal(false);
        setImportResult(null);
      }, 3000);
    } catch (error) {
      console.error("Erreur lors du chargement du CSV:", error);
      setImportResult({
        success: false,
        message: `Erreur: ${error.response?.data?.error || error.message}`
      });
    }
  };

  // Format attendu pour chaque type de CSV
  const csvFormats = {
    things: "identifier,name,lat,lon,latest_value",
    sensors: "identifier,name,entType,unit,description",
    power: "identifier,name",
    network: "identifier,name",
    thingtype: "identifier,name",
    module: "identifier,name",
    vendor: "identifier,name,entType",
    manufacturer: "identifier,name",
    location: "identifier,name",
    department: "identifier,name",
    application: "identifier,name",
    relation: "thingId,entityid,relationshipname,prop"
  };

  // Liste des types d'entités disponibles
  const entityTypes = [
    { value: "devices", label: "Appareils" },
    { value: "things", label: "Things" },
    { value: "sensors", label: "Sensors" },
    { value: "power", label: "Power" },
    { value: "network", label: "Network" },
    { value: "module", label: "Module" },
    { value: "vendor", label: "Vendor" },
    { value: "manufacturer", label: "Manufacturer" },
    { value: "location", label: "Location" },
    { value: "department", label: "Department" },
    { value: "application", label: "Application" }
  ];

  return (
    <div className="container" style={{ marginTop: "0", paddingTop: "30" }}>
      <div
        className="d-flex align-items-center justify-content-between mb-4 px-3"
        style={{ marginTop: "30px" }}
      >
        <div style={{ flex: 1 }}></div>
        <div className="header-bar">
          <h2 className="page-title"> Gestion des appareils</h2>
        </div>

        <div style={{ flex: 1 }} className="text-end">
          <button
            className="btn btn-outline-light btn-sm px-2 py-1"
            onClick={toggleDarkMode}
            style={{
              fontSize: "0.75rem",
              lineHeight: "1",
              borderRadius: "8px",
            }}
          >
            {darkMode ? "☀️ Mode clair" : "🌃 Mode sombre"}
          </button>
        </div>
      </div>
      {/* Sección de relación entre nodos */}
      <div className="d-flex justify-content-center align-items-center gap-2 mb-4">
        <select
          className="form-select form-select-sm shadow-sm"
          style={{ width: "180px" }}
        >
          <option>Appareil</option>
        </select>
        <select
          className="form-select form-select-sm shadow-sm"
          style={{ width: "180px" }}
        >
          <option>Connexion</option>
        </select>
        <select
          className="form-select form-select-sm shadow-sm"
          style={{ width: "180px" }}
        >
          <option>Entité</option>
        </select>
        <button className="btn btn-success btn-sm">Ajouter</button>
      </div>

      <div className="card-container">
        <button
          className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
          onClick={() => setShowCsvModal(true)}
        >
          <Upload size={16} /> Importer des données CSV
        </button>
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={() => setShowGraph(!showGraph)}
        >
          {showGraph ? "Masquer le graphe" : "Voir le graphe"}
        </button>
      </div>

      {showGraph && (
        <div className="mb-4" style={{ height: "400px", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <GraphVisualization />
        </div>
      )}

      {/* Sélecteur de type d'entité et affichage */}
      <div className="mb-4 mt-4">
        <div className="card shadow-sm">
          <div className="card-header bg-primary bg-opacity-10 d-flex justify-content-between align-items-center">
            <h5 className="mb-0 d-flex align-items-center gap-2">
              <Database size={18} /> Entités importées
            </h5>
            <select 
              className="form-select form-select-sm" 
              style={{ width: "200px" }}
              value={selectedEntityType}
              onChange={(e) => setSelectedEntityType(e.target.value)}
            >
              {entityTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="text-center my-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-2">Chargement des données...</p>
              </div>
            ) : (
              <div className="row g-4">
                {entityData[selectedEntityType] && entityData[selectedEntityType].length > 0 ? (
                  entityData[selectedEntityType].map((entity, index) => (
                    <div key={index} className="col-md-4 col-lg-3">
                      <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body">
                          <div className="d-flex align-items-center mb-3">
                            <div className="me-3 p-2 rounded-circle bg-primary bg-opacity-10 text-primary">
                              {getNodeIcon(selectedEntityType)}
                            </div>
                            <h6 className="card-title mb-0">{entity.name || entity.id || "Sans nom"}</h6>
                          </div>
                          <div className="small text-muted">
                            <div><strong>ID:</strong> {entity.id || "N/A"}</div>
                            {entity.entType && (
                              <div><strong>Type:</strong> {entity.entType}</div>
                            )}
                            {entity.unit && (
                              <div><strong>Unité:</strong> {entity.unit}</div>
                            )}
                            {entity.description && (
                              <div><strong>Description:</strong> {entity.description}</div>
                            )}
                            {entity.lat && entity.lon && (
                              <div><strong>Position:</strong> {entity.lat}, {entity.lon}</div>
                            )}
                            {/* Afficher toutes les propriétés inconnues */}
                            <div className="mt-2">
                              {Object.entries(entity)
                                .filter(([key]) => !['id', 'name', 'entType', 'unit', 'description', 'lat', 'lon'].includes(key))
                                .map(([key, value]) => (
                                  <div key={key}><strong>{key}:</strong> {JSON.stringify(value)}</div>
                                ))
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12 text-center py-4">
                    <div className="text-muted">
                      <Info size={48} className="mb-2 opacity-50" />
                      <p>Aucune donnée disponible pour ce type d'entité.</p>
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setShowCsvModal(true)}
                      >
                        Importer des données
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal pour l'importation CSV */}
      {showCsvModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
             style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="card" style={{ minWidth: "500px", maxWidth: "700px" }}>
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Importer des données CSV</h5>
              <button 
                className="btn-close" 
                onClick={() => {
                  setShowCsvModal(false);
                  setImportResult(null);
                }}
              ></button>
            </div>
            <div className="card-body">
              {importResult ? (
                <div className={`alert ${importResult.success ? 'alert-success' : 'alert-danger'}`}>
                  {importResult.message}
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <label className="form-label">Type de données</label>
                    <select 
                      className="form-select" 
                      value={selectedCsvType}
                      onChange={(e) => setSelectedCsvType(e.target.value)}
                    >
                      <option value="devices">Appareils</option>
                      <option value="things">Things</option>
                      <option value="sensors">Sensors</option>
                      <option value="power">Power</option>
                      <option value="network">Network</option>
                      <option value="thingtype">ThingType</option>
                      <option value="module">Module</option>
                      <option value="vendor">Vendor</option>
                      <option value="manufacturer">Manufacturer</option>
                      <option value="location">Location</option>
                      <option value="department">Department</option>
                      <option value="application">Application</option>
                      <option value="relationships">Relations</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="csvFile" className="form-label">Fichier CSV</label>
                    <input
                      type="file"
                      className="form-control"
                      id="csvFile"
                      accept=".csv"
                      onChange={handleCsvUpload}
                    />
                  </div>

                  {selectedCsvType !== "devices" && (
                    <div className="alert alert-info d-flex align-items-center">
                      <Info size={20} className="me-2" />
                      <div>
                        <strong>Format attendu:</strong><br />
                        <code>{csvFormats[selectedCsvType] || "Format standard CSV"}</code>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="card-footer d-flex justify-content-end">
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setShowCsvModal(false);
                  setImportResult(null);
                }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

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