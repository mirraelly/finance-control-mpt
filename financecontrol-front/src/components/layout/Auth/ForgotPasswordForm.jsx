import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../common/Button/Button";
import Input from "../../common/Input/Input";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
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
          placeholder="maria@email.com"
          autoComplete="email"
          theme="dark"
          fullWidth
          required
        />

        {submitted && (
          <div className="login-success">
            Se esse e-mail estiver cadastrado, enviaremos as instruções.
          </div>
        )}

        <Button type="submit" fullWidth size="lg" disabled={!email.trim()}>
          Enviar instruções
        </Button>

        <Link to="/" className="forgot-link auth-back-link">
          Voltar para o login
        </Link>
      </form>
    </>
  );
}

export default ForgotPasswordForm;
