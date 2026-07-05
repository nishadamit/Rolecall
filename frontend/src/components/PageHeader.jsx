function PageHeader({ eyebrow, title, action }) {
  return (
    <div className="page-header">
      <div>
        <div className="page-eyebrow">{eyebrow}</div>
        <div className="page-title">{title}</div>
      </div>
      {action}
    </div>
  );
}

export default PageHeader;
