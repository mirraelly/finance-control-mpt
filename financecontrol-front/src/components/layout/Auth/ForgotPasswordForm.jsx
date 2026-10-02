import { useState } from "react";
import { Link } from "react-router-dom";
import authService from "../../../services/authService";
import Button from "../../common/Button/Button";
import Input from "../../common/Input/Input";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitted(false);
    setLoading(true);

    try {
      await authService.esqueciSenha(email);
      setSubmitted(true);
    } catch (err) {
      const message = err?.response?.data?.erro;
      setError(message || "Não foi possível enviar as instruções. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-subtitle">Recuperar senha</div>
      <span className="login-subtitle2">
        Informe seu e-mail para receber as instruções de recuperação.
      </span>

      <form className="login-form" onSubmit={handleSubmit}>
        <Input
          id="forgot-password-email"
          label="E-MAIL"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="teste@email.com"
          autoComplete="email"
          fullWidth
          required
        />

        {error && <div className="login-error">{error}</div>}

        {submitted && (
          <div className="login-success">
            Se esse e-mail estiver cadastrado, enviaremos as instruções.
          </div>
        )}

        <Button
          type="submit"
          fullWidth
          size="lg"
          disabled={!email.trim() || loading}
        >
          {loading ? "Enviando..." : "Enviar instruções"}
        </Button>

        <Link to="/" className="forgot-link auth-back-link">
          Voltar para o login
        </Link>
      </form>
    </>
  );
}

export default ForgotPasswordForm;
