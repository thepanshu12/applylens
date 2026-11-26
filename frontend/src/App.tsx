
import { useEffect, useMemo, useState } from "react";
import "./App.css";
import {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication as deleteApplicationAPI,
} from "./api";
import type { Application, NewApplication } from "./api";

type ApplicationStatus = Application["status"];

const navigation = [
  { name: "Dashboard", icon: "⌂" },
  { name: "Applications", icon: "▤" },
  { name: "Resume Analyzer", icon: "▧" },
  { name: "Skill Gap", icon: "◈" },
  { name: "Interview Prep", icon: "◎" },
];

function formatDate(date: string): string {
  if (!date) return "Not specified";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function App() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [activePage, setActivePage] = useState("Dashboard");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [status, setStatus] =
    useState<ApplicationStatus>("Applied");

  // Fetch applications from FastAPI when the dashboard loads.
  useEffect(() => {
    async function fetchApplications() {
      try {
        setLoading(true);
        setError("");

        const result = await getApplications();
        setApplications(result.applications);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load applications."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, []);

  // Search and filter applications.
  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        application.company.toLowerCase().includes(searchText) ||
        application.role.toLowerCase().includes(searchText);

      const matchesStatus =
        filter === "All" || application.status === filter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, search, filter]);

  // Dashboard statistics.
  const totalApplications = applications.length;

  const interviewCount = applications.filter(
    (app) => app.status === "Interview"
  ).length;

  const assessmentCount = applications.filter(
    (app) => app.status === "Assessment"
  ).length;

  const selectedCount = applications.filter(
    (app) => app.status === "Selected"
  ).length;

  function resetForm() {
    setCompany("");
    setRole("");
    setDate(new Date().toISOString().slice(0, 10));
    setStatus("Applied");
    setEditingId(null);
    setShowForm(false);
  }

  function openAddForm() {
    setCompany("");
    setRole("");
    setDate(new Date().toISOString().slice(0, 10));
    setStatus("Applied");
    setEditingId(null);
    setError("");
    setShowForm(true);
  }

  function openEditForm(application: Application) {
    setCompany(application.company);
    setRole(application.role);
    setDate(application.date);
    setStatus(application.status);
    setEditingId(application.id);
    setError("");
    setShowForm(true);
  }

  // Create or update an application through FastAPI.
  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!company.trim() || !role.trim() || !date) {
      setError("Please complete all application fields.");
      return;
    }

    const applicationData: NewApplication = {
      company: company.trim(),
      role: role.trim(),
      date,
      status,
    };

    try {
      setSaving(true);
      setError("");

      if (editingId !== null) {
        const updated = await updateApplication(
          editingId,
          applicationData
        );

        setApplications((previous) =>
          previous.map((application) =>
            application.id === editingId ? updated : application
          )
        );
      } else {
        const created = await createApplication(applicationData);

        setApplications((previous) => [
          created,
          ...previous,
        ]);
      }

      resetForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save application."
      );
    } finally {
      setSaving(false);
    }
  }

  // Delete an application through FastAPI.
  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this application?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");

      await deleteApplicationAPI(id);

      setApplications((previous) =>
        previous.filter((application) => application.id !== id)
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete application."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="app-layout">

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">A</div>
          <span>ApplyLens</span>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="navigation">
          {navigation.map((item) => (
            <button
              key={item.name}
              className={
                activePage === item.name
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() => setActivePage(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">✦</div>
            <strong>Need a little help?</strong>
            <p>
              Keep moving towards your career goals.
            </p>
          </div>

          <div className="profile">
            <div className="avatar">D</div>
            <div>
              <strong>Dipanshu Giri</strong>
              <span>Student account</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">

        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> {activePage}
          </div>

          <div className="topbar-right">
            <span className="date-label">
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <div className="top-avatar">D</div>
          </div>
        </header>

        <section className="welcome-section">
          <div>
            <p className="eyebrow">YOUR CAREER, ORGANIZED</p>
            <h1>Welcome back, Dipanshu! 👋</h1>
            <p className="welcome-description">
              Every application is a step forward.
              Here's where your placement journey stands today.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={openAddForm}
          >
            <span>+</span> Add application
          </button>
        </section>

        {/* API error notification */}
        {error && (
          <div
            role="alert"
            style={{
              padding: "12px 16px",
              marginBottom: "20px",
              borderRadius: "10px",
              background: "#fff0f0",
              color: "#b42318",
            }}
          >
            {error}
          </div>
        )}

        {/* Statistics */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-top">
              <span>Total applications</span>
              <span className="stat-icon purple">▤</span>
            </div>
            <h2>{totalApplications}</h2>
            <p>Your tracked opportunities</p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Interviews</span>
              <span className="stat-icon green">◎</span>
            </div>
            <h2>{interviewCount}</h2>
            <p>Interview opportunities</p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Assessments</span>
              <span className="stat-icon orange">◈</span>
            </div>
            <h2>{assessmentCount}</h2>
            <p>Pending or ongoing stages</p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Selected</span>
              <span className="stat-icon blue">✦</span>
            </div>
            <h2>{selectedCount}</h2>
            <p>Successful applications</p>
          </div>
        </section>

        <section className="content-grid">

          {/* Applications panel */}
          <div className="panel applications-panel">
            <div className="panel-heading">
              <div>
                <h3>Recent applications</h3>
                <p>Keep an eye on your opportunities.</p>
              </div>

              <span className="record-count">
                {applications.length} records
              </span>
            </div>

            <div className="table-controls">
              <input
                type="search"
                placeholder="Search company or role..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              >
                <option value="All">All statuses</option>
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Assessment">Assessment</option>
                <option value="Rejected">Rejected</option>
                <option value="Selected">Selected</option>
              </select>
            </div>

            <div className="application-list">

              {loading && (
                <p className="empty-message">
                  Loading applications...
                </p>
              )}

              {!loading && filteredApplications.map((application) => (
                <div
                  className="application-row"
                  key={application.id}
                >
                  <div className="company-avatar">
                    {application.company.charAt(0).toUpperCase()}
                  </div>

                  <div className="company-info">
                    <strong>{application.company}</strong>
                    <span>{application.role}</span>
                  </div>

                  <span className="application-date">
                    {formatDate(application.date)}
                  </span>

                  <span
                    className={`status status-${application.status.toLowerCase()}`}
                  >
                    {application.status}
                  </span>

                  <div className="row-actions">
                    <button
                      className="action-button"
                      title="Edit application"
                      onClick={() => openEditForm(application)}
                      disabled={deletingId === application.id}
                    >
                      Edit
                    </button>

                    <button
                      className="action-button delete-button"
                      title="Delete application"
                      onClick={() => handleDelete(application.id)}
                      disabled={deletingId === application.id}
                    >
                      {deletingId === application.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              ))}

              {!loading && filteredApplications.length === 0 && (
                <p className="empty-message">
                  No applications found. Try another search or add one.
                </p>
              )}
            </div>
          </div>

          {/* Skills panel */}
          <div className="right-column">
            <div className="panel progress-panel">
              <h3>Skill development</h3>
              <p className="panel-subtitle">
                Your learning journey at a glance.
              </p>

              {[
                {
                  name: "Data Structures & Algorithms",
                  value: 75,
                  color: "",
                },
                {
                  name: "Database Management",
                  value: 60,
                  color: "green-fill",
                },
                {
                  name: "Operating Systems",
                  value: 45,
                  color: "orange-fill",
                },
                {
                  name: "Computer Networks",
                  value: 35,
                  color: "blue-fill",
                },
              ].map((skill) => (
                <div className="skill-item" key={skill.name}>
                  <div>
                    <span>{skill.name}</span>
                    <strong>{skill.value}%</strong>
                  </div>

                  <div className="progress-track">
                    <div
                      className={`progress-fill ${skill.color}`}
                      style={{ width: `${skill.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="tip-card">
              <span>✦ A small reminder</span>
              <h3>Consistency beats intensity.</h3>
              <p>
                A little preparation every day can make
                a meaningful difference when interview
                season arrives.
              </p>
            </div>
          </div>
        </section>

        <footer className="footer">
          ApplyLens · Built to make your career journey a little easier.
        </footer>
      </main>

      {/* Add / Edit application form */}
      {showForm && (
        <div
          className="modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget && !saving) {
              resetForm();
            }
          }}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="application-form-title"
          >
            <div className="modal-heading">
              <div>
                <h2 id="application-form-title">
                  {editingId !== null
                    ? "Edit application"
                    : "Add new application"}
                </h2>
                <p>
                  Enter the details of your internship opportunity.
                </p>
              </div>

              <button
                className="close-button"
                onClick={resetForm}
                aria-label="Close form"
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label htmlFor="company">Company name</label>
                <input
                  id="company"
                  type="text"
                  placeholder="e.g. Microsoft"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="role">Job role</label>
                <input
                  id="role"
                  type="text"
                  placeholder="e.g. Software Engineer Intern"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="date">Application date</label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="status">Application status</label>
                <select
                  id="status"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as ApplicationStatus)
                  }
                >
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Assessment">Assessment</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Selected">Selected</option>
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId !== null
                      ? "Save changes"
                      : "Add application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
