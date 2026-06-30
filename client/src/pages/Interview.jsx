import { Download, Heart, Play, Send, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/client.js";
import Alert from "../components/Alert.jsx";
import EmptyState from "../components/EmptyState.jsx";

const companies = ["", "Google", "Microsoft", "Amazon", "Adobe"];

export default function Interview() {
  const [settings, setSettings] = useState({
    difficulty: "medium",
    category: "mixed",
    company: "",
    count: 8
  });
  const [interview, setInterview] = useState(null);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get("/interviews")
      .then(({ data }) => {
        if (data.interviews[0]) {
          return api.get(`/interviews/${data.interviews[0]._id}`);
        }
        return null;
      })
      .then((response) => {
        if (response) setInterview(response.data.interview);
      })
      .catch(() => {});
  }, []);

  async function generate() {
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const { data } = await api.post("/interviews/generate", settings);
      setInterview(data.interview);
      setAnswers({});
      setMessage("Questions generated");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function favorite(questionId) {
    if (!interview) return;
    try {
      await api.patch(`/interviews/${interview._id}/questions/${questionId}/favorite`);
      const { data } = await api.get(`/interviews/${interview._id}`);
      setInterview(data.interview);
    } catch (err) {
      setError(err.message);
    }
  }

  async function evaluate() {
    if (!interview) return;
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        answers: interview.questions.map((question) => ({
          questionId: question._id,
          answer: answers[question._id] || ""
        }))
      };
      const { data } = await api.post(`/interviews/${interview._id}/evaluate`, payload);
      setInterview(data.interview);
      setMessage("Interview evaluated");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function exportReport() {
    if (!interview) return;
    try {
      const { data } = await api.get(`/interviews/${interview._id}/report`, {
        responseType: "blob"
      });
      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `interview-report-${interview._id}.pdf`;
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
          <h1>AI Interview Generator</h1>
          <p>HR, technical, project-based, behavioral and follow-up questions.</p>
        </div>
        <button className="primary-button" type="button" onClick={generate} disabled={busy}>
          <Play size={18} />
          <span>{busy ? "Working..." : "Generate"}</span>
        </button>
      </div>

      <Alert type="error" message={error} />
      <Alert type="success" message={message} />

      <section className="panel">
        <div className="settings-grid">
          <label>
            Difficulty
            <select
              value={settings.difficulty}
              onChange={(event) => setSettings({ ...settings, difficulty: event.target.value })}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
          <label>
            Question Type
            <select
              value={settings.category}
              onChange={(event) => setSettings({ ...settings, category: event.target.value })}
            >
              <option value="mixed">Mixed</option>
              <option value="hr">HR</option>
              <option value="technical">Technical</option>
              <option value="project">Project</option>
              <option value="behavioral">Behavioral</option>
            </select>
          </label>
          <label>
            Company
            <select
              value={settings.company}
              onChange={(event) => setSettings({ ...settings, company: event.target.value })}
            >
              {companies.map((company) => (
                <option key={company || "general"} value={company}>
                  {company || "General"}
                </option>
              ))}
            </select>
          </label>
          <label>
            Count
            <input
              type="number"
              min="3"
              max="15"
              value={settings.count}
              onChange={(event) => setSettings({ ...settings, count: Number(event.target.value) })}
            />
          </label>
        </div>
      </section>

      {interview ? (
        <>
          <section className="questions-list">
            {interview.questions.map((question, index) => (
              <article className="question-card" key={question._id}>
                <div className="question-topline">
                  <span>{index + 1}</span>
                  <strong>{question.type}</strong>
                  <button
                    className={`icon-button ${question.isFavorite ? "active" : ""}`}
                    type="button"
                    onClick={() => favorite(question._id)}
                    title="Favorite"
                  >
                    <Heart size={17} />
                  </button>
                </div>
                <h2>{question.question}</h2>
                <p>{question.expectedAnswer}</p>
                <textarea
                  rows="4"
                  placeholder="Answer"
                  value={answers[question._id] || ""}
                  onChange={(event) =>
                    setAnswers({ ...answers, [question._id]: event.target.value })
                  }
                />
                {question.followUps?.length ? (
                  <div className="followups">
                    {question.followUps.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </section>

          <section className="panel action-panel">
            <button className="primary-button" type="button" onClick={evaluate} disabled={busy}>
              <Send size={18} />
              <span>{busy ? "Evaluating..." : "Evaluate Answers"}</span>
            </button>
            {interview.status === "evaluated" ? (
              <button className="secondary-button" type="button" onClick={exportReport}>
                <Download size={18} />
                <span>Export PDF</span>
              </button>
            ) : null}
          </section>

          {interview.feedback?.summary ? (
            <section className="panel feedback-panel">
              <div className="panel-heading">
                <h2>AI Feedback</h2>
                <span className="score-pill">{interview.feedback.score || 0}/100</span>
              </div>
              <p>{interview.feedback.summary}</p>
              <div className="three-column">
                <div>
                  <h3>Strengths</h3>
                  <ul className="clean-list">
                    {(interview.feedback.strengths || []).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>Weaknesses</h3>
                  <ul className="clean-list">
                    {(interview.feedback.weaknesses || []).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>Suggestions</h3>
                  <ul className="clean-list">
                    {(interview.feedback.suggestions || []).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          ) : null}
        </>
      ) : (
        <EmptyState
          title="No interview generated"
          action={
            <button className="secondary-button" type="button" onClick={generate}>
              <Sparkles size={17} />
              <span>Generate Questions</span>
            </button>
          }
        />
      )}
    </div>
  );
}
