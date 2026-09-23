import { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import Button from "../../components/UI/Button";
import api from "../../services/api";
import "./Architecture.css";

const NODE_TYPES = [
  { type: "service", label: "Service", color: "#6D7D64" },
  { type: "process", label: "Process", color: "#A77B5F" },
  { type: "database", label: "Database", color: "#CFA864" },
  { type: "client", label: "Client / UI", color: "#5D6F55" },
];

let archCounter = 0;
function getArchId(prefix) {
  archCounter += 1;
  return `${prefix}-${archCounter}`;
}

export default function Architecture() {
  const { project } = useOutletContext();

  const [notes, setNotes] = useState("");
  const [nodes, setNodes] = useState([]);
  const [connectors, setConnectors] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [connectMode, setConnectMode] = useState(false);
  const [connectSourceId, setConnectSourceId] = useState(null);

  const [existsOnBackend, setExistsOnBackend] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const canvasRef = useRef(null);
  const draggingNodeRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Load architecture data
  useEffect(() => {
    let ignore = false;
    if (!project?.id) return;

    const loadArchitecture = async () => {
      try {
        const res = await api.get(`architecture/${project.id}/`);
        if (ignore) return;
        setExistsOnBackend(true);
        setNotes(res.data.text || "");
        if (res.data.drawing_data) {
          const parsed = typeof res.data.drawing_data === "string"
            ? JSON.parse(res.data.drawing_data)
            : res.data.drawing_data;
          setNodes(parsed.nodes || []);
          setConnectors(parsed.connectors || []);
        }
      } catch (err) {
        if (ignore) return;
        if (err.response?.status === 404) {
          setExistsOnBackend(false);
          // Set friendly starter nodes for new architecture
          setNodes([
            { id: "node-1", type: "client", title: "Web Frontend (React)", x: 60, y: 80 },
            { id: "node-2", type: "service", title: "API Gateway / Server", x: 280, y: 80 },
            { id: "node-3", type: "database", title: "PostgreSQL Database", x: 500, y: 80 },
          ]);
          setConnectors([
            { id: "c-1", from: "node-1", to: "node-2" },
            { id: "c-2", from: "node-2", to: "node-3" },
          ]);
        } else {
          console.error("Error loading architecture:", err);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadArchitecture();
    return () => { ignore = true; };
  }, [project?.id]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage("");

    const drawingData = {
      nodes,
      connectors,
    };

    try {
      if (existsOnBackend) {
        await api.patch(`update_architecture/${project.id}/`, {
          text: notes,
          drawing_data: drawingData,
        });
      } else {
        await api.post(`architecture/${project.id}/`, {
          text: notes,
          drawing_data: drawingData,
        });
        setExistsOnBackend(true);
      }
      setSaveMessage("Saved successfully!");
      setTimeout(() => setSaveMessage(""), 2500);
    } catch (err) {
      console.error("Error saving architecture:", err);
      setSaveMessage("Failed to save diagram.");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    if (window.confirm("Clear all nodes and connectors from this diagram?")) {
      setNodes([]);
      setConnectors([]);
      setSelectedNodeId(null);
      setConnectSourceId(null);
    }
  };

  const handleAddNode = (type) => {
    const newNode = {
      id: getArchId("node"),
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      x: 120 + ((nodes.length * 40) % 240),
      y: 100 + ((nodes.length * 30) % 180),
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
  };

  const handleDeleteNode = (id) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setConnectors((prev) => prev.filter((c) => c.from !== id && c.to !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  const handleUpdateNodeTitle = (id, newTitle) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, title: newTitle } : n))
    );
  };

  // Node Dragging Handlers
  const handleMouseDownNode = (e, node) => {
    if (connectMode) {
      handleNodeClickForConnect(node.id);
      return;
    }

    setSelectedNodeId(node.id);
    draggingNodeRef.current = node.id;
    dragOffsetRef.current = {
      x: e.clientX - node.x,
      y: e.clientY - node.y,
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!draggingNodeRef.current) return;
    const newX = Math.max(10, e.clientX - dragOffsetRef.current.x);
    const newY = Math.max(10, e.clientY - dragOffsetRef.current.y);

    setNodes((prev) =>
      prev.map((n) =>
        n.id === draggingNodeRef.current ? { ...n, x: newX, y: newY } : n
      )
    );
  };

  const handleMouseUp = () => {
    draggingNodeRef.current = null;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  const handleNodeClickForConnect = (nodeId) => {
    if (!connectSourceId) {
      setConnectSourceId(nodeId);
    } else if (connectSourceId !== nodeId) {
      // Create connector
      const newConnector = {
        id: getArchId("c"),
        from: connectSourceId,
        to: nodeId,
      };
      setConnectors((prev) => [...prev, newConnector]);
      setConnectSourceId(null);
      setConnectMode(false);
    }
  };

  // Calculate coordinates for connector lines
  const getNodeCenter = (id) => {
    const node = nodes.find((n) => n.id === id);
    if (!node) return { x: 0, y: 0 };
    return { x: node.x + 80, y: node.y + 35 };
  };

  if (loading) {
    return (
      <div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--font-serif)" }}>
        Setting up the architecture whiteboard...
      </div>
    );
  }

  return (
    <div className="diagram-page-container">
      {/* Header */}
      <div className="diagram-page-header">
        <div>
          <h2 className="diagram-header-title">System Architecture</h2>
          <p className="diagram-header-subtitle">
            "Understand how everything moves."
          </p>
        </div>

        <div className="diagram-header-actions">
          {saveMessage && (
            <span style={{ fontSize: "13px", color: "var(--muted-green)", fontWeight: 600 }}>
              {saveMessage}
            </span>
          )}
          <Button variant="secondary" size="sm" onClick={handleClear}>
            Clear
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Workspace"}
          </Button>
        </div>
      </div>

      {/* Split Workspace */}
      <div className="diagram-workspace-split">
        {/* Left: Notes Panel */}
        <div className="diagram-notes-panel">
          <h3 className="notes-panel-title">Architecture Notes</h3>
          <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "12px" }}>
            Document data flows, protocol decisions, and service boundaries.
          </p>
          <textarea
            className="notes-panel-textarea"
            placeholder="e.g. Frontend communicates via REST over HTTPS with JWT cookies. Async background worker processes OCR requests..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Right: Digital Whiteboard Canvas */}
        <div className="whiteboard-wrapper">
          {/* Toolbar */}
          <div className="whiteboard-toolbar">
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginRight: "6px" }}>
              Add Node:
            </span>
            {NODE_TYPES.map((nt) => (
              <button
                key={nt.type}
                type="button"
                className="tool-btn"
                onClick={() => handleAddNode(nt.type)}
              >
                + {nt.label}
              </button>
            ))}

            <div style={{ width: "1px", height: "20px", background: "var(--border)", margin: "0 6px" }} />

            <button
              type="button"
              className={`tool-btn ${connectMode ? "active" : ""}`}
              onClick={() => {
                setConnectMode(!connectMode);
                setConnectSourceId(null);
              }}
            >
              {connectMode
                ? connectSourceId
                  ? "Click target node..."
                  : "Click source node..."
                : "⇄ Connect Nodes"}
            </button>
          </div>

          {/* Whiteboard Canvas */}
          <div className="whiteboard-canvas" ref={canvasRef}>
            {/* SVG Connector Arrows Layer */}
            <svg className="connectors-svg">
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#786E60" />
                </marker>
              </defs>

              {connectors.map((c) => {
                const start = getNodeCenter(c.from);
                const end = getNodeCenter(c.to);
                return (
                  <line
                    key={c.id}
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke="#786E60"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })}
            </svg>

            {/* Draggable Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isConnectSource = connectSourceId === node.id;

              return (
                <div
                  key={node.id}
                  className={`diagram-node ${isSelected ? "selected" : ""}`}
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    borderColor: isConnectSource
                      ? "var(--terracotta)"
                      : isSelected
                      ? "var(--muted-green)"
                      : "var(--border)",
                  }}
                  onMouseDown={(e) => handleMouseDownNode(e, node)}
                >
                  <div className="node-header">
                    <span className="node-type-tag">{node.type}</span>
                    <button
                      type="button"
                      className="node-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNode(node.id);
                      }}
                      title="Remove node"
                    >
                      ✕
                    </button>
                  </div>

                  <input
                    type="text"
                    className="node-title-input"
                    value={node.title}
                    onChange={(e) =>
                      handleUpdateNodeTitle(node.id, e.target.value)
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
