import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import InternalLayout from "../layouts/Internal/InternalLayout";
import ProtectedRoute from "./ProtectedRoute";
import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Perfil from "../pages/Perfil/Perfil";
import Cadastro from "../pages/Cadastro/Cadastro";
import RecuperarSenha from "../pages/RecuperarSenha/RecuperarSenha";
import ComponentesTeste from "../pages/ComponentesTeste/ComponentesTeste";
import Loading from "../components/common/Loading";
import NotFound from "../pages/NotFound/NotFound";

const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard"));

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<InternalLayout />}>
            <Route path="/home" element={<Home />} />
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
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/componentes-teste" element={<ComponentesTeste />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
