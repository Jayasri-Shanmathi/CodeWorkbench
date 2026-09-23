import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "./Login.css";

function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);

        try {
            await register(username, password, email);
            navigate("/home");
        } catch (err) {
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError("Something went wrong while setting up your workspace.");
            }
            console.error("Registration error:", err);
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
                {/* BRAND */}
                <div className="brand">
                    <div className="brand-mark">⌘</div>
                    <h1 className="brand-title">Code Workbench</h1>
                    <p className="brand-tagline">your little corner to build things</p>
                </div>

                {/* WALL FRAME */}
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
                    {/* TABLETOP */}
                    <div className="tabletop">
                        <div className="tabletop-surface"></div>
                        <div className="tabletop-edge"></div>

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

                            {/* STATIONERY HOLDER */}
                            <div className="stationery-holder">
                                <div className="pen pen-1"></div>
                                <div className="pen pen-2"></div>
                                <div className="pen pen-3"></div>
                                <div className="pen pen-4"></div>
                                <div className="pen-cup"></div>
                            </div>
                        </div>
                    </div>

                    {/* DESK CABINET / FRONT */}
                    <div className="desk-cabinet">
                        <div className="cabinet-trim"></div>
                        <div className="cabinet-drawer">
                            <div className="drawer-panel">
                                <div className="drawer-handle"></div>
                            </div>
                        </div>
                        <div className="cabinet-foot foot-left"></div>
                        <div className="cabinet-foot foot-right"></div>
                    </div>
                </div>
            </div>

            {/* =====================================================
                RIGHT — REGISTRATION PANEL (38vw / 38%)
                ===================================================== */}
            <div className="login-panel">
                <div className="paper-card">
                    <div className="paper-fold"></div>

                    <div className="card-badge-wrap">
                        <span className="workspace-badge">MY WORKSPACE</span>
                    </div>

                    <h2 className="card-title">Create your workspace</h2>
                    <p className="card-subtitle">A place to build, break and learn.</p>

                    <form className="login-form" onSubmit={handleRegister}>
                        <div className="form-field">
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Choose a username"
                                required
                                autoComplete="username"
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="email">Email (optional)</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@domain.com"
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a password"
                                required
                                autoComplete="new-password"
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="confirm-password">Confirm Password</label>
                            <input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                required
                                autoComplete="new-password"
                            />
                        </div>

                        {error && <div className="form-error">{error}</div>}

                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={loading}
                        >
                            {loading ? "Creating..." : "Create Workspace"}
                        </button>
                    </form>

                    <div style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "var(--text-muted)" }}>
                        Already have an account?{" "}
                        <Link to="/login" style={{ color: "var(--muted-green)", fontWeight: 600 }}>
                            Log in
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

export default Register;
