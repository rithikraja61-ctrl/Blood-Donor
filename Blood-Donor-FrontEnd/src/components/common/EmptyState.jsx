function EmptyState({ message }) {
    return (
      <div className="empty-state">
        <span className="empty-state__icon">🔍</span>
        <p>{message}</p>
      </div>
    );
  }
  
  export default EmptyState;