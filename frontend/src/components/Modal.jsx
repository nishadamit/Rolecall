function Modal({ eyebrow, title, onClose, onSubmit, submitLabel, children }) {
  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card">
        <div className="modal-eyebrow">{eyebrow}</div>
        <div className="modal-title">{title}</div>
        <form onSubmit={onSubmit}>
          {children}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Modal;
