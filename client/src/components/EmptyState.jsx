export default function EmptyState({ title, action }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      {action}
    </div>
  );
}
