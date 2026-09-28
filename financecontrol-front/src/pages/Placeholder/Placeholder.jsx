function PlaceholderPage({ title, description }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        padding: "2rem",
        borderRadius: "1rem",
        background: "rgba(15, 23, 42, 0.04)",
        minHeight: "200px",
        justifyContent: "center",
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: "2rem",
          color: "var(--color-midnight-blue)",
        }}
      >
        {title}
      </h1>
      <p style={{ margin: 0, color: "var(--text-secondary)" }}>{description}</p>
    </div>
  );
}

export default PlaceholderPage;
