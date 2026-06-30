import { Eye, FileUp, RefreshCw, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../api/client.js";
import Alert from "../components/Alert.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function Resumes() {
  const [resumes, setResumes] = useState([]);
  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [selected, setSelected] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const activeResume = useMemo(() => resumes.find((resume) => resume.isActive), [resumes]);

  async function loadResumes() {
    const { data } = await api.get("/resumes");
    setResumes(data.resumes);
    if (!selected && data.resumes[0]) {
      setSelected(data.resumes[0]);
    }
  }

  useEffect(() => {
    loadResumes().catch((err) => setError(err.message));
  }, []);

  async function handleUpload(event) {
    event.preventDefault();
    if (!file) return;

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("resume", file);
      await api.post("/resumes", formData);
      setFile(null);
      setMessage("Resume uploaded");
      await loadResumes();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function analyze(resume) {
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const { data } = await api.post(`/resumes/${resume._id}/analyze`, { targetRole });
      setSelected(data.resume);
      setMessage("Resume analyzed");
      await loadResumes();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function preview(resume) {
    setError("");

    try {
      const { data } = await api.get(`/resumes/${resume._id}/preview`, { responseType: "blob" });
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(data);
      setPreviewUrl(url);
      setSelected(resume);
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(resume) {
    setBusy(true);
    setError("");
    setMessage("");

    try {
      await api.delete(`/resumes/${resume._id}`);
      setMessage("Resume deleted");
      setSelected(null);
      setPreviewUrl("");
      await loadResumes();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-stack">
      <div className="page-title-row">
        <div>
          <h1>Resume Module</h1>
          <p>Upload, preview, analyze, replace and delete PDF resumes.</p>
        </div>
      </div>

      <Alert type="error" message={error} />
      <Alert type="success" message={message} />

      <section className="panel">
        <form className="upload-bar" onSubmit={handleUpload}>
          <label className="file-picker">
            <FileUp size={19} />
            <span>{file ? file.name : "Choose PDF"}</span>
            <input
              type="file"
              accept="application/pdf"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
          </label>
          <label>
            Target Role
            <input value={targetRole} onChange={(event) => setTargetRole(event.target.value)} />
          </label>
          <button className="primary-button" type="submit" disabled={!file || busy}>
            <RefreshCw size={18} />
            <span>{activeResume ? "Replace Active" : "Upload Resume"}</span>
          </button>
        </form>
      </section>

      <section className="two-column wide-left">
        <div className="panel">
          <div className="panel-heading">
            <h2>Resume History</h2>
          </div>
          {resumes.length ? (
            <div className="list-stack">
              {resumes.map((resume) => (
                <article className="list-row resume-row" key={resume._id}>
                  <button type="button" className="text-button" onClick={() => setSelected(resume)}>
                    <strong>{resume.originalName}</strong>
                    <small>
                      {resume.isActive ? "Active" : "History"} -{" "}
                      {new Date(resume.createdAt).toLocaleDateString()}
                    </small>
                  </button>
                  <div className="row-actions">
                    <button className="icon-button" type="button" onClick={() => preview(resume)} title="Preview">
                      <Eye size={17} />
                    </button>
                    <button className="icon-button" type="button" onClick={() => analyze(resume)} title="Analyze">
                      <Search size={17} />
                    </button>
                    <button className="icon-button danger" type="button" onClick={() => remove(resume)} title="Delete">
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="No resume history" />
          )}
        </div>

        <div className="panel">
          <div className="panel-heading">
            <h2>Analysis</h2>
          </div>
          {selected?.analysis?.summary ? (
            <div className="analysis-block">
              <div className="score-ring">{selected.analysis.score || 0}</div>
              <p>{selected.analysis.summary}</p>
              <h3>Skills</h3>
              <div className="chip-list">
                {(selected.analysis.skills || []).map((skill) => (
                  <span className="chip" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
              <h3>Missing Skills</h3>
              <div className="chip-list warning">
                {(selected.analysis.missingSkills || []).map((skill) => (
                  <span className="chip" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
              <h3>Suggestions</h3>
              <ul className="clean-list">
                {(selected.analysis.improvementSuggestions || []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : (
            <EmptyState title="Select analyze" />
          )}
        </div>
      </section>

      {previewUrl ? (
        <section className="panel preview-panel">
          <div className="panel-heading">
            <h2>Resume Preview</h2>
          </div>
          <iframe title="Resume preview" src={previewUrl} />
        </section>
      ) : null}
    </div>
  );
}
