import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HugeiconsIcon, TradeUpIcon } from "../../assets/icons";
import authService from "../../services/authService";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.login({ email, senha });
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
              <HugeiconsIcon icon={TradeUpIcon} size={32} color="#122a4c" />
            </div>
            <div>
              <span className="brand-name">Finance Control</span>
              <span className="brand-tag">MPT</span>
            </div>
          </div>

          <div className="aside-content">
            <h2>Controle total das suas finanças em um só lugar.</h2>
            <p>
              Dashboards inteligentes, metas e rastreamento de investimentos.
            </p>
          </div>
        </section>

        <section className="login-card">
          <span className="login-subtitle">Bem-vindo de volta</span>
          <h1>Entre na sua conta para continuar.</h1>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-label">
              <span>E-MAIL</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="maria@email.com"
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
                required
              />
            </label>

            {error && <div className="login-error">{error}</div>}

            <button type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

export default Login;
