import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import authService from "../../../services/authService";
import {
  HugeiconsIcon,
  InformationCircleIcon,
  MultiplicationSignIcon,
  Tick01Icon,
} from "../../../assets/icons";
import Button from "../../common/Button/Button";
import Input from "../../common/Input/Input";
import useToast from "../../common/Toast/useToast";
import { showApiErrorToast } from "../../../utils/toastErrors";

function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [senhaFocada, setSenhaFocada] = useState(false);
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const showToast = useToast();
  const requisitosSenha = [
    { texto: "Mínimo de 8 caracteres", atendido: novaSenha.length >= 8 },
    { texto: "Incluir uma letra maiúscula", atendido: /[A-Z]/.test(novaSenha) },
    { texto: "Incluir uma letra minúscula", atendido: /[a-z]/.test(novaSenha) },
    { texto: "Incluir um número", atendido: /\d/.test(novaSenha) },
    { texto: "Incluir um símbolo", atendido: /[^A-Za-z0-9\s]/.test(novaSenha) },
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (requisitosSenha.some(({ atendido }) => !atendido)) {
      showToast({
        type: "error",
        title: "Senha inválida",
        message:
          "A senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo.",
      });
      return;
    }
    if (novaSenha !== confirmarSenha) {
      showToast({
        type: "error",
        title: "Dados inválidos",
        message: "As senhas não correspondem.",
      });
      return;
    }

    setLoading(true);

    try {
      await authService.redefinirSenha({ token, novaSenha });
      const mensagemSucesso = "Senha redefinida com sucesso! Redirecionando...";
      setSucesso(mensagemSucesso);
      showToast({
        type: "success",
        title: "Senha redefinida",
        message: mensagemSucesso,
      });

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      showApiErrorToast(
        showToast,
        err,
        "Não foi possível redefinir a senha. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <>
        <div className="login-subtitle">Redefinir senha</div>
        <div className="login-error">
          Link de recuperação inválido. Solicite um novo link.
        </div>
        <Link to="/recuperar-senha" className="forgot-link auth-back-link">
          Solicitar novo link
        </Link>
      </>
    );
  }

  return (
    <>
      <div className="login-subtitle">Redefinir senha</div>
      <span className="login-subtitle2">
        Crie uma nova senha para acessar sua conta.
      </span>

      <form className="login-form" onSubmit={handleSubmit}>
        <div>
          <Input
            id="redefinir-nova-senha"
            label="NOVA SENHA"
            type="password"
            value={novaSenha}
            placeholder="Digite aqui sua nova senha"
            autoComplete="new-password"
            minLength={8}
            maxLength={100}
            onChange={(event) => setNovaSenha(event.target.value)}
            onFocus={() => setSenhaFocada(true)}
            onBlur={() => setSenhaFocada(false)}
            fullWidth
            required
          />
          {senhaFocada && (
            <div className="redefinir-senha-requisitos" aria-live="polite">
              <div className="redefinir-senha-aviso">
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

        <Input
          id="redefinir-confirmar-senha"
          label="CONFIRME A NOVA SENHA"
          type="password"
          value={confirmarSenha}
          placeholder="Confirme aqui a sua nova senha"
          autoComplete="new-password"
          minLength={8}
          maxLength={100}
          onChange={(event) => setConfirmarSenha(event.target.value)}
          fullWidth
          required
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          disabled={loading || Boolean(sucesso)}
        >
          {loading ? "Salvando..." : "Redefinir senha"}
        </Button>

        <Link to="/" className="forgot-link auth-back-link">
          Voltar para o login
        </Link>
      </form>
    </>
  );
}

export default ResetPasswordForm;
