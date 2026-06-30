import { ArrowRight, Award, FileText, History, Star, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import Alert from "../components/Alert.jsx";
import EmptyState from "../components/EmptyState.jsx";
import StatCard from "../components/StatCard.jsx";

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard")
      .then(({ data }) => setDashboard(data))
      .catch((err) => setError(err.message));
  }, []);

  if (!dashboard && !error) {
    return <div className="page-loading">Loading dashboard...</div>;
  }

  const stats = dashboard?.stats || {};
  const activeResume = dashboard?.activeResume;
  const interviews = dashboard?.interviews || [];

  return (
    <div className="page-stack">
      <div className="page-title-row">
        <div>
          <h1>Dashboard</h1>
          <p>Resume score, interview history and progress tracking.</p>
        </div>
        <Link className="primary-button" to="/interview">
          <TrendingUp size={18} />
          <span>Start Practice</span>
        </Link>
      </div>

      <Alert type="error" message={error} />

      <section className="stats-grid">
        <StatCard icon={Award} label="Resume Score" value={`${stats.resumeScore || 0}/100`} />
        <StatCard
          icon={History}
          label="Interviews"
          value={stats.totalInterviews || 0}
          accent="amber"
        />
        <StatCard icon={TrendingUp} label="Avg Score" value={`${stats.averageScore || 0}/100`} accent="blue" />
        <StatCard icon={Star} label="Favorites" value={stats.favoriteQuestions || 0} accent="rose" />
      </section>

      <section className="two-column">
        <div className="panel">
          <div className="panel-heading">
            <h2>Recently Uploaded Resume</h2>
            <Link to="/resumes">Manage</Link>
          </div>
          {activeResume ? (
            <div className="resume-summary">
              <FileText size={28} />
              <div>
                <strong>{activeResume.originalName}</strong>
                <small>
                  {activeResume.analysis?.targetRole || "Target role"} -{" "}
                  {activeResume.analysis?.score || 0}/100
                </small>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No active resume"
              action={
                <Link className="secondary-button" to="/resumes">
                  <FileText size={17} />
                  <span>Upload Resume</span>
                </Link>
              }
            />
          )}
        </div>

        <div className="panel">
          <div className="panel-heading">
            <h2>Resume Analysis Summary</h2>
          </div>
          {activeResume?.analysis?.summary ? (
            <>
              <p>{activeResume.analysis.summary}</p>
              <div className="chip-list">
                {(activeResume.analysis.skills || []).slice(0, 8).map((skill) => (
                  <span className="chip" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <EmptyState title="Analysis pending" />
          )}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>Interview History</h2>
          <Link to="/history">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        {interviews.length ? (
          <div className="list-stack">
            {interviews.slice(0, 4).map((item) => (
              <article className="list-row" key={item._id}>
                <div>
                  <strong>{item.title}</strong>
                  <small>
                    {item.difficulty} - {item.company || "General"} - {item.status}
                  </small>
                </div>
                <span className="score-pill">{item.feedback?.score || 0}/100</span>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="No interviews yet" />
        )}
      </section>
    </div>
  );
}
