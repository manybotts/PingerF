// src/App.js
import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://your-railway-backend-url";

function App() {
    const [apps, setApps] = useState([]);
    const [newAppUrl, setNewAppUrl] = useState("");

    useEffect(() => {
        axios.get(`${API_BASE_URL}/apps`)
            .then((response) => setApps(response.data))
            .catch((error) => console.error("Error fetching apps:", error));
    }, []);

    const addApp = () => {
        if (newAppUrl) {
            axios.post(`${API_BASE_URL}/apps`, { url: newAppUrl })
                .then(() => {
                    setApps([...apps, newAppUrl]);
                    setNewAppUrl("");
                })
                .catch((error) => console.error("Error adding app:", error));
        }
    };

    const removeApp = (url) => {
        axios.delete(`${API_BASE_URL}/apps`, { data: { url } })
            .then(() => {
                setApps(apps.filter((app) => app !== url));
            })
            .catch((error) => console.error("Error removing app:", error));
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial", textAlign: "center" }}>
            <h2>Koyeb App Pinger</h2>
            <input
                type="text"
                placeholder="Enter Koyeb App URL"
                value={newAppUrl}
                onChange={(e) => setNewAppUrl(e.target.value)}
                style={{ padding: "10px", width: "300px", marginRight: "10px" }}
            />
            <button onClick={addApp} style={{ padding: "10px" }}>Add</button>
            <ul style={{ marginTop: "20px", listStyle: "none" }}>
                {apps.map((app, index) => (
                    <li key={index} style={{ padding: "10px", borderBottom: "1px solid gray" }}>
                        {app} <button onClick={() => removeApp(app)} style={{ marginLeft: "10px" }}>Remove</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
