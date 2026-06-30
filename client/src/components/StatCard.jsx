export default function StatCard({ icon: Icon, label, value, accent = "teal" }) {
  return (
    <article className={`stat-card accent-${accent}`}>
      <div className="stat-icon">{Icon ? <Icon size={22} /> : null}</div>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </article>
  );
}
