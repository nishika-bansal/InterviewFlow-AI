import { Clipboard, PenLine, Sparkles } from "lucide-react";
import { useState } from "react";
import api from "../api/client.js";
import Alert from "../components/Alert.jsx";

export default function CoverLetter() {
  const [form, setForm] = useState({ company: "", role: "", jobDescription: "" });
  const [coverLetter, setCoverLetter] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function generate(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const { data } = await api.post("/cover-letter", form);
      setCoverLetter(data.coverLetter);
      setMessage("Cover letter generated");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function copyText() {
    await navigator.clipboard.writeText(coverLetter);
    setMessage("Copied");
  }

  return (
    <div className="page-stack">
      <div className="page-title-row">
        <div>
          <h1>AI Cover Letter</h1>
          <p>Role, company and job-description aligned letter.</p>
        </div>
      </div>

      <Alert type="error" message={error} />
      <Alert type="success" message={message} />

      <section className="two-column wide-left">
        <form className="panel form-grid" onSubmit={generate}>
          <div className="panel-heading">
            <h2>Generator</h2>
          </div>
          <label>
            Company
            <input
              value={form.company}
              onChange={(event) => setForm({ ...form, company: event.target.value })}
            />
          </label>
          <label>
            Role
            <input value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} />
          </label>
          <label className="full-span">
            Job Description
            <textarea
              rows="10"
              value={form.jobDescription}
              onChange={(event) => setForm({ ...form, jobDescription: event.target.value })}
            />
          </label>
          <button className="primary-button" type="submit" disabled={busy}>
            <Sparkles size={18} />
            <span>{busy ? "Generating..." : "Generate Letter"}</span>
          </button>
        </form>

        <div className="panel">
          <div className="panel-heading">
            <h2>Draft</h2>
            {coverLetter ? (
              <button className="icon-button" type="button" onClick={copyText} title="Copy">
                <Clipboard size={17} />
              </button>
            ) : null}
          </div>
          {coverLetter ? (
            <pre className="letter-preview">{coverLetter}</pre>
          ) : (
            <div className="empty-state">
              <PenLine size={22} />
              <strong>No draft</strong>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
