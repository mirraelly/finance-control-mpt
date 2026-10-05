import AuthLayout from "../../components/layout/Auth/AuthLayout";
import CadastroForm from "../../components/layout/Auth/CadastroForm";
import "./Cadastro.css";

function Cadastro() {
    return (
        <AuthLayout className="cadastro-auth-layout">
            <CadastroForm />
        </AuthLayout>
    );
}

export default Cadastro;