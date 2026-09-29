import { useState, useEffect } from "react";
import usuarioService from "../../services/usuarioService";
import authService from "../../services/authService";
import { formatarTelefone } from "../../utils/formatters";
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
  ConstructionIcon,
  Plant01Icon,
  SecurityIcon,
  SquareLock02Icon,
  EyeOffIcon,
  ViewIcon,
  InformationCircleIcon as InfoIcon,
  MultiplicationSignIcon,
  Tick01Icon,
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
  const [modalSenhaAberto, setModalSenhaAberto] = useState(false);
  const [modalDeletarAberto, setModalDeletarAberto] = useState(false);

  const [nomeEditado, setNomeEditado] = useState("");
  const [telefoneEditado, setTelefoneEditado] = useState("");
  const [codigoPaisEditado, setCodigoPaisEditado] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");
  const [novaSenhaFocada, setNovaSenhaFocada] = useState(false);
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmacaoSenha, setMostrarConfirmacaoSenha] = useState(false);
  const [validandoSenha, setValidandoSenha] = useState(false);
  const [erroSenha, setErroSenha] = useState("");
  const [mensagemSenha, setMensagemSenha] = useState("");

  const requisitosSenhaNova = [
    { texto: "Mínimo de 8 caracteres", atendido: novaSenha.length >= 8 },
    { texto: "Incluir uma letra maiúscula", atendido: /[A-Z]/.test(novaSenha) },
    { texto: "Incluir uma letra minúscula", atendido: /[a-z]/.test(novaSenha) },
    { texto: "Incluir um número", atendido: /\d/.test(novaSenha) },
    {
      texto: "Incluir um símbolo",
      atendido: /[^A-Za-z0-9\s]/.test(novaSenha),
    },
  ];

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

  const abrirModalSenha = () => {
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmarNovaSenha("");
    setNovaSenhaFocada(false);
    setMostrarSenhaAtual(false);
    setMostrarNovaSenha(false);
    setMostrarConfirmacaoSenha(false);
    setErroSenha("");
    setMensagemSenha("");
    setModalSenhaAberto(true);
  };

  const fecharModalSenha = () => {
    if (validandoSenha) return;
    setModalSenhaAberto(false);
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmarNovaSenha("");
    setNovaSenhaFocada(false);
    setMostrarSenhaAtual(false);
    setMostrarNovaSenha(false);
    setMostrarConfirmacaoSenha(false);
    setErroSenha("");
    setMensagemSenha("");
  };

  const limparFeedbackSenha = () => {
    setErroSenha("");
    setMensagemSenha("");
  };

  const handleAlterarSenha = async (event) => {
    event.preventDefault();
    limparFeedbackSenha();

    if (!senhaAtual) {
      setErroSenha("Informe sua senha atual.");
      return;
    }

    if (
      requisitosSenhaNova.some(({ atendido }) => !atendido) ||
      novaSenha.length > 100
    ) {
      setErroSenha(
        "A nova senha deve ter entre 8 e 100 caracteres e atender a todos os critérios.",
      );
      return;
    }

    if (novaSenha !== confirmarNovaSenha) {
      setErroSenha("A nova senha e a confirmação não correspondem.");
      return;
    }

    setValidandoSenha(true);
    try {
      await authService.login({ email: usuario.email, senha: senhaAtual });
      setMensagemSenha(
        "Senha atual confirmada. A troca será concluída quando o serviço de alteração de senha estiver disponível.",
      );
    } catch (erro) {
      if ([401, 403].includes(erro?.response?.status)) {
        setErroSenha("A senha atual informada está incorreta.");
      } else {
        setErroSenha(
          "Não foi possível validar a senha atual. Tente novamente.",
        );
      }
    } finally {
      setValidandoSenha(false);
    }
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
              <span
                className="perfil-icone perfil-icone--mensagem"
                aria-hidden="true"
              >
                <HugeiconsIcon
                  icon={Plant01Icon}
                  size={16}
                  color="currentColor"
                  strokeWidth={2}
                />
              </span>
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

        <Card className="perfil-info-card perfil-seguranca-card">
          <div className="perfil-secao-cabecalho">
            <div className="perfil-secao-icone">
              <HugeiconsIcon
                icon={SecurityIcon}
                size={22}
                color="currentColor"
                strokeWidth={2}
              />
            </div>
            <div className="perfil-secao-caixa-title">
              <h2 className="perfil-secao-titulo">Segurança</h2>
              <p className="perfil-secao-descricao">
                Proteja o acesso a sua conta.
              </p>
            </div>
          </div>

          <div className="perfil-seguranca-item">
            <div className="perfil-info-icon-wrapper">
              <HugeiconsIcon
                icon={SquareLock02Icon}
                size={20}
                color="currentColor"
                strokeWidth={2}
              />
            </div>
            <div className="perfil-info-detalhes perfil-seguranca-item__detalhes">
              <span className="perfil-info-label">Senha</span>
              <span className="perfil-info-valor">
                Mantenha sua senha atualizada e segura.
              </span>
            </div>
            <Button variant="primary" onClick={abrirModalSenha}>
              Alterar senha
            </Button>
          </div>
        </Card>

        <Card className="perfil-em-breve">
          <span className="perfil-em-breve-icone" aria-hidden="true">
            <HugeiconsIcon
              icon={ConstructionIcon}
              size={20}
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
              placeholder="(00)00000-0000"
              maxLength={15}
              onChange={(event) => {
                const valorFormatado = formatarTelefone(event.target.value);
                setTelefoneEditado(valorFormatado);
              }}
            />
          </div>

          <div className="perfil-form-botoes perfil-senha-botoes">
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
        isOpen={modalSenhaAberto}
        onClose={fecharModalSenha}
        title={
          <span className="perfil-senha-modal-titulo">
            <span className="perfil-senha-modal-icone">
              <HugeiconsIcon
                icon={SquareLock02Icon}
                size={22}
                color="currentColor"
                strokeWidth={2}
              />
            </span>
            Alterar senha
          </span>
        }
        theme="dark"
        className="perfil-modal perfil-modal-senha"
        bodyClassName="perfil-modal-senha-corpo"
        closeOnOverlay={!validandoSenha}
      >
        <form className="perfil-senha-form" onSubmit={handleAlterarSenha}>
          <div className="perfil-senha-campo">
            <Input
              label="SENHA ATUAL"
              id="perfil-senha-atual"
              type={mostrarSenhaAtual ? "text" : "password"}
              value={senhaAtual}
              placeholder="Digite sua senha atual"
              autoComplete="current-password"
              maxLength={100}
              disabled={validandoSenha}
              onChange={(event) => {
                setSenhaAtual(event.target.value);
                limparFeedbackSenha();
              }}
              required
              fullWidth
            />
            <button
              className="perfil-senha-visibilidade"
              type="button"
              aria-label={
                mostrarSenhaAtual
                  ? "Ocultar senha atual"
                  : "Mostrar senha atual"
              }
              disabled={validandoSenha}
              onClick={() => setMostrarSenhaAtual(!mostrarSenhaAtual)}
            >
              <HugeiconsIcon
                icon={mostrarSenhaAtual ? EyeOffIcon : ViewIcon}
                size={18}
                color="currentColor"
              />
            </button>
          </div>

          <div className="perfil-senha-campo">
            <Input
              label="NOVA SENHA"
              id="perfil-nova-senha"
              type={mostrarNovaSenha ? "text" : "password"}
              value={novaSenha}
              placeholder="Digite sua nova senha"
              autoComplete="new-password"
              minLength={8}
              maxLength={100}
              disabled={validandoSenha}
              onChange={(event) => {
                setNovaSenha(event.target.value);
                limparFeedbackSenha();
              }}
              onFocus={() => setNovaSenhaFocada(true)}
              onBlur={() => setNovaSenhaFocada(false)}
              required
              fullWidth
            />
            <button
              className="perfil-senha-visibilidade"
              type="button"
              aria-label={
                mostrarNovaSenha ? "Ocultar nova senha" : "Mostrar nova senha"
              }
              disabled={validandoSenha}
              onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
            >
              <HugeiconsIcon
                icon={mostrarNovaSenha ? EyeOffIcon : ViewIcon}
                size={18}
                color="currentColor"
              />
            </button>
          </div>

          {novaSenhaFocada && (
            <div className="perfil-senha-requisitos" aria-live="polite">
              <p className="perfil-senha-requisitos__titulo">
                <HugeiconsIcon
                  icon={InfoIcon}
                  size={16}
                  color="currentColor"
                  strokeWidth={2}
                />
                A senha deve atender aos seguintes critérios:
              </p>
              <ul>
                {requisitosSenhaNova.map(({ texto, atendido }) => (
                  <li
                    key={texto}
                    className={atendido ? "atendido" : "nao-atendido"}
                  >
                    <HugeiconsIcon
                      icon={atendido ? Tick01Icon : MultiplicationSignIcon}
                      size={14}
                      color="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    {texto}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="perfil-senha-campo">
            <Input
              label="CONFIRMAR NOVA SENHA"
              id="perfil-confirmar-nova-senha"
              type={mostrarConfirmacaoSenha ? "text" : "password"}
              value={confirmarNovaSenha}
              placeholder="Digite novamente sua nova senha"
              autoComplete="new-password"
              maxLength={100}
              disabled={validandoSenha}
              onChange={(event) => {
                setConfirmarNovaSenha(event.target.value);
                limparFeedbackSenha();
              }}
              required
              fullWidth
            />
            <button
              className="perfil-senha-visibilidade"
              type="button"
              aria-label={
                mostrarConfirmacaoSenha
                  ? "Ocultar confirmação"
                  : "Mostrar confirmação"
              }
              disabled={validandoSenha}
              onClick={() =>
                setMostrarConfirmacaoSenha(!mostrarConfirmacaoSenha)
              }
            >
              <HugeiconsIcon
                icon={mostrarConfirmacaoSenha ? EyeOffIcon : ViewIcon}
                size={18}
                color="currentColor"
              />
            </button>
          </div>

          {confirmarNovaSenha && novaSenha !== confirmarNovaSenha && (
            <p
              className="perfil-senha-feedback perfil-senha-feedback--erro"
              role="alert"
            >
              A nova senha e a confirmação não correspondem.
            </p>
          )}
          {erroSenha && (
            <p
              className="perfil-senha-feedback perfil-senha-feedback--erro"
              role="alert"
            >
              {erroSenha}
            </p>
          )}
          {mensagemSenha && (
            <p
              className="perfil-senha-feedback perfil-senha-feedback--sucesso"
              role="status"
            >
              {mensagemSenha}
            </p>
          )}

          <div className="perfil-form-botoes perfil-senha-botoes">
            <Button
              type="button"
              variant="secondary"
              onClick={fecharModalSenha}
              disabled={validandoSenha}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={validandoSenha}>
              {validandoSenha ? "Validando..." : "Alterar senha"}
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
