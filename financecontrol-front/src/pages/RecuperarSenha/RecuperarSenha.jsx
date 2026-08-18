import AuthLayout from "../../components/layout/Auth/AuthLayout";
import ForgotPasswordForm from "../../components/layout/Auth/ForgotPasswordForm";
import "../Login/Login.css";

function RecuperarSenha() {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}

export default RecuperarSenha;
