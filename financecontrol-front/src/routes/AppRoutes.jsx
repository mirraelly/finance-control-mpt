import { BrowserRouter, Routes, Route } from "react-router-dom";

// import ExternalLayout from "../layouts/External/ExternalLayout";
import InternalLayout from "../layouts/Internal/InternalLayout";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Cadastro from "../pages/Cadastro/Cadastro";
import RecuperarSenha from "../pages/RecuperarSenha/RecuperarSenha";
import ComponentesTeste from "../pages/ComponentesTeste/ComponentesTeste";
import NotFound from "../pages/NotFound/NotFound";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route element={<InternalLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/componentes-teste" element={<ComponentesTeste />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
