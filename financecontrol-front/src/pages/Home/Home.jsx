import "./Home.css";

function Home() {
  return (
    <div className="home-page">
      <header className="home-page__header">
        <div>
          <p className="home-page__eyebrow">Resumo geral</p>
          <h1>Olá, João</h1>
        </div>
      </header>

      <section
        className="home-page__stats"
        aria-label="Visão geral financeira"
      ></section>
    </div>
  );
}

export default Home;
