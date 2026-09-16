import { useState } from "react";
import {
  HugeiconsIcon,
  TradeUpIcon,
  PlusIcon,
  Search01Icon,
  Notification01Icon,
} from "../../../assets/icons";
import "./Header.css";
import Button from "../../common/Button";
import Input from "../../common/Input";
import ThemeToggle from "../../common/ThemeToggle/ThemeToggle";
import NewTransactionModal from "../../transaction/NewTransactionModal";

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

  const handleCreateTransaction = (transaction) => {
    console.log("Nova transação:", transaction);
  };

  const handleNotifications = () => {
    console.log("Abrir painel de notificações");
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

          <div className="avatar">
            <span>MS</span>
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
