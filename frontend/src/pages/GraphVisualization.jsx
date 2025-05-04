import { useEffect, useRef, useState } from "react";
import { Network } from "vis-network";
import { DataSet } from "vis-data";
import axios from "axios";
import { Maximize2, Minimize2 } from "lucide-react";

const GraphVisualization = () => {
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/graph-data");
        const { nodes, links } = response.data;

        const nodesDataSet = new DataSet(nodes.map((node) => ({
          id: node.id,
          label: node.name || node.id,
          group: node.label,
          color: {
            background: getNodeColor(node.label),
            border: "black",
          },
          shape: getNodeShape(node.label),
        })));

        const edgesDataSet = new DataSet(links.map((link) => ({
          from: link.source,
          to: link.target,
          label: link.type,
          arrows: "to",
          color: {
            color: "#d1d1d1",
            highlight: "#a0a0a0",
          },
          font: {
            color: "#333",
            size: 12,
          }
        })));

        const data = {
          nodes: nodesDataSet,
          edges: edgesDataSet,
        };

        const options = {
          nodes: {
            font: {
              size: 16,
              color: "#333",
            },
            borderWidth: 2,
            size: 30,
          },
          edges: {
            arrows: {
              to: { enabled: true, scaleFactor: 0.7 },
            },
            font: {
              size: 14,
            },
            color: {
              inherit: false,
            },
            smooth: {
              type: "continuous",
            }
          },
          physics: {
            enabled: true,
            barnesHut: {
              gravitationalConstant: -2000,
              centralGravity: 0.3,
              springLength: 200,
              springConstant: 0.04,
              damping: 0.09,
            },
          },
          interaction: {
            navigationButtons: true,
            keyboard: true,
            zoomView: true,
            dragView: true,
          },
        };

        if (containerRef.current) {
          if (networkRef.current) {
            networkRef.current.destroy();
          }
          networkRef.current = new Network(containerRef.current, data, options);
        }
      } catch (error) {
        console.error("Error al cargar el grafo:", error);
      }
    };

    fetchGraphData();

    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
      }
    };
  }, []);

  const getNodeColor = (label) => {
    switch (label) {
      case "Thing":
        return "#F8C300";
      case "Sensor":
        return "#1E90FF";
      case "Module":
        return "#32CD32";
      case "Power":
        return "#FF6347";
      case "Network":
        return "#FFD700";
      default:
        return "#B0C4DE";
    }
  };

  const getNodeShape = (label) => {
    switch (label) {
      case "Thing":
        return "dot";
      case "Sensor":
        return "square";
      case "Module":
        return "triangle";
      case "Power":
        return "star";
      case "Network":
        return "hexagon";
      default:
        return "ellipse";
    }
  };

  const handleZoomIn = () => {
    if (networkRef.current) {
      const scale = networkRef.current.getScale() * 1.2;
      networkRef.current.moveTo({ scale: scale });
    }
  };

  const handleZoomOut = () => {
    if (networkRef.current) {
      const scale = networkRef.current.getScale() * 0.8;
      networkRef.current.moveTo({ scale: scale });
    }
  };

  const handleFullscreen = () => {
    const container = containerRef.current;
    if (container) {
      if (!document.fullscreenElement) {
        container.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="graph-visualization-wrapper" style={{ position: "relative", width: "100%", height: "100%" }}>
      <button 
        onClick={handleFullscreen} 
        title="Pantalla completa" 
        style={fullScreenBtnStyle}
      >
        {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
      </button>
      <button onClick={handleZoomIn} title="Acercar" style={zoomBtnStyle}>+</button>
      <button onClick={handleZoomOut} title="Alejar" style={{...zoomBtnStyle, right: "90px"}}>-</button>
      
      <div ref={containerRef} style={{ width: "100%", height: "100%", background: "white" }} />
    </div>
  );
};

const fullScreenBtnStyle = {
  position: "absolute",
  top: "10px",
  right: "10px",
  backgroundColor: "#4CAF50", 
  color: "white",
  border: "none",
  borderRadius: "50%",
  padding: "8px",
  cursor: "pointer",
  zIndex: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
};

const zoomBtnStyle = {
  position: "absolute",
  top: "10px",
  right: "60px",
  backgroundColor: "#0077b6",
  color: "white",
  border: "none",
  padding: "5px 10px",
  borderRadius: "8px",
  cursor: "pointer",
  zIndex: 10,
  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
  fontWeight: "bold"
};

export default GraphVisualization; 





