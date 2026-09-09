import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../../../services/authService";
import { formatarTelefone } from "../../../utils/formatters.js";
import {
  HugeiconsIcon,
  CheckIcon,
  InformationCircleIcon,
  MultiplicationSignIcon,
  Tick01Icon,
} from "../../../assets/icons";
import Modal from "../../common/Modal/Modal";
import TermosServico from "../../common/Legal/TermosServico";
import PoliticaPrivacidade from "../../common/Legal/PoliticaPrivacidade";
import Input from "../../common/Input/Input";
import Button from "../../common/Button/Button";

function CadastroForm() {
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [email, setEmail] = useState("");
  const [ddi, setDdi] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senhaFocada, setSenhaFocada] = useState(false);
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [termosAberto, setTermosAberto] = useState(false);
  const [privacidadeAberta, setPrivacidadeAberta] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sucesso, setSucesso] = useState("");
  const navigate = useNavigate();
  const requisitosSenha = [
    { texto: "Mínimo de 8 caracteres", atendido: senha.length >= 8 },
    { texto: "Incluir uma letra maiúscula", atendido: /[A-Z]/.test(senha) },
    { texto: "Incluir uma letra minúscula", atendido: /[a-z]/.test(senha) },
    { texto: "Incluir um número", atendido: /\d/.test(senha) },
    { texto: "Incluir um símbolo", atendido: /[^A-Za-z0-9\s]/.test(senha) },
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const nomeCompleto = `${nome} ${sobrenome}`.trim();

    if (nomeCompleto.length > 255) {
      setError("Nome e sobrenome juntos devem ter no máximo 255 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      setError("As senhas não correspondem.");
      return;
    }
    if (requisitosSenha.some(({ atendido }) => !atendido)) {
      setError(
        "A senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo.",
      );
      return;
    }
    if (!aceitouTermos) {
      setError("Você precisa concordar com os termos para continuar.");
      return;
    }

    setLoading(true);

    const dadosCadastro = {
      nome: nomeCompleto,
      email,
      senha,
      codigoPais: ddi,
      telefone,
    };

    if (telefone.trim()) {
      dadosCadastro.telefone = telefone.trim();
    }

    try {
      await authService.register(dadosCadastro);
      setSucesso("Cadastro realizado com sucesso! Redirecionando...");

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message;
      setError(message || "Erro ao realizar cadastro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-forms-cadastro">
      <div>
        <h3 className="cadastro-subtitle">COMECE AGORA - É GRÁTIS</h3>
        <h2 className="cadastro-title">Crie sua conta</h2>
        <p className="cadastro-descricao">
          Configure sua conta para acompanhar gastos, organizar seu orçamento e
          ter clareza total sobre suas finanças em um só lugar.
        </p>
      </div>

      <form className="cadastro-form" onSubmit={handleSubmit}>
        <div className="cadastro-nome-row">
          <Input
            label={
              <>
                NOME<span className="obrigatorio">*</span>
              </>
            }
            id="nome"
            type="text"
            value={nome}
            placeholder="Maria"
            onChange={(event) => {
              const novoNome = event.target.value;
              const nomeCompleto = `${novoNome} ${sobrenome}`.trim();

              if (nomeCompleto.length <= 255) {
                setNome(novoNome);
              }
            }}
            required
          />

          <Input
            label={
              <>
                SOBRENOME<span className="obrigatorio">*</span>
              </>
            }
            id="sobrenome"
            type="text"
            value={sobrenome}
            placeholder="Silva"
            onChange={(event) => {
              const novoSobrenome = event.target.value;
              const nomeCompleto = `${nome} ${novoSobrenome}`.trim();

              if (nomeCompleto.length <= 255) {
                setSobrenome(novoSobrenome);
              }
            }}
            required
          />
        </div>

        <div>
          <Input
            label={
              <>
                EMAIL<span className="obrigatorio">*</span>
              </>
            }
            id="email"
            type="email"
            value={email}
            placeholder=" Mariasilva@email.com"
            maxLength={255}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <div className="cadastro-aviso">
            <HugeiconsIcon
              icon={InformationCircleIcon}
              size={16}
              strokeWidth={2.5}
            />
            <span>Enviaremos um link de confirmação para este endereço.</span>
          </div>
        </div>

        <div className="cadastro-phone-row">
          <Input
            label="DDI"
            id="ddi"
            type="text"
            inputmode="numeric"
            pattern="[0-9]{1,4}"
            maxLength={4}
            value={ddi}
            placeholder="xx"
            onChange={(event) => {
              const value = event.target.value.replace(/\D/g, "").slice(0, 4);
              setDdi(value);
            }}
          />

          <Input
            label="TELEFONE"
            id="telefone"
            type="tel"
            inputMode="numeric"
            value={telefone}
            placeholder="(00)00000-0000"
            maxLength={15}
            onChange={(event) => {
              setTelefone(formatarTelefone(event.target.value));
            }}
          />
        </div>
        <div>
          <div>
            <Input
              label={
                <>
                  SENHA<span className="obrigatorio">*</span>
                </>
              }
              id="senha"
              type="password"
              value={senha}
              placeholder="Digite aqui sua senha"
              minLength={8}
              maxLength={100}
              onChange={(event) => setSenha(event.target.value)}
              onFocus={() => setSenhaFocada(true)}
              onBlur={() => setSenhaFocada(false)}
              required
            />
          </div>
          {senhaFocada && (
            <div className="cadastro-senha-requisitos" aria-live="polite">
              <div className="cadastro-aviso">
                <HugeiconsIcon
                  icon={InformationCircleIcon}
                  size={16}
                  strokeWidth={2.5}
                />
                <span>A senha deve ter entre 8 e 100 caracteres.</span>
              </div>

              <ul>
                {requisitosSenha.map(({ texto, atendido }) => (
                  <li
                    key={texto}
                    className={atendido ? "atendido" : "nao-atendido"}
                  >
                    <HugeiconsIcon
                      icon={atendido ? Tick01Icon : MultiplicationSignIcon}
                      size={12}
                      strokeWidth={2.5}
                      aria-hidden="true"
                    />
                    {texto}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <Input
            label={
              <>
                CONFIRME A SENHA<span className="obrigatorio">*</span>
              </>
            }
            id="confirmarSenha"
            type="password"
            value={confirmarSenha}
            placeholder="Confirme aqui a sua senha"
            minLength={8}
            maxLength={100}
            onChange={(event) => setConfirmarSenha(event.target.value)}
            required
          />
        </div>

        <div className="confirmar-label">
          <label>
            <input
              type="checkbox"
              className="custom-checkbox"
              checked={aceitouTermos}
              onChange={(ev) => setAceitouTermos(ev.target.checked)}
            />
            <span className="checkbox-ui">
              {aceitouTermos && (
                <HugeiconsIcon
                  icon={CheckIcon}
                  size={14}
                  color="var(--color-midnight-blue)"
                  stroke="2"
                />
              )}
            </span>
          </label>

          <span>
            Concordo com os{" "}
            <span
              className="link-destaque"
              onClick={() => setTermosAberto(true)}
            >
              termos de serviço
            </span>{" "}
            e a{" "}
            <span
              className="link-destaque"
              onClick={() => setPrivacidadeAberta(true)}
            >
              política de privacidade
            </span>
          </span>
        </div>

        {error && <div className="cadastro-error">{error}</div>}
        {sucesso && <div className="cadastro-success">{sucesso}</div>}

        <Button type="submit" variant="primary" fullWidth disabled={loading}>
          {loading ? "Cadastrando.." : "Cadastrar"}
        </Button>
      </form>

      <footer className="cadastro-footer">
        <p>Protegido por criptografia de 256 bits.</p>
        <p>
          Já tem uma conta?{" "}
          <Link to="/" className="link-destaque">
            Entrar
          </Link>
        </p>
      </footer>

      <Modal
        isOpen={termosAberto}
        onClose={() => setTermosAberto(false)}
        title="Termos de Serviço"
      >
        <TermosServico />
      </Modal>

      <Modal
        isOpen={privacidadeAberta}
        onClose={() => setPrivacidadeAberta(false)}
        title="Política de Privacidade"
      >
        <PoliticaPrivacidade />
      </Modal>
    </div>
  );
}

export default CadastroForm;
