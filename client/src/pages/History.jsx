import { Download, Eye, Star } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/client.js";
import Alert from "../components/Alert.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function History() {
  const [interviews, setInterviews] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  async function loadHistory() {
    const { data } = await api.get("/interviews");
    setInterviews(data.interviews);
    if (data.interviews[0]) {
      const detail = await api.get(`/interviews/${data.interviews[0]._id}`);
      setSelected(detail.data.interview);
    }
  }

  useEffect(() => {
    loadHistory().catch((err) => setError(err.message));
  }, []);

  async function openInterview(id) {
    try {
      const { data } = await api.get(`/interviews/${id}`);
      setSelected(data.interview);
    } catch (err) {
      setError(err.message);
    }
  }

  async function exportReport(id) {
    try {
      const { data } = await api.get(`/interviews/${id}/report`, { responseType: "blob" });
      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `interview-report-${id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page-stack">
      <div className="page-title-row">
        <div>
          <h1>Interview History</h1>
          <p>Previous questions, saved favorites and scores.</p>
        </div>
      </div>

      <Alert type="error" message={error} />

      <section className="two-column wide-left">
        <div className="panel">
          <div className="panel-heading">
            <h2>Sessions</h2>
          </div>
          {interviews.length ? (
            <div className="list-stack">
              {interviews.map((item) => (
                <article className="list-row" key={item._id}>
                  <button type="button" className="text-button" onClick={() => openInterview(item._id)}>
                    <strong>{item.title}</strong>
                    <small>
                      {item.difficulty} - {item.company || "General"} -{" "}
                      {new Date(item.createdAt).toLocaleDateString()}
                    </small>
                  </button>
                  <div className="row-actions">
                    <span className="score-pill">{item.feedback?.score || 0}/100</span>
                    <button className="icon-button" type="button" onClick={() => openInterview(item._id)} title="View">
                      <Eye size={17} />
                    </button>
                    <button
                      className="icon-button"
                      type="button"
                      onClick={() => exportReport(item._id)}
                      title="Export PDF"
                    >
                      <Download size={17} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="No history yet" />
          )}
        </div>

        <div className="panel">
          <div className="panel-heading">
            <h2>Session Details</h2>
            {selected ? <span className="score-pill">{selected.feedback?.score || 0}/100</span> : null}
          </div>
          {selected ? (
            <div className="detail-stack">
              <p>{selected.feedback?.summary || "Evaluation pending."}</p>
              <div className="question-mini-list">
                {selected.questions.map((question) => (
                  <article key={question._id}>
                    <div>
                      <strong>{question.question}</strong>
                      <small>{question.type}</small>
                    </div>
                    {question.isFavorite ? <Star size={17} /> : null}
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState title="Select a session" />
          )}
        </div>
      </section>
    </div>
  );
}
