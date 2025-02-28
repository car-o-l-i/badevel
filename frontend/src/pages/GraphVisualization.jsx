import React, { useEffect, useRef } from "react";
import NeoVis from "neovis.js";

const GraphVisualization = () => {
  const visRef = useRef(null);

  useEffect(() => {
    const config = {
      containerId: "viz",
      neo4j: {
        serverUrl: "bolt://localhost:7687",
        serverUser: "neo4j",
        serverPassword: "Password123", // Asegúrate de usar la contraseña correcta
      },
      labels: {
        Device: {
          caption: "name",
          size: "pagerank",
          community: "community",
        },
      },
      relationships: {
        CONNECTED_TO: {
          caption: true,
        },
      },
      initialCypher: "MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 50",
    };

    const viz = new NeoVis(config);
    viz.render();
  }, []);

  return <div id="viz" className="w-full h-screen border"></div>;
};

export default GraphVisualization;

