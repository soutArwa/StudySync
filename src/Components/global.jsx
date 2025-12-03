import "./custom-section.css";

export default function Global({ children }) {
  return (
    <div className="custom">
      <div className="custom__wrap">
        <section className="custom__left">
          <div className="custom__panel">{children}</div>
        </section>
      </div>
    </div>
  );
}

