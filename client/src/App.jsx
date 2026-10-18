
import { useEffect, useState } from "react";
import { apiRequest } from "./api";
import "./index.css";

const SEVERITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
const STATUSES = ["OPEN", "INVESTIGATING", "MITIGATED", "RESOLVED", "CLOSED"];

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("opsradar_token"));
  const [user, setUser] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("srishti.test@example.com");
  const [password, setPassword] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    severity: "MEDIUM",
    teamId: "",
  });

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const [me, incidentData] = await Promise.all([
        apiRequest("/auth/me"),
        apiRequest("/incidents"),
      ]);

      setUser(me.user);
      setIncidents(incidentData.incidents || []);

      const memberships = me.user.memberships || [];
      const availableTeams = memberships.map((membership) => ({
        id: membership.teamId,
        role: membership.role,
      }));

      setTeams(availableTeams);
      setForm((current) => ({
        ...current,
        teamId: current.teamId || availableTeams[0]?.id || "",
      }));
    } catch (err) {
      setError(err.message);
      if (err.message.toLowerCase().includes("token") ||
          err.message.toLowerCase().includes("authentication")) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) loadDashboard();
  }, [token]);

  async function login(event) {
    event.preventDefault();
    setError("");

    try {
      const result = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem("opsradar_token", result.token);
      setToken(result.token);
      setPassword("");
    } catch (err) {
      setError(err.message);
    }
  }

  function logout() {
    localStorage.removeItem("opsradar_token");
    setToken(null);
    setUser(null);
    setIncidents([]);
  }

  async function createIncident(event) {
    event.preventDefault();
    setError("");

    try {
      await apiRequest("/incidents", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setForm({
        title: "",
        description: "",
        severity: "MEDIUM",
        teamId: teams[0]?.id || "",
      });
      setShowCreate(false);
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateStatus(incident, status) {
    setError("");

    try {
      const result = await apiRequest(`/incidents/${incident.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setIncidents((current) =>
        current.map((item) =>
          item.id === incident.id ? result.incident : item
        )
      );
    } catch (err) {
      setError(err.message);
    }
  }

  const counts = {
    total: incidents.length,
    open: incidents.filter((item) => item.status === "OPEN").length,
    investigating: incidents.filter((item) => item.status === "INVESTIGATING").length,
    critical: incidents.filter((item) => item.severity === "CRITICAL").length,
  };

  if (!token) {
    return (
      <main className="login-page">
        <form className="login-card" onSubmit={login}>
          <div className="brand-mark">O</div>
          <p className="eyebrow">INCIDENT MANAGEMENT PLATFORM</p>
          <h1>Welcome to OpsRadar</h1>
          <p className="muted">Sign in to your incident command center.</p>

          {error && <div className="error-banner">{error}</div>}

          <label>Email address</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <button className="primary-button full-width" type="submit">
            Sign in
          </button>
          <p className="muted small">OpsRadar · Incident Command Center</p>
        </form>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">O</div>
          <span>OpsRadar</span>
        </div>

        <p className="nav-heading">WORKSPACE</p>
        <div className="nav-item active">▦ <span>Incidents</span></div>
        <div className="nav-item">◷ <span>Activity overview</span></div>

        <div className="sidebar-bottom">
          <div className="avatar">{user?.name?.charAt(0) || "U"}</div>
          <div className="user-info">
            <strong>{user?.name || "Loading user..."}</strong>
            <span>{user?.email}</span>
          </div>
          <button className="logout-button" onClick={logout} title="Sign out">
            ↪
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">OPERATIONS / OVERVIEW</p>
            <h1>Incident command center</h1>
          </div>
          <div className="topbar-actions">
            <span className="connection"><span /> API connected</span>
            <button className="primary-button" onClick={() => setShowCreate(true)}>
              + Create incident
            </button>
          </div>
        </header>

        {error && <div className="error-banner">{error}</div>}

        <section className="welcome-row">
          <div>
            <h2>Operational overview</h2>
            <p className="muted">Track, investigate, and resolve incidents.</p>
          </div>
          <button className="secondary-button" onClick={loadDashboard}>
            ↻ Refresh
          </button>
        </section>

        <section className="stats-grid">
          <StatCard label="Total incidents" value={counts.total} symbol="▦" />
          <StatCard label="Open" value={counts.open} symbol="○" />
          <StatCard label="Investigating" value={counts.investigating} symbol="◷" />
          <StatCard label="Critical severity" value={counts.critical} symbol="!" />
        </section>

        {showCreate && (
          <section className="panel create-panel">
            <div className="panel-header">
              <div>
                <h2>Create an incident</h2>
                <p className="muted">Record an operational issue for your team.</p>
              </div>
              <button className="icon-button" onClick={() => setShowCreate(false)}>×</button>
            </div>

            <form onSubmit={createIncident} className="incident-form">
              <label>Title</label>
              <input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                minLength={3}
                maxLength={160}
                required
              />

              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                rows={3}
                required
              />

              <div className="form-row">
                <div>
                  <label>Severity</label>
                  <select
                    value={form.severity}
                    onChange={(event) => setForm({ ...form, severity: event.target.value })}
                  >
                    {SEVERITIES.map((severity) => (
                      <option key={severity}>{severity}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Team</label>
                  <select
                    value={form.teamId}
                    onChange={(event) => setForm({ ...form, teamId: event.target.value })}
                    required
                  >
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>{team.id}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button className="primary-button" type="submit">Create incident</button>
            </form>
          </section>
        )}

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>All incidents</h2>
              <p className="muted">Live records from your OpsRadar database.</p>
            </div>
            <span className="record-count">{incidents.length} records</span>
          </div>

          {loading ? (
            <p className="empty-state">Loading incidents...</p>
          ) : incidents.length === 0 ? (
            <p className="empty-state">No incidents found. Create an incident to get started.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>INCIDENT</th>
                    <th>SEVERITY</th>
                    <th>STATUS</th>
                    <th>TEAM</th>
                    <th>UPDATED</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((incident) => (
                    <tr key={incident.id}>
                      <td>
                        <strong>{incident.title}</strong>
                        <span className="table-subtitle">{incident.description}</span>
                      </td>
                      <td><span className={`severity ${incident.severity.toLowerCase()}`}>{incident.severity}</span></td>
                      <td>
                        <select
                          className="status-select"
                          value={incident.status}
                          onChange={(event) => updateStatus(incident, event.target.value)}
                        >
                          {STATUSES.map((status) => <option key={status}>{status}</option>)}
                        </select>
                      </td>
                      <td>{incident.team?.name || "Unassigned team"}</td>
                      <td>{new Date(incident.updatedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer>OpsRadar · Incident Command Center <span>Operational visibility, in real time.</span></footer>
      </main>
    </div>
  );
}

function StatCard({ label, value, symbol }) {
  return (
    <article className="stat-card">
      <div className="stat-symbol">{symbol}</div>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}
