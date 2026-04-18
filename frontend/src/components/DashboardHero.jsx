function DashboardHero({ user, overview }) {
  return (
    <section className="dashboard-hero surface-card">
      <div className="dashboard-hero__content">
        <p className="eyebrow">Your prep console</p>
        <h1>{overview?.headline || `Welcome back${user?.name ? `, ${user.name}` : ''}`}</h1>
        <p className="hero-text">
          {overview?.subheadline ||
            'Keep the grind in one place with live coding, quick review loops, and a workspace that feels built for momentum.'}
        </p>
        <div className="hero-badges">
          <span className="pill">Role: {user?.role || 'Learner'}</span>
          <span className="pill">{user?.college || 'Interview prep mode'}</span>
          <span className="pill pill--accent">{user?.batch ? `Batch ${user.batch}` : 'Daily momentum'}</span>
        </div>
      </div>

      <div className="dashboard-hero__panel">
        <p className="dashboard-hero__label">Main character energy</p>
        <div className="hero-orbit">
          {(overview?.focus_areas || []).slice(0, 3).map((area) => (
            <article key={area.title} className="hero-orbit__card">
              <span>{area.level}</span>
              <strong>{area.title}</strong>
              <p>{area.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default DashboardHero;
