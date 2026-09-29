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

function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [senhaFocada, setSenhaFocada] = useState(false);
  const [error, setError] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const requisitosSenha = [
    { texto: "Mínimo de 8 caracteres", atendido: novaSenha.length >= 8 },
    { texto: "Incluir uma letra maiúscula", atendido: /[A-Z]/.test(novaSenha) },
    { texto: "Incluir uma letra minúscula", atendido: /[a-z]/.test(novaSenha) },
    { texto: "Incluir um número", atendido: /\d/.test(novaSenha) },
    { texto: "Incluir um símbolo", atendido: /[^A-Za-z0-9\s]/.test(novaSenha) },
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (requisitosSenha.some(({ atendido }) => !atendido)) {
      setError(
        "A senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo.",
      );
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setError("As senhas não correspondem.");
      return;
    }

    setLoading(true);

    try {
      await authService.redefinirSenha({ token, novaSenha });
      setSucesso("Senha redefinida com sucesso! Redirecionando...");

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      const message = err?.response?.data?.erro;
      setError(message || "Não foi possível redefinir a senha. Tente novamente.");
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

        {error && <div className="login-error">{error}</div>}
        {sucesso && <div className="login-success">{sucesso}</div>}

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
