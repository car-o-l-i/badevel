import axios from "axios";

const API_URL = "http://127.0.0.1:5000"; // URL del backend Flask

export const getDevices = async () => {
    try {
        const response = await axios.get(`${API_URL}/devices`);
        return response.data.devices;
    } catch (error) {
        console.error("Error fetching devices:", error);
        return [];
    }
};

export const createDevice = async (name) => {
    try {
        const response = await axios.post(`${API_URL}/devices`, { name });
        return response.data;
    } catch (error) {
        console.error("Error creating device:", error);
        return null;
    }
};

// Nueva función: Eliminar un dispositivo
export const deleteDevice = async (name) => {
    try {
        const response = await axios.delete(`${API_URL}/devices/${name}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting device:", error);
        return null;
    }
};
