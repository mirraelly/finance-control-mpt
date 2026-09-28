import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import InternalLayout from "../layouts/Internal/InternalLayout";
import Home from "../pages/Home/Home";
import Transacoes from "../pages/Transacoes/Transacoes";
import Login from "../pages/Login/Login";
import Perfil from "../pages/Perfil/Perfil";
import Cadastro from "../pages/Cadastro/Cadastro";
import RecuperarSenha from "../pages/RecuperarSenha/RecuperarSenha";
import ComponentesTeste from "../pages/ComponentesTeste/ComponentesTeste";
import PlaceholderPage from "../pages/Placeholder/Placeholder";
import NotFound from "../pages/NotFound/NotFound";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route element={<InternalLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/transacoes" element={<Transacoes />} />
          <Route
            path="/contas"
            element={
              <PlaceholderPage
                title="Contas"
                description="Gestão de contas e saldos da sua carteira."
              />
            }
          />
          <Route
            path="/orcamento"
            element={
              <PlaceholderPage
                title="Orçamento"
                description="Controle de despesas e planejamento financeiro."
              />
            }
          />
          <Route
            path="/metas"
            element={
              <PlaceholderPage
                title="Metas"
                description="Acompanhe objetivos financeiros e evolução por período."
              />
            }
          />
          <Route
            path="/investimentos"
            element={
              <PlaceholderPage
                title="Investimentos"
                description="Resumo e acompanhamento das suas aplicações."
              />
            }
          />
          <Route
            path="/relatorios"
            element={
              <PlaceholderPage
                title="Relatórios"
                description="Dados consolidados e visões por categoria e período."
              />
            }
          />
          <Route
            path="/configuracoes"
            element={
              <PlaceholderPage
                title="Configurações"
                description="Ajuste preferências do sistema e do perfil."
              />
            }
          />
          <Route
            path="/administracao"
            element={
              <PlaceholderPage
                title="Administração"
                description="Gerenciamento de usuários, permissões e manutenção."
              />
            }
          />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/componentes-teste" element={<ComponentesTeste />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
