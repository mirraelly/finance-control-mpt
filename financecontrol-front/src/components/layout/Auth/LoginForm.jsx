import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HugeiconsIcon,
  CheckIcon,
  EyeOffIcon,
  ViewIcon,
} from "../../../assets/icons";
import authService from "../../../services/authService";
import Button from "../../common/Button/Button";
import Input from "../../common/Input/Input";
import useToast from "../../common/Toast/useToast";
import { showApiErrorToast } from "../../../utils/toastErrors";
import validateRequiredFields from "../../../utils/validateRequiredFields";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const showToast = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateRequiredFields(event, showToast)) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      showToast({
        type: "error",
        title: "Dados inválidos",
        message: "Informe um endereço de e-mail válido.",
      });
      return;
    }
    setLoading(true);

    try {
      const response = await authService.login({ email, senha, rememberMe });
      localStorage.setItem("token", response.token);
      localStorage.setItem("userId", response.id);
      localStorage.setItem("role", response.role);
      navigate(
        response.role === "SUPERADMIN" ? "/admin/usuarios" : "/dashboard",
      );
    } catch (err) {
      showApiErrorToast(
        showToast,
        err,
        "Erro ao fazer login. Verifique seu e-mail e senha.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section>
        <div className="login-subtitle">
          Bem-vindo de volta
          <span className="hello-emoji">👋</span>
        </div>
        <span className="login-subtitle2">
          Entre na sua conta para continuar.
        </span>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <Input
            id="login-email"
            label="E-MAIL"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="email@email.com"
            autoComplete="email"
            fullWidth
            required
          />

          <div className="login-senha-campo">
            <Input
              id="login-password"
              label="SENHA"
              type={mostrarSenha ? "text" : "password"}
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              fullWidth
              required
            />
            <button
              className="login-senha-visibilidade"
              type="button"
              aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              onClick={() => setMostrarSenha((visivel) => !visivel)}
            >
              <HugeiconsIcon
                icon={mostrarSenha ? EyeOffIcon : ViewIcon}
                size={18}
                color="currentColor"
              />
            </button>
          </div>

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

          <Button type="submit" fullWidth size="lg" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>

          <div className="register-link">
            <span>Não tem conta?</span>
            <Link to="/cadastro" className="forgot-link">
              Cadastre-se
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}

export default LoginForm;
