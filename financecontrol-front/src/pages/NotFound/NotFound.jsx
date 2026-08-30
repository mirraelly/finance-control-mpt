import { HugeiconsIcon, Home01Icon } from "../../assets/icons";
import { Link } from "react-router-dom";
import "./NotFound.css";

function NotFound() {
    return (
        <main className="notfound">
            <section className="notfound__content">
                <p className="notfound__eyebrow">Página não encontrada</p>
                <h1 className="notfound__code">404</h1>
                <h2 className="notfound__title">Ops! Página não encontrada.</h2>
                <p className="notfound__description">
                    A página que você está procurando não existe ou foi movida para
                    outro lugar.
                </p>
                <Link to="/home" className="notfound__link">
                    <a
                        className="notfound__button"
                    >
                        <HugeiconsIcon
                            icon={Home01Icon}
                            size={18}
                            stroke="2"
                        />
                        Voltar ao Dashboard
                    </a>
                </Link>
            </section>

            <section className="notfound__image">
                <img src="/public/images/not-found-pig.png" alt="Imagem ilustrativa de página não encontrada" />
            </section>
        </main>
    );
}

export default NotFound;
