import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import InternalLayout from "../layouts/Internal/InternalLayout";
import ProtectedRoute from "./ProtectedRoute";
import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Perfil from "../pages/Perfil/Perfil";
import Cadastro from "../pages/Cadastro/Cadastro";
import RecuperarSenha from "../pages/RecuperarSenha/RecuperarSenha";
import RedefinirSenha from "../pages/RedefinirSenha/RedefinirSenha";
import ComponentesTeste from "../pages/ComponentesTeste/ComponentesTeste";
import UsuarioList from "../pages/Usuarios/UsuarioList";
import UsuarioForm from "../pages/Usuarios/UsuarioForm";
import LogLoginList from "../pages/LogsLogin/LogLoginList";
import PessoaList from "../pages/Pessoas/PessoaList";
import PessoaForm from "../pages/Pessoas/PessoaForm";
import CategoriaList from "../pages/Categorias/CategoriaList";
import ContaFinanceiraList from "../pages/ContasFinanceiras/ContaFinanceiraList";
import ContasPagarList from "../pages/ContasPagarReceber/ContasPagarList";
import ContasReceberList from "../pages/ContasPagarReceber/ContasReceberList";
import Notificacoes from "../pages/Notificacoes/Notificacoes";
import Loading from "../components/common/Loading";
import NotFound from "../pages/NotFound/NotFound";
import Transferencias from "../pages/Transferencias/Transferencias";

const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard"));

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<InternalLayout />}>
            <Route path="/perfil" element={<Perfil />} />

            <Route element={<ProtectedRoute roles={["USER"]} />}>
              <Route
                path="/dashboard"
                element={
                  <Suspense
                    fallback={
                      <Loading size="sm" label="Carregando dashboard..." />
                    }
                  >
                    <Dashboard />
                  </Suspense>
                }
              />
              <Route path="/transacoes" element={<Home />} />
              <Route path="/componentes-teste" element={<ComponentesTeste />} />
            </Route>

            <Route element={<ProtectedRoute roles={["SUPERADMIN"]} />}>
              <Route path="/admin/usuarios" element={<UsuarioList />} />
              <Route path="/admin/usuarios/novo" element={<UsuarioForm />} />
              <Route path="/admin/usuarios/:id" element={<UsuarioForm />} />
              <Route path="/admin/logs-login" element={<LogLoginList />} />
            </Route>

            <Route element={<ProtectedRoute roles={["USER", "SUPERADMIN"]} />}>
              <Route path="/cadastros/pessoas" element={<PessoaList />} />
              <Route path="/cadastros/pessoas/nova" element={<PessoaForm />} />
              <Route path="/cadastros/pessoas/:id" element={<PessoaForm />} />
              <Route path="/cadastros/categorias" element={<CategoriaList />} />
              <Route
                path="/cadastros/contas-financeiras"
                element={<ContaFinanceiraList />}
              />
              <Route
                path="/cadastros/contas-pagar"
                element={<ContasPagarList />}
              />
              <Route
                path="/cadastros/contas-receber"
                element={<ContasReceberList />}
              />

              <Route path="/transferencias" element={<Transferencias />} />
              
              <Route path="/cadastros/notificacoes" element={<Notificacoes />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
