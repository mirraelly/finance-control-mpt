import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HugeiconsIcon, TradeUpIcon, CheckIcon } from "../../assets/icons";
import authService from "../../services/authService";
import "./Login.css";

function Login() {
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
    <main className="login-page">
      <div className="container-login">
        <section className="login-aside">
          <div className="brand">
            <div className="div-logo">
              <HugeiconsIcon
                icon={TradeUpIcon}
                stroke="2"
                size={24}
                color="var(--color-midnight-blue)"
              />
            </div>
            <div className="div-brand-name">
              <span className="brand-name">Finance Control</span>
              <span className="brand-tag">MPT</span>
            </div>
          </div>

          <div className="aside-content">
            <h2 className="aside-content-text">
              Controle total das suas <span>finanças em um só lugar.</span>
            </h2>
            <p>
              Dashboards inteligentes, metas e rastreamento de investimentos.
            </p>
          </div>
        </section>

        <section className="login-card">
          <div>
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

              <label className="remember-me-label">
                <input
                  type="checkbox"
                  className="custom-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
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

              {error && <div className="login-error">{error}</div>}

              <button type="submit" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;
