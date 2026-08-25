import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Cadastro from '../pages/Cadastro/Cadastro'
import RecuperarSenha from "../pages/RecuperarSenha/RecuperarSenha";
import ComponentesTeste from "../pages/ComponentesTeste/ComponentesTeste";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/Cadastro" element={<Cadastro />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/componentes-teste" element={<ComponentesTeste />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
