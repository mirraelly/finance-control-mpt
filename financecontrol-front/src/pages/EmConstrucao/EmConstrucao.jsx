import { Link } from "react-router-dom";
import { ArrowLeft01Icon, HugeiconsIcon } from "../../assets/icons";
import "./EmConstrucao.css";

function EmConstrucao() {
  return (
    <main className="em-construcao">
      <img
        className="em-construcao__imagem"
        src="/images/pagina-em-construcao.png"
        alt=""
      />
      <section
        className="em-construcao__mensagem"
        aria-labelledby="em-construcao-titulo"
      >
        <h2 id="em-construcao-titulo">
          Estamos preparando esta página para você.
        </h2>
      </section>
      <Link to="/dashboard" className="em-construcao__voltar">
        <HugeiconsIcon icon={ArrowLeft01Icon} size={14} aria-hidden="true" />
        Voltar ao Dashboard
      </Link>
    </main>
  );
}

export default EmConstrucao;
