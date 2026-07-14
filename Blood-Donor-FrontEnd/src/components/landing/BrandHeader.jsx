import BloodDropLogo from '../icons/BloodDropLogo';

function BrandHeader() {
  return (
    <header className="brand-header">
      <BloodDropLogo className="brand-header__logo" />
      <h1 className="brand-header__title">AI Blood Donor Matcher</h1>
      <p className="brand-header__subtitle">
        AI Powered Emergency Blood Matching Platform
      </p>
    </header>
  );
}

export default BrandHeader;