import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HugeiconsIcon, CheckIcon } from "../../../assets/icons";
import authService from "../../../services/authService";
import Button from "../../common/Button/Button";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.login({ email, senha, rememberMe });
      localStorage.setItem("financecontrol_token", response.token);
      navigate("/home");
    } catch (err) {
      const message = err?.response?.data?.message || err?.message;
      setError(message || "Erro ao fazer login. Verifique seu e-mail e senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-subtitle">
        Bem-vindo de volta
        <span className="hello-emoji">👋</span>
      </div>
      <span className="login-subtitle2">
        Entre na sua conta para continuar.
      </span>

      <form className="login-form" onSubmit={handleSubmit}>
        <label className="login-label">
          <span>E-MAIL</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="maria@email.com"
            autoComplete="email"
            required
          />
        </label>

        <label className="login-label">
          <span>SENHA</span>
          <input
            type="password"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </label>

        <div className="remember-row">
          <label className="remember-me-label">
            <input
              type="checkbox"
              className="custom-checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />

            <span className="checkbox-ui">
              {rememberMe && (
                <HugeiconsIcon
                  icon={CheckIcon}
                  size={14}
                  color="var(--color-midnight-blue)"
                  stroke="2"
                />
              )}
            </span>

            <span>Lembrar de mim</span>
          </label>

          <Link to="/recuperar-senha" className="forgot-link">
            Esqueceu a senha?
          </Link>
        </div>

        {error && <div className="login-error">{error}</div>}

        <Button type="submit" fullWidth size="lg" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </>
  );
}

export default LoginForm;
