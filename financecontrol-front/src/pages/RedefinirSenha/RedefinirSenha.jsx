import AuthLayout from "../../components/layout/Auth/AuthLayout";
import ResetPasswordForm from "../../components/layout/Auth/ResetPasswordForm";
import "../Login/Login.css";
import "./RedefinirSenha.css";

function RedefinirSenha() {
  return (
    <AuthLayout>
      <ResetPasswordForm />
    </AuthLayout>
  );
}

export default RedefinirSenha;
