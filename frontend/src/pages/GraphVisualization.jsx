import { useEffect, useRef } from "react";
import { Network } from "vis-network/standalone";
import axios from "axios";

const GraphVisualization = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/graph-data");
        const { nodes, links } = response.data;

        const data = {
          nodes: nodes.map((node) => ({
            id: node.id,
            label: node.name || node.id,
            group: node.label
          })),
          edges: links.map((link) => ({
            from: link.source,
            to: link.target,
            label: link.type,
            arrows: "to"
          }))
        };

        const options = {
          nodes: {
            shape: "dot",
            size: 20,
            font: {
              size: 14,
              color: "#000"
            }
          },
          edges: {
            arrows: {
              to: { enabled: true, scaleFactor: 0.7 }
            },
            font: {
              align: "top"
            }
          },
          physics: {
            stabilization: false,
            barnesHut: {
              gravitationalConstant: -2000,
              springLength: 100
            }
          }
        };

        new Network(containerRef.current, data, options);
      } catch (error) {
        console.error("Error al cargar el grafo:", error);
      }
    };

    fetchGraphData();
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
};

export default GraphVisualization;
