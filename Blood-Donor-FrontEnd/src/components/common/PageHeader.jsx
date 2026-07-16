function PageHeader({ title, subtitle }) {
    return (
      <header className="page-header">
        <h1 className="page-header__title">{title}</h1>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      </header>
    );
  }
  
  export default PageHeader;