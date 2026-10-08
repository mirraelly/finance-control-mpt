import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import CategoriaForm from "../pages/Categorias/CategoriaForm";
import ContaFinanceiraList from "../pages/ContasFinanceiras/ContaFinanceiraList";
import ContaFinanceiraForm from "../pages/ContasFinanceiras/ContaFinanceiraForm";
import ContasPagarList from "../pages/ContasPagarReceber/ContasPagarList";
import ContasReceberList from "../pages/ContasPagarReceber/ContasReceberList";
import ContaPagarReceberForm from "../pages/ContasPagarReceber/ContaPagarReceberForm";
import PagarEReceber from "../pages/ContasPagarReceber/PagarEReceber";
import FormaPagamentoList from "../pages/FormasPagamento/FormaPagamentoList";
import FormaPagamentoForm from "../pages/FormasPagamento/FormaPagamentoForm";
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

            <Route element={<ProtectedRoute roles={["USER", "SUPERADMIN"]} />}>
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
              <Route
                path="/movimentacoes/transacoes"
                element={<Home />}
              />
              <Route
                path="/movimentacoes/pagar-e-receber"
                element={<PagarEReceber />}
              />
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
                path="/cadastros/categorias/nova"
                element={<CategoriaForm />}
              />
              <Route
                path="/cadastros/categorias/:id"
                element={<CategoriaForm />}
              />
              <Route
                path="/contas/contas-financeiras"
                element={<ContaFinanceiraList />}
              />
              <Route
                path="/contas/contas-financeiras/nova"
                element={<ContaFinanceiraForm />}
              />
              <Route
                path="/contas/contas-financeiras/:id"
                element={<ContaFinanceiraForm />}
              />
              <Route
                path="/cadastros/formas-pagamento"
                element={<FormaPagamentoList />}
              />
              <Route
                path="/cadastros/formas-pagamento/nova"
                element={<FormaPagamentoForm />}
              />
              <Route
                path="/cadastros/formas-pagamento/:id"
                element={<FormaPagamentoForm />}
              />
              <Route
                path="/contas/contas-pagar"
                element={<ContasPagarList />}
              />
              <Route
                path="/contas/contas-pagar/nova"
                element={<ContaPagarReceberForm tipo="pagar" />}
              />
              <Route
                path="/contas/contas-pagar/:id"
                element={<ContaPagarReceberForm tipo="pagar" />}
              />
              <Route
                path="/contas/contas-receber"
                element={<ContasReceberList />}
              />

              <Route
                path="/movimentacoes/transferencias"
                element={<Transferencias />}
              />
              <Route
                path="/transferencias"
                element={
                  <Navigate to="/movimentacoes/transferencias" replace />
                }
              />
              
              <Route
                path="/contas/contas-receber/nova"
                element={<ContaPagarReceberForm tipo="receber" />}
              />
              <Route
                path="/contas/contas-receber/:id"
                element={<ContaPagarReceberForm tipo="receber" />}
              />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
