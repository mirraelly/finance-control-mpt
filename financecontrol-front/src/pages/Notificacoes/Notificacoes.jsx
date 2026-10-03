import { HugeiconsIcon, Notification01Icon } from "../../assets/icons";
import EmptyState from "../../components/common/EmptyState";
import "../Cadastros/Cadastros.css";

function Notificacoes() {
  return (
    <div className="cadastros-page">
      <section className="notificacoes-inbox" aria-label="Caixa de entrada">
        <EmptyState
          icon={<HugeiconsIcon icon={Notification01Icon} size={32} />}
          title="Sua caixa de entrada está vazia"
          description="As notificações aparecerão aqui quando o serviço de notificações estiver disponível."
          fullWidth
        />
      </section>
    </div>
  );
}

export default Notificacoes;
