function AboutSection() {
    return (
      <section id="about" className="about section">
        <div className="container about__inner">
          <div className="about__content fade-in">
            <h2 className="section-header__title">About Blood Donor</h2>
            <p className="about__text">
              Blood Donor is a dedicated healthcare platform built to bridge the gap
              between patients in need and voluntary blood donors. We bring together
              hospitals, blood banks, and community donors on one trusted network.
            </p>
            <p className="about__text">
              Whether it is an emergency transfusion, a scheduled surgery, or an
              ongoing medical requirement, our platform ensures faster coordination,
              verified connections, and reliable support when it matters most.
            </p>
            <ul className="about__list">
              <li>Support for patients during critical emergencies</li>
              <li>Voluntary donors ready to help their community</li>
              <li>Hospitals managing blood requirements efficiently</li>
              <li>Verified blood banks with transparent availability</li>
              <li>A united community committed to saving lives</li>
            </ul>
          </div>
          <div className="about__visual fade-in fade-in--delay" aria-hidden="true">
            <div className="about__badge">
              <span className="about__badge-number">24/7</span>
              <span className="about__badge-label">Emergency Support</span>
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  export default AboutSection;