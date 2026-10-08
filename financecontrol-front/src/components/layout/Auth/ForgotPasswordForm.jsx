import { useState } from "react";
import { Link } from "react-router-dom";
import authService from "../../../services/authService";
import Button from "../../common/Button/Button";
import Input from "../../common/Input/Input";
import useToast from "../../common/Toast/useToast";
import { showApiErrorToast } from "../../../utils/toastErrors";
import validateRequiredFields from "../../../utils/validateRequiredFields";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
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
    setSubmitted(false);
    setLoading(true);

    try {
      await authService.esqueciSenha(email);
      setSubmitted(true);
      showToast({
        type: "info",
        title: "Solicitação recebida",
        message: "Se esse e-mail estiver cadastrado, enviaremos as instruções.",
      });
    } catch (err) {
      showApiErrorToast(
        showToast,
        err,
        "Não foi possível enviar as instruções. Tente novamente.",
      );
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

      <form className="login-form" onSubmit={handleSubmit} noValidate>
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

        <Button
          type="submit"
          fullWidth
          size="lg"
          disabled={loading || submitted}
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
