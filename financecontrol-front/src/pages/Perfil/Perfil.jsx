import { useState, useEffect } from "react";
import usuarioService from "../../services/usuarioService";
import Card from "../../components/common/Card/Card";
import Button from "../../components/common/Button/Button";
import Input from "../../components/common/Input/Input";
import Modal from "../../components/common/Modal/Modal";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  Call02Icon,
  InformationCircleIcon,
  Mail01Icon,
  Settings01Icon,
  Delete02Icon,
} from "../../assets/icons";
import "./Perfil.css";

function formatarMesAno(dataISO) {
  if (!dataISO) return "";
  const data = new Date(dataISO);
  const texto = data.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function Perfil() {
  const [usuario, setUsuario] = useState(null);

  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [deletando, setDeletando] = useState(false);

  const [modalAberto, setModalAberto] = useState(false);
  const [modalDeletarAberto, setModalDeletarAberto] = useState(false);

  const [nomeEditado, setNomeEditado] = useState("");
  const [telefoneEditado, setTelefoneEditado] = useState("");
  const [codigoPaisEditado, setCodigoPaisEditado] = useState("");

  useEffect(() => {
    async function carregarDadosDoPerfil() {
      try {
        setCarregando(true);
        const dadosReais = await usuarioService.buscarPerfil();
        setUsuario(dadosReais);
      } catch (erro) {
        console.error("Erro ao carregar dados do perfil:", erro);
        setErroCarregamento(
          "Não foi possível carregar os dados do seu perfil.",
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarDadosDoPerfil();
  }, []);

  const abrirModalEdicao = () => {
    setNomeEditado(usuario.nome || "");
    setTelefoneEditado(usuario.telefone || "");
    setCodigoPaisEditado(usuario.codigoPais || "");
    setModalAberto(true);
  };

  const handleSalvar = async (event) => {
    event.preventDefault();

    if (!nomeEditado.trim() || nomeEditado.trim().length < 3) {
      alert("Por favor, informe um nome válido com pelo menos 3 caracteres.");
      return;
    }

    const usuarioUpdateDto = {
      nome: nomeEditado,
      telefone: telefoneEditado,
      codigoPais: codigoPaisEditado,
      ativo: usuario.ativo,
      role: usuario.role,
    };

    try {
      setSalvando(true);
      const userId = localStorage.getItem("userId");

      if (userId) {
        const usuarioAtualizado = await usuarioService.atualizarUsuario(
          userId,
          usuarioUpdateDto,
        );
        setUsuario(usuarioAtualizado);
      }

      setModalAberto(false);
    } catch (erro) {
      console.error("Erro ao atualizar perfil:", erro);
      alert("Não foi possível salvar as alterações. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  const handleDeletarConta = async () => {
    try {
      setDeletando(true);
      const userId = localStorage.getItem("userId");

      if (userId) {
        await usuarioService.deletarUsuario(userId);
      }

      localStorage.removeItem("token");
      localStorage.removeItem("financecontrol_token");
      localStorage.removeItem("userId");
      window.location.href = "/";
    } catch (erro) {
      console.error("Erro ao deletar conta:", erro);
      alert("Não foi possível excluir sua conta. Tente novamente.");
      setDeletando(false);
    }
  };

  if (carregando) {
    return (
      <main className="perfil-page">
        <div className="perfil-container">
          <p
            style={{
              color: "var(--text-primary)",
              textAlign: "center",
              marginTop: "2rem",
            }}
          >
            Carregando dados do perfil...
          </p>
        </div>
      </main>
    );
  }

  if (!usuario) {
    return (
      <main className="perfil-page">
        <div className="perfil-container">
          <p
            style={{
              color: "var(--text-primary)",
              textAlign: "center",
              marginTop: "2rem",
            }}
          >
            {erroCarregamento}
          </p>
        </div>
      </main>
    );
  }

  const iniciais = (usuario.nome || "")
    .split(" ")
    .filter(Boolean)
    .map((parte) => parte[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <main className="perfil-page">
      <div className="perfil-container">
        <Card className="perfil-header-card">
          <div className="perfil-avatar">{iniciais}</div>

          <div className="perfil-header-info">
            <h1 className="perfil-nome">{usuario.nome}</h1>
            <div className="perfil-contato">
              <span className="perfil-contato-item">
                <span className="perfil-icone">
                  <HugeiconsIcon
                    icon={Mail01Icon}
                    size={16}
                    color="currentColor"
                    strokeWidth={2}
                  />
                </span>
                {usuario.email}
              </span>
              <span className="perfil-contato-item">
                <span className="perfil-icone">
                  <HugeiconsIcon
                    icon={Call02Icon}
                    size={16}
                    color="currentColor"
                    strokeWidth={2}
                  />
                </span>
                +{usuario.codigoPais} {usuario.telefone}
              </span>
            </div>
            <p className="perfil-mensagem">
              Organizar hoje para conquistar amanhã
              <span aria-hidden="true">♥</span>
            </p>
          </div>

          <Button variant="primary" onClick={abrirModalEdicao}>
            Editar perfil
          </Button>
        </Card>

        <Card className="perfil-info-card">
          <div className="perfil-secao-cabecalho">
            <div className="perfil-secao-icone">
              <HugeiconsIcon
                icon={InformationCircleIcon}
                size={22}
                color="currentColor"
                strokeWidth={2}
              />
            </div>
            <div className="perfil-secao-caixa-title">
              <h2 className="perfil-secao-titulo">Informações da conta</h2>
              <p className="perfil-secao-descricao">
                Dados da sua conta no sistema.
              </p>
            </div>
          </div>

          <div className="perfil-info-grid">
            <div className="perfil-info-item">
              <div className="perfil-info-icon-wrapper">
                <HugeiconsIcon
                  icon={Calendar03Icon}
                  size={20}
                  color="currentColor"
                  strokeWidth={2}
                />
              </div>
              <div className="perfil-info-detalhes">
                <span className="perfil-info-label">Membro desde</span>
                <span className="perfil-info-valor">
                  {formatarMesAno(usuario.createdAt)}
                </span>
              </div>
            </div>

            <div className="perfil-info-item">
              <div className="perfil-info-icon-wrapper">
                <HugeiconsIcon
                  icon={Settings01Icon}
                  size={20}
                  color="currentColor"
                  strokeWidth={2}
                />
              </div>
              <div className="perfil-info-detalhes">
                <span className="perfil-info-label">Perfil de acesso</span>
                <span className="perfil-info-valor">
                  {usuario.role === "USER" ? "Usuário" : usuario.role}
                </span>
              </div>
            </div>

            <div className="perfil-info-item">
              <div className="perfil-info-icon-wrapper perfil-info-icon-wrapper--status">
                <span className="perfil-status-dot" />
              </div>
              <div className="perfil-info-detalhes">
                <span className="perfil-info-label">Status da conta</span>
                <span className="perfil-info-valor">
                  {usuario.ativo ? "Ativa" : "Inativa"}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="perfil-em-breve">
          <span className="perfil-em-breve-icone" aria-hidden="true">
            <HugeiconsIcon
              icon={Calendar03Icon}
              size={28}
              color="currentColor"
              strokeWidth={2}
            />
          </span>
          <h3 className="perfil-em-breve-titulo">Mais informações em breve</h3>
          <p className="perfil-em-breve-texto">
            Saldo, investimentos, metas financeiras e configurações de segurança
            estarão disponíveis em breve.
          </p>
        </Card>

        <section
          className="perfil-danger-zone"
          aria-labelledby="zona-perigo-titulo"
        >
          <div className="perfil-danger-zone__header">
            <span className="perfil-danger-zone__icon" aria-hidden="true">
              <HugeiconsIcon
                icon={Delete02Icon}
                size={20}
                color="currentColor"
                strokeWidth={2}
              />
            </span>
            <div className="perfil-secao-caixa-title">
              <h2 id="zona-perigo-titulo">Zona de perigo</h2>
              <p className="alerta-excluir-conta">
                Essa ação é permanente e não pode ser desfeita. Todos os seus
                dados serão removidos do sistema.
              </p>
            </div>
          </div>
          <Button variant="danger" onClick={() => setModalDeletarAberto(true)}>
            Excluir conta
          </Button>
        </section>
      </div>

      <Modal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        title="Editar perfil"
        theme="dark"
        className="perfil-modal"
      >
        <form className="perfil-form" onSubmit={handleSalvar}>
          <div className="perfil-form-row perfil-form-row--nome">
            <Input
              label="NOME COMPLETO"
              id="perfil-nome"
              type="text"
              className="modal-perfil-box-maior"
              value={nomeEditado}
              onChange={(event) => setNomeEditado(event.target.value)}
              required
            />
          </div>

          <div className="perfil-form-row perfil-form-row--telefone">
            <Input
              label="DDI"
              id="perfil-codigo-pais"
              type="text"
              className="modal-perfil-box-menor"
              value={codigoPaisEditado}
              onChange={(event) => setCodigoPaisEditado(event.target.value)}
            />

            <Input
              label="TELEFONE"
              id="perfil-telefone"
              type="tel"
              className="modal-perfil-box-maior"
              value={telefoneEditado}
              onChange={(event) => setTelefoneEditado(event.target.value)}
            />
          </div>

          <div className="perfil-form-botoes">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalAberto(false)}
              disabled={salvando}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={modalDeletarAberto}
        onClose={() => setModalDeletarAberto(false)}
        title="Excluir Conta"
        theme="dark"
      >
        <p style={{ color: "#fff", marginBottom: "1.5rem" }}>
          Tem certeza que deseja excluir sua conta? Esta ação é irreversível e
          todos os seus dados serão apagados.
        </p>

        <div
          style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}
        >
          <Button
            variant="secondary"
            onClick={() => setModalDeletarAberto(false)}
            disabled={deletando}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleDeletarConta}
            disabled={deletando}
          >
            {deletando ? "Excluindo..." : "Confirmar Exclusão"}
          </Button>
        </div>
      </Modal>
    </main>
  );
}

export default Perfil;
