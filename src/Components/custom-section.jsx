 export default function CustomSection({ children }) {
  return (
    <div className="custom">
      <div className="custom__wrap">
        {/* اللوحة اليسرى: مكان الفورم */}
        <section className="custom__left">
          <div className="custom__panel">
            {children}
          </div>
        </section>

        {/* اللوحة اليمنى: كروت/محتوى تعريفي */}
        <aside className="custom__right">
          <div className="custom__cards">
            <article className="custom__card">
              <h3>Fast Sync</h3>
              <p>Real-time tasks sync across your devices.</p>
            </article>
            <article className="custom__card">
              <h3>Secure Auth</h3>
              <p>Verified access with role-based control.</p>
            </article>
            <article className="custom__card">
              <h3>Lightweight UI</h3>
              <p>Pure React view (no Tailwind / no CSS frameworks).</p>
            </article>
          </div>
        </aside>
      </div>
    </div>
  );
}
