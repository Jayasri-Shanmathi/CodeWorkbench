import { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import Button from "../../components/UI/Button";
import api from "../../services/api";
import "./Architecture.css";

let schemaCounter = 0;
function getSchemaId(prefix) {
  schemaCounter += 1;
  return `${prefix}-${schemaCounter}`;
}

export default function DatabaseSchema() {
  const { project } = useOutletContext();

  const [notes, setNotes] = useState("");
  const [tables, setTables] = useState([]);
  const [connectors, setConnectors] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [connectMode, setConnectMode] = useState(false);
  const [connectSourceId, setConnectSourceId] = useState(null);

  const [existsOnBackend, setExistsOnBackend] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const canvasRef = useRef(null);
  const draggingTableRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Load database schema data
  useEffect(() => {
    let ignore = false;
    if (!project?.id) return;

    const loadSchema = async () => {
      try {
        const res = await api.get(`database_schema/${project.id}/`);
        if (ignore) return;
        setExistsOnBackend(true);
        setNotes(res.data.text || "");
        if (res.data.drawing_data) {
          const parsed =
            typeof res.data.drawing_data === "string"
              ? JSON.parse(res.data.drawing_data)
              : res.data.drawing_data;
          setTables(parsed.tables || []);
          setConnectors(parsed.connectors || []);
        }
      } catch (err) {
        if (ignore) return;
        if (err.response?.status === 404) {
          setExistsOnBackend(false);
          // Friendly starter schema
          setTables([
            {
              id: "tbl-1",
              name: "users",
              x: 60,
              y: 60,
              fields: [
                { name: "id", type: "INT PK" },
                { name: "username", type: "VARCHAR" },
                { name: "email", type: "VARCHAR" },
              ],
            },
            {
              id: "tbl-2",
              name: "projects",
              x: 320,
              y: 60,
              fields: [
                { name: "id", type: "INT PK" },
                { name: "user_id", type: "INT FK" },
                { name: "title", type: "VARCHAR" },
                { name: "created_at", type: "TIMESTAMP" },
              ],
            },
            {
              id: "tbl-3",
              name: "features",
              x: 580,
              y: 60,
              fields: [
                { name: "id", type: "INT PK" },
                { name: "project_id", type: "INT FK" },
                { name: "feature", type: "VARCHAR" },
                { name: "is_completed", type: "BOOLEAN" },
              ],
            },
          ]);
          setConnectors([
            { id: "c-1", from: "tbl-1", to: "tbl-2" },
            { id: "c-2", from: "tbl-2", to: "tbl-3" },
          ]);
        } else {
          console.error("Error loading schema:", err);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadSchema();
    return () => { ignore = true; };
  }, [project?.id]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage("");

    const drawingData = {
      tables,
      connectors,
    };

    try {
      if (existsOnBackend) {
        await api.patch(`update_database_schema/${project.id}/`, {
          text: notes,
          drawing_data: drawingData,
        });
      } else {
        await api.post(`database_schema/${project.id}/`, {
          text: notes,
          drawing_data: drawingData,
        });
        setExistsOnBackend(true);
      }
      setSaveMessage("Saved successfully!");
      setTimeout(() => setSaveMessage(""), 2500);
    } catch (err) {
      console.error("Error saving database schema:", err);
      setSaveMessage("Failed to save schema.");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    if (window.confirm("Clear all tables and relationships from this diagram?")) {
      setTables([]);
      setConnectors([]);
      setSelectedTableId(null);
      setConnectSourceId(null);
    }
  };

  const handleAddTable = () => {
    const newTable = {
      id: getSchemaId("tbl"),
      name: `new_table_${tables.length + 1}`,
      x: 100 + ((tables.length * 40) % 240),
      y: 80 + ((tables.length * 30) % 180),
      fields: [
        { name: "id", type: "INT PK" },
        { name: "created_at", type: "TIMESTAMP" },
      ],
    };
    setTables((prev) => [...prev, newTable]);
    setSelectedTableId(newTable.id);
  };

  const handleDeleteTable = (id) => {
    setTables((prev) => prev.filter((t) => t.id !== id));
    setConnectors((prev) => prev.filter((c) => c.from !== id && c.to !== id));
    if (selectedTableId === id) setSelectedTableId(null);
  };

  const handleUpdateTableName = (id, newName) => {
    setTables((prev) =>
      prev.map((t) => (t.id === id ? { ...t, name: newName } : t))
    );
  };

  const handleAddField = (tableId) => {
    const fieldName = prompt("Enter field name (e.g. status, title, count):");
    if (!fieldName) return;
    const fieldType = prompt("Enter field type (e.g. VARCHAR, INT, BOOLEAN, FK):") || "VARCHAR";

    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              fields: [...t.fields, { name: fieldName.trim(), type: fieldType.trim() }],
            }
          : t
      )
    );
  };

  // Table Dragging Handlers
  const handleMouseDownTable = (e, table) => {
    if (connectMode) {
      handleTableClickForConnect(table.id);
      return;
    }

    setSelectedTableId(table.id);
    draggingTableRef.current = table.id;
    dragOffsetRef.current = {
      x: e.clientX - table.x,
      y: e.clientY - table.y,
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!draggingTableRef.current) return;
    const newX = Math.max(10, e.clientX - dragOffsetRef.current.x);
    const newY = Math.max(10, e.clientY - dragOffsetRef.current.y);

    setTables((prev) =>
      prev.map((t) =>
        t.id === draggingTableRef.current ? { ...t, x: newX, y: newY } : t
      )
    );
  };

  const handleMouseUp = () => {
    draggingTableRef.current = null;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  const handleTableClickForConnect = (tableId) => {
    if (!connectSourceId) {
      setConnectSourceId(tableId);
    } else if (connectSourceId !== tableId) {
      const newConnector = {
        id: getSchemaId("c"),
        from: connectSourceId,
        to: tableId,
      };
      setConnectors((prev) => [...prev, newConnector]);
      setConnectSourceId(null);
      setConnectMode(false);
    }
  };

  const getTableCenter = (id) => {
    const tbl = tables.find((t) => t.id === id);
    if (!tbl) return { x: 0, y: 0 };
    return { x: tbl.x + 100, y: tbl.y + 40 };
  };

  if (loading) {
    return (
      <div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--font-serif)" }}>
        Loading schema whiteboard...
      </div>
    );
  }

  return (
    <div className="diagram-page-container">
      {/* Header */}
      <div className="diagram-page-header">
        <div>
          <h2 className="diagram-header-title">Database Schema</h2>
          <p className="diagram-header-subtitle">
            "Know what your data looks like."
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
            {saving ? "Saving..." : "Save Schema"}
          </Button>
        </div>
      </div>

      {/* Split Workspace */}
      <div className="diagram-workspace-split">
        {/* Left: Notes Panel */}
        <div className="diagram-notes-panel">
          <h3 className="notes-panel-title">Schema Notes</h3>
          <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "12px" }}>
            Document table relationships, indexes, constraints, and migrations.
          </p>
          <textarea
            className="notes-panel-textarea"
            placeholder="e.g. Users table has 1:N relationship with Projects. Features has cascading delete on Project..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Right: Digital Whiteboard Canvas */}
        <div className="whiteboard-wrapper">
          {/* Toolbar */}
          <div className="whiteboard-toolbar">
            <button
              type="button"
              className="tool-btn"
              onClick={handleAddTable}
            >
              + Add Table
            </button>

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
                  ? "Click target table..."
                  : "Click source table..."
                : "⇄ Connect Foreign Key"}
            </button>
          </div>

          {/* Whiteboard Canvas */}
          <div className="whiteboard-canvas" ref={canvasRef}>
            {/* SVG Relationship Connectors Layer */}
            <svg className="connectors-svg">
              <defs>
                <marker
                  id="schema-arrow"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#A77B5F" />
                </marker>
              </defs>

              {connectors.map((c) => {
                const start = getTableCenter(c.from);
                const end = getTableCenter(c.to);
                return (
                  <line
                    key={c.id}
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke="#A77B5F"
                    strokeWidth="2"
                    markerEnd="url(#schema-arrow)"
                  />
                );
              })}
            </svg>

            {/* Draggable Database Table Cards */}
            {tables.map((tbl) => {
              const isSelected = selectedTableId === tbl.id;
              const isConnectSource = connectSourceId === tbl.id;

              return (
                <div
                  key={tbl.id}
                  className={`diagram-node schema-table-node ${isSelected ? "selected" : ""}`}
                  style={{
                    left: `${tbl.x}px`,
                    top: `${tbl.y}px`,
                    borderColor: isConnectSource
                      ? "var(--terracotta)"
                      : isSelected
                      ? "var(--muted-green)"
                      : "var(--border)",
                  }}
                  onMouseDown={(e) => handleMouseDownTable(e, tbl)}
                >
                  <div className="table-header">
                    <input
                      type="text"
                      className="table-name-input"
                      value={tbl.name}
                      onChange={(e) =>
                        handleUpdateTableName(tbl.id, e.target.value)
                      }
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      type="button"
                      className="node-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTable(tbl.id);
                      }}
                      title="Remove table"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="table-fields-list">
                    {tbl.fields.map((f, fIdx) => (
                      <div key={fIdx} className="table-field-row">
                        <span className="table-field-name">{f.name}</span>
                        <span className="table-field-type">{f.type}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="add-field-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddField(tbl.id);
                    }}
                  >
                    + Add Field
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
