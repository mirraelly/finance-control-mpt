import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HugeiconsIcon,
  PlusIcon,
  Search01Icon,
  Settings01Icon,
  Logout05Icon,
  TradeUpIcon,
  Moon02Icon,
  MultiplicationSignIcon,
  Menu01Icon,
} from "../../../assets/icons";
import "./Header.css";
import Button from "../../common/Button";
import Input from "../../common/Input";
import ThemeToggle from "../../common/ThemeToggle/ThemeToggle";
import NewTransactionModal from "../../transaction/NewTransactionModal";
import usuarioService from "../../../services/usuarioService";
import lancamentoFinanceiroService from "../../../services/lancamentoFinanceiroService";
import globalSearchService from "../../../services/globalSearchService";

function Header({ title = "Início", onOpenMobileMenu }) {
  const currentDate = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedDate =
    currentDate.charAt(0).toUpperCase() + currentDate.slice(1);

  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [emailUsuario, setEmailUsuario] = useState("");
  const [temaAtual, setTemaAtual] = useState(
    () => document.documentElement.dataset.theme || localStorage.getItem("financecontrol_theme") || "light",
  );
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [termoBusca, setTermoBusca] = useState("");
  const [resultadoSelecionado, setResultadoSelecionado] = useState(false);
  const [resultadosBusca, setResultadosBusca] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [erroBusca, setErroBusca] = useState("");
  const menuPerfilRef = useRef(null);
  const buscaRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    usuarioService
      .buscarPerfil()
      .then((usuario) => {
        setNomeUsuario(usuario.nome || "");
        setEmailUsuario(usuario.email || "");
      })
      .catch(() => setNomeUsuario(""));
  }, []);

  useEffect(() => {
    if (buscaAberta) buscaRef.current?.focus();
  }, [buscaAberta]);

  useEffect(() => {
    const atualizarTema = (event) => setTemaAtual(event.detail);
    window.addEventListener("financecontrol:theme-changed", atualizarTema);
    return () =>
      window.removeEventListener("financecontrol:theme-changed", atualizarTema);
  }, []);

  useEffect(() => {
    const term = termoBusca.trim();
    if (resultadoSelecionado || term.length < 2) {
      return undefined;
    }

    let active = true;
    const timeout = setTimeout(async () => {
      setBuscando(true);
      setErroBusca("");
      try {
        const { results, failedSources } = await globalSearchService.buscar(
          term,
          localStorage.getItem("role"),
        );
        if (!active) return;
        setResultadosBusca(results);
        if (failedSources.length > 0) {
          setErroBusca(
            `Não foi possível pesquisar em: ${failedSources.join(", ")}.`,
          );
        }
      } catch (error) {
        console.error("Erro ao executar a busca global:", error);
        if (active) {
          setResultadosBusca([]);
          setErroBusca("Não foi possível realizar a busca no sistema.");
        }
      } finally {
        if (active) setBuscando(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [resultadoSelecionado, termoBusca]);

  useEffect(() => {
    const fecharMenuAoClicarFora = (event) => {
      if (!menuPerfilRef.current?.contains(event.target))
        setMenuPerfilAberto(false);
    };
    const fecharMenuComEsc = (event) => {
      if (event.key === "Escape") {
        setMenuPerfilAberto(false);
        setBuscaAberta(false);
      }
    };

    document.addEventListener("mousedown", fecharMenuAoClicarFora);
    document.addEventListener("keydown", fecharMenuComEsc);
    return () => {
      document.removeEventListener("mousedown", fecharMenuAoClicarFora);
      document.removeEventListener("keydown", fecharMenuComEsc);
    };
  }, []);

  const iniciais = (nomeUsuario || "Usuário")
    .trim()
    .split(/\s+/)
    .map((nome) => nome[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleCreateTransaction = async (transaction) => {
    await lancamentoFinanceiroService.criar(transaction);
  };

  const handleEditarPerfil = () => {
    setMenuPerfilAberto(false);
    navigate("/perfil");
  };

  const handleSair = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("financecontrol_token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    navigate("/", { replace: true });
  };

  const isSuperadmin = localStorage.getItem("role") === "SUPERADMIN";
  const abrirBusca = () => {
    const fecharBusca = buscaAberta;
    setBuscaAberta(!buscaAberta);
    setMenuPerfilAberto(false);
    if (fecharBusca) {
      setTermoBusca("");
      setResultadoSelecionado(false);
      setResultadosBusca([]);
      setErroBusca("");
      setBuscando(false);
    }
  };
  const handleSearchResultClick = (result) => {
    navigate(result.path);
    setTermoBusca(result.label);
    setResultadoSelecionado(true);
    setResultadosBusca([]);
    setErroBusca("");
  };
  const handleAlternarTema = () => {
    window.dispatchEvent(new Event("financecontrol:toggle-theme"));
  };

  return (
    <header className="header-container">
      <div className="header-left">
        <button
          type="button"
          className="header-mobile-menu"
          onClick={onOpenMobileMenu}
          aria-label="Abrir menu"
          title="Abrir menu"
        >
          <HugeiconsIcon icon={Menu01Icon} size={20} stroke="2" />
        </button>
        <div className="header-brand-mobile">
          <span className="header-brand-mobile__logo">
            <HugeiconsIcon
              icon={TradeUpIcon}
              size={26}
              stroke="3"
              color="#d9fff3"
            />
          </span>
          <span className="header-brand-mobile__name">
            <strong>Finance Control</strong>
            <small>MPT</small>
          </span>
        </div>
        <div className="title-icon-wrapper">
          <div className="title-date-group">
            <h1 className="header-title">{title}</h1>
            <span className="header-date">{formattedDate}</span>
          </div>
        </div>
      </div>

      <div className="header-right-group">
        <div className="controls-box">
          <Button
            className="header-icon-button header-search-toggle"
            variant="outline"
            size="md"
            onClick={abrirBusca}
            aria-label={buscaAberta ? "Fechar busca" : "Buscar no sistema"}
            aria-expanded={buscaAberta}
            title={buscaAberta ? "Fechar busca" : "Buscar no sistema"}
            icon={
              <HugeiconsIcon
                icon={buscaAberta ? MultiplicationSignIcon : Search01Icon}
                size={18}
                stroke="2"
              />
            }
          />
          {!isSuperadmin && (
            <>
              <Button
                className="header-add-button"
                size="md"
                variant="primary"
                onClick={() => setShowTransactionModal(true)}
                aria-label="Adicionar transação"
                title="Adicionar transação"
                icon={<HugeiconsIcon icon={PlusIcon} size={18} stroke="2" />}
              >
                Transação
              </Button>
            </>
          )}

          <div className="header-desktop-control">
            <ThemeToggle />
          </div>

          <div className="avatar-menu" ref={menuPerfilRef}>
            <button
              type="button"
              className="avatar"
              onClick={() => setMenuPerfilAberto((aberto) => !aberto)}
              aria-label="Abrir menu do perfil"
              aria-expanded={menuPerfilAberto}
              aria-haspopup="menu"
            >
              <span>{iniciais}</span>
            </button>
            {menuPerfilAberto && (
              <div className="avatar-menu__dropdown" role="menu">
                <div className="avatar-menu__user">
                  <span className="avatar-menu__user-avatar">{iniciais}</span>
                  <span className="avatar-menu__user-details">
                    <strong>{nomeUsuario || "Usuário"}</strong>
                    {emailUsuario && <small>{emailUsuario}</small>}
                  </span>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  className="avatar-menu__mobile-only"
                  onClick={handleAlternarTema}
                >
                  <HugeiconsIcon icon={Moon02Icon} size={18} />
                  {temaAtual === "dark" ? "Tema Claro" : "Tema Escuro"}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleEditarPerfil}
                >
                  <HugeiconsIcon icon={Settings01Icon} size={18} />
                  Perfil
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="avatar-menu__logout"
                  onClick={handleSair}
                >
                  <HugeiconsIcon icon={Logout05Icon} size={18} />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
        <div
          className={`header-search-panel ${
            buscaAberta ? "header-search-panel--mobile-open" : ""
          }`}
        >
            <Input
              ref={buscaRef}
              className="header-search"
              shadow={false}
              icon={<HugeiconsIcon icon={Search01Icon} size={18} stroke="2" />}
              placeholder="Buscar no sistema..."
              value={termoBusca}
              onChange={(event) => {
                setTermoBusca(event.target.value);
                setResultadoSelecionado(false);
                setResultadosBusca([]);
                setErroBusca("");
                setBuscando(false);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && resultadosBusca[0]) {
                  event.preventDefault();
                  handleSearchResultClick(resultadosBusca[0]);
                }
              }}
              aria-label="Buscar no sistema"
            />
            {termoBusca.trim().length >= 2 && (
              <div
                className="header-search-results"
                role="listbox"
                aria-label="Resultados da busca"
                aria-live="polite"
              >
                {buscando && (
                  <p className="header-search-results__status">Buscando...</p>
                )}
                {!buscando && erroBusca && (
                  <p className="header-search-results__error">{erroBusca}</p>
                )}
                {!buscando && !erroBusca && resultadosBusca.length === 0 && (
                  <p className="header-search-results__status">
                    Nenhum resultado encontrado.
                  </p>
                )}
                {!buscando &&
                  resultadosBusca.map((result) => (
                    <button
                      type="button"
                      role="option"
                      aria-selected="false"
                      key={result.key}
                      className="header-search-result"
                      onClick={() => handleSearchResultClick(result)}
                    >
                      <span className="header-search-result__content">
                        <strong>{result.label}</strong>
                        <small>{result.detail}</small>
                      </span>
                      <span className="header-search-result__type">
                        {result.type}
                      </span>
                    </button>
                  ))}
              </div>
            )}
        </div>
      </div>

      <NewTransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        onSubmit={handleCreateTransaction}
        theme="auto"
        apiEnabled
      />
    </header>
  );
}

export default Header;
