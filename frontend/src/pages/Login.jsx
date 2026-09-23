import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "./Login.css";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const from = location.state?.from?.pathname || "/home";

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(username, password);
            navigate(from, { replace: true });
        } catch (err) {
            if (err.response?.status === 401) {
                setError("Invalid username or password.");
            } else {
                setError("Something went wrong. Please try again.");
            }
            console.error("Login error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* =====================================================
                LEFT — WORKBENCH SCENE (62vw / 62%)
                ===================================================== */}
            <div className="workbench-scene">
                {/* COZY STRING LIGHTS */}
                <div className="string-lights">
                    <svg className="lights-wire-svg" viewBox="0 0 1000 120" preserveAspectRatio="none">
                        <path
                            d="M 0,15 Q 240,75 480,25 Q 740,80 1000,20"
                            className="lights-wire"
                        />
                    </svg>
                    <div className="string-bulb b1"></div>
                    <div className="string-bulb b2"></div>
                    <div className="string-bulb b3"></div>
                    <div className="string-bulb b4"></div>
                    <div className="string-bulb b5"></div>
                    <div className="string-bulb b6"></div>
                    <div className="string-bulb b7"></div>
                    <div className="string-bulb b8"></div>
                    <div className="string-bulb b9"></div>
                    <div className="string-bulb b10"></div>
                </div>

                {/* BRAND */}
                <div className="brand">
                    <div className="brand-mark">⌘</div>
                    <h1 className="brand-title">Code Workbench</h1>
                    <p className="brand-tagline">your little corner to build things</p>
                </div>

                {/* WALL FRAME (STRAIGHT & BALANCED) */}
                <div className="wall-frame">
                    <div className="frame-mat">
                        <div className="frame-content">
                            <span className="frame-badge">KEEP BUILDING</span>
                            <div className="frame-quote">
                                one thing
                                <br />
                                at a time.
                            </div>
                            <span className="frame-code">&lt;build /&gt;</span>
                        </div>
                    </div>
                </div>

                {/* WALL BOOKSHELF */}
                <div className="wall-bookshelf">
                    <div className="shelf-board"></div>
                    <div className="shelf-bracket shelf-bracket-left"></div>
                    <div className="shelf-bracket shelf-bracket-right"></div>
                    <div className="shelf-books">
                        <div className="shelf-book book-green"></div>
                        <div className="shelf-book book-terracotta"></div>
                        <div className="shelf-book book-mustard"></div>
                        <div className="shelf-book book-olive"></div>
                    </div>
                    <div className="shelf-vase"></div>
                </div>

                {/* HANGING PLANT */}
                <div className="hanging-plant">
                    <div className="hanging-mount"></div>
                    <div className="hanging-cord"></div>
                    <div className="hanging-pot">
                        <div className="hanging-leaf leaf-1"></div>
                        <div className="hanging-leaf leaf-2"></div>
                        <div className="hanging-leaf leaf-3"></div>
                        <div className="hanging-leaf leaf-4"></div>
                    </div>
                </div>

                {/* WORKBENCH / DESK */}
                <div className="workbench">
                    {/* TABLETOP SLAB */}
                    <div className="tabletop">
                        <div className="tabletop-surface"></div>
                        <div className="tabletop-edge"></div>
                        <div className="tabletop-shadow"></div>

                        {/* OBJECTS SITTING FIRMLY ON TABLETOP */}
                        <div className="tabletop-items">
                            {/* DESK LAMP */}
                            <div className="desk-lamp">
                                <div className="lamp-glow"></div>
                                <div className="lamp-base"></div>
                                <div className="lamp-stem"></div>
                                <div className="lamp-joint"></div>
                                <div className="lamp-arm"></div>
                                <div className="lamp-neck"></div>
                                <div className="lamp-head">
                                    <div className="lamp-shade">
                                        <div className="lamp-inner">
                                            <div className="lamp-bulb"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* LAPTOP */}
                            <div className="laptop">
                                <div className="laptop-screen">
                                    <div className="screen-camera"></div>
                                    <div className="screen-display">
                                        <div className="editor-topbar">
                                            <span className="editor-dot red"></span>
                                            <span className="editor-dot yellow"></span>
                                            <span className="editor-dot green"></span>
                                            <span className="editor-filename">workbench.rs</span>
                                        </div>
                                        <div className="code-content">
                                            <div className="code-line ln-1">
                                                <span className="c-kw">fn</span>{" "}
                                                <span className="c-fn">build_workspace</span>() {"{"}
                                            </div>
                                            <div className="code-line ln-2">
                                                {"  "}<span className="c-kw">let</span> mut desk = Desk::new();
                                            </div>
                                            <div className="code-line ln-3">
                                                {"  "}desk.<span className="c-fn">add_warmth</span>();
                                            </div>
                                            <div className="code-line ln-4">
                                                {"  "}desk.<span className="c-fn">focus</span>();
                                            </div>
                                            <div className="code-line ln-5">{"}"}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="laptop-base">
                                    <div className="trackpad"></div>
                                </div>
                            </div>

                            {/* DESK PLANT */}
                            <div className="desk-plant">
                                <div className="desk-leaf d-leaf-1"></div>
                                <div className="desk-leaf d-leaf-2"></div>
                                <div className="desk-leaf d-leaf-3"></div>
                                <div className="desk-leaf d-leaf-4"></div>
                                <div className="desk-leaf d-leaf-5"></div>
                                <div className="desk-pot"></div>
                            </div>

                            {/* STATIONERY HOLDER / PEN CONTAINER */}
                            <div className="stationery-holder">
                                <div className="cup-opening"></div>
                                <div className="cup-contents">
                                    <div className="pen pen-pencil-yellow">
                                        <div className="pencil-eraser"></div>
                                        <div className="pencil-ferrule"></div>
                                        <div className="pencil-body"></div>
                                    </div>
                                    <div className="pen pen-fineliner-black">
                                        <div className="pen-clip"></div>
                                        <div className="pen-cap"></div>
                                        <div className="pen-body"></div>
                                    </div>
                                    <div className="ruler"></div>
                                    <div className="pen pen-pencil-green">
                                        <div className="pencil-eraser"></div>
                                        <div className="pencil-ferrule"></div>
                                        <div className="pencil-body"></div>
                                    </div>
                                    <div className="pen pen-stylus-terracotta">
                                        <div className="pen-clip"></div>
                                        <div className="pen-body"></div>
                                    </div>
                                </div>
                                <div className="pen-cup">
                                    <div className="cup-rim"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TABLE FRAME & LEGS (Realistic Table Structure) */}
                    <div className="table-under">
                        {/* WALL SHADOW & STRETCHER IN KNEEHOLE */}
                        <div className="table-kneehole-space">
                            <div className="kneehole-shadow"></div>
                            <div className="table-stretcher"></div>
                        </div>

                        {/* TABLE APRON & CRAFTSMAN DRAWER */}
                        <div className="table-apron">
                            <div className="table-drawer">
                                <div className="drawer-panel">
                                    <div className="drawer-handle"></div>
                                </div>
                            </div>
                        </div>

                        {/* TABLE LEGS */}
                        <div className="table-leg leg-left">
                            <div className="leg-front"></div>
                            <div className="leg-side"></div>
                            <div className="leg-foot"></div>
                        </div>
                        <div className="table-leg leg-right">
                            <div className="leg-front"></div>
                            <div className="leg-side"></div>
                            <div className="leg-foot"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* =====================================================
                RIGHT — LOGIN PANEL (38vw / 38%)
                ===================================================== */}
            <div className="login-panel">
                <div className="paper-card">
                    <div className="paper-fold"></div>

                    <div className="card-badge-wrap">
                        <span className="workspace-badge">MY WORKSPACE</span>
                    </div>

                    <h2 className="card-title">Welcome back</h2>
                    <p className="card-subtitle">Your workbench is waiting.</p>

                    <form className="login-form" onSubmit={handleLogin}>
                        <div className="form-field">
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                required
                                autoComplete="username"
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        {error && <div className="form-error">{error}</div>}

                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={loading}
                        >
                            {loading ? "Opening..." : "Open Workbench"}
                        </button>
                    </form>

                    <div style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "var(--text-muted)" }}>
                        Need a workbench?{" "}
                        <Link to="/register" style={{ color: "var(--muted-green)", fontWeight: 600 }}>
                            Create your workspace
                        </Link>
                    </div>

                    <div className="card-footer">
                        build · break · learn
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;