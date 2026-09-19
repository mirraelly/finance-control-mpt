import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HugeiconsIcon,
  PlusIcon,
  Search01Icon,
  Notification01Icon,
  Settings01Icon,
  Logout05Icon,
} from "../../../assets/icons";
import "./Header.css";
import Button from "../../common/Button";
import Input from "../../common/Input";
import ThemeToggle from "../../common/ThemeToggle/ThemeToggle";
import NewTransactionModal from "../../transaction/NewTransactionModal";
import usuarioService from "../../../services/usuarioService";

function Header({ title = "Início" }) {
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
  const menuPerfilRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    usuarioService
      .buscarPerfil()
      .then((usuario) => setNomeUsuario(usuario.nome || ""))
      .catch(() => setNomeUsuario(""));
  }, []);

  useEffect(() => {
    const fecharMenuAoClicarFora = (event) => {
      if (!menuPerfilRef.current?.contains(event.target))
        setMenuPerfilAberto(false);
    };
    const fecharMenuComEsc = (event) => {
      if (event.key === "Escape") setMenuPerfilAberto(false);
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

  const handleCreateTransaction = (transaction) => {
    console.log("Nova transação:", transaction);
  };

  const handleNotifications = () => {
    console.log("Abrir painel de notificações");
  };

  const handleEditarPerfil = () => {
    setMenuPerfilAberto(false);
    navigate("/perfil");
  };

  const handleSair = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("financecontrol_token");
    localStorage.removeItem("userId");
    navigate("/", { replace: true });
  };

  return (
    <header className="header-container">
      <div className="header-left">
        <div className="title-icon-wrapper">
          <div className="title-date-group">
            <h1 className="header-title">{title}</h1>
            <span className="header-date">{formattedDate}</span>
          </div>
        </div>
      </div>

      <div className="header-right-group">
        <Input
          className="header-search"
          shadow={false}
          icon={<HugeiconsIcon icon={Search01Icon} size={18} />}
          placeholder="Buscar transações..."
        />

        <div className="controls-box">
          <Button
            size="md"
            variant="primary"
            onClick={() => setShowTransactionModal(true)}
            icon={<HugeiconsIcon icon={PlusIcon} size={18} />}
          >
            {" "}
            Transação
          </Button>

          <ThemeToggle></ThemeToggle>

          <Button className="btn-icon" size="md" onClick={handleNotifications}>
            <HugeiconsIcon icon={Notification01Icon} size={20} />
            <span className="notification-badge"></span>
          </Button>

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
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleEditarPerfil}
                >
                  <HugeiconsIcon icon={Settings01Icon} size={18} />
                  Perfil
                </button>
                <button type="button" role="menuitem" onClick={handleSair}>
                  <HugeiconsIcon icon={Logout05Icon} size={18} />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <NewTransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        onSubmit={handleCreateTransaction}
        theme="auto"
      />
    </header>
  );
}

export default Header;
