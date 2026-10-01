import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  HugeiconsIcon,
  InformationCircleIcon,
  MultiplicationSignIcon,
  Tick01Icon,
} from "../../assets/icons";
import usuarioService from "../../services/usuarioService";
import { formatarTelefone } from "../../utils/formatters";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Loading from "../../components/common/Loading";
import "./Usuarios.css";

const PERFIL_OPTIONS = [
  { value: "USER", label: "Usuário" },
  { value: "SUPERADMIN", label: "Super administrador" },
];

function UsuarioForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdicao = Boolean(id);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [codigoPais, setCodigoPais] = useState("55");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [role, setRole] = useState("USER");
  const [ativo, setAtivo] = useState(true);
  const [senhaFocada, setSenhaFocada] = useState(false);

  const [carregando, setCarregando] = useState(isEdicao);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const requisitosSenha = [
    { texto: "Mínimo de 8 caracteres", atendido: senha.length >= 8 },
    { texto: "Incluir uma letra maiúscula", atendido: /[A-Z]/.test(senha) },
    { texto: "Incluir uma letra minúscula", atendido: /[a-z]/.test(senha) },
    { texto: "Incluir um número", atendido: /\d/.test(senha) },
    { texto: "Incluir um símbolo", atendido: /[^A-Za-z0-9\s]/.test(senha) },
  ];

  useEffect(() => {
    if (!isEdicao) return;

    async function carregarUsuario() {
      try {
        setCarregando(true);
        const usuario = await usuarioService.buscarUsuarioPorId(id);
        setNome(usuario.nome || "");
        setEmail(usuario.email || "");
        setCodigoPais(usuario.codigoPais || "55");
        setTelefone(usuario.telefone || "");
        setRole(usuario.role || "USER");
        setAtivo(usuario.ativo);
      } catch (erro) {
        console.error("Erro ao carregar usuário:", erro);
        setErro("Não foi possível carregar os dados do usuário.");
      } finally {
        setCarregando(false);
      }
    }

    carregarUsuario();
  }, [id, isEdicao]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErro("");

    if (nome.trim().length < 3) {
      setErro("Informe um nome válido com pelo menos 3 caracteres.");
      return;
    }

    if (!isEdicao) {
      if (requisitosSenha.some(({ atendido }) => !atendido)) {
        setErro(
          "A senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo.",
        );
        return;
      }

      if (senha !== confirmarSenha) {
        setErro("As senhas não correspondem.");
        return;
      }
    }

    try {
      setSalvando(true);

      if (isEdicao) {
        await usuarioService.atualizarUsuario(id, {
          nome: nome.trim(),
          telefone,
          codigoPais,
          ativo,
          role,
        });
      } else {
        await usuarioService.criarUsuario({
          nome: nome.trim(),
          email: email.trim(),
          senha,
          telefone,
          codigoPais,
          role,
        });
      }

      navigate("/admin/usuarios");
    } catch (erro) {
      setErro(
        erro?.response?.data?.erro ||
          "Não foi possível salvar o usuário. Tente novamente.",
      );
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return <Loading message="Carregando usuário..." />;
  }

  return (
    <div className="usuarios-page">
      <Card className="usuario-form-card" padding="lg" radius="lg" shadow={false}>
        <div className="usuario-form__cabecalho">
          <h2>{isEdicao ? "Editar usuário" : "Novo usuário"}</h2>
          <p>
            {isEdicao
              ? "Altere os dados de acesso do usuário."
              : "O usuário terá uma conta própria, sem acesso aos dados de outros usuários."}
          </p>
        </div>

        <form className="usuario-form" onSubmit={handleSubmit}>
          <div className="usuario-form__linha">
            <Input
              id="usuario-nome"
              label="NOME COMPLETO"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              maxLength={255}
              fullWidth
              required
            />
          </div>

          <div className="usuario-form__linha">
            <Input
              id="usuario-email"
              label="E-MAIL"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="email@email.com"
              maxLength={255}
              disabled={isEdicao}
              fullWidth
              required
            />
          </div>

          <div className="usuario-form__linha usuario-form__linha--telefone">
            <Input
              id="usuario-codigo-pais"
              label="DDI"
              value={codigoPais}
              onChange={(event) =>
                setCodigoPais(event.target.value.replace(/\D/g, ""))
              }
              maxLength={4}
              fullWidth
            />
            <Input
              id="usuario-telefone"
              label="TELEFONE"
              type="tel"
              value={telefone}
              placeholder="(00)00000-0000"
              maxLength={15}
              onChange={(event) =>
                setTelefone(formatarTelefone(event.target.value))
              }
              fullWidth
            />
          </div>

          <div className="usuario-form__linha">
            <Select
              id="usuario-perfil"
              label="PERFIL DE ACESSO"
              options={PERFIL_OPTIONS}
              value={role}
              onChange={(event) => setRole(event.target.value)}
              fullWidth
            />
          </div>

          {!isEdicao && (
            <>
              <div className="usuario-form__linha">
                <Input
                  id="usuario-senha"
                  label="SENHA"
                  type="password"
                  value={senha}
                  placeholder="Digite a senha de acesso"
                  autoComplete="new-password"
                  maxLength={100}
                  onChange={(event) => setSenha(event.target.value)}
                  onFocus={() => setSenhaFocada(true)}
                  onBlur={() => setSenhaFocada(false)}
                  fullWidth
                  required
                />
              </div>

              {senhaFocada && (
                <div className="usuario-form__requisitos" aria-live="polite">
                  <p className="usuario-form__requisitos-titulo">
                    <HugeiconsIcon
                      icon={InformationCircleIcon}
                      size={16}
                      strokeWidth={2}
                    />
                    A senha deve atender aos seguintes critérios:
                  </p>
                  <ul>
                    {requisitosSenha.map(({ texto, atendido }) => (
                      <li
                        key={texto}
                        className={atendido ? "atendido" : "nao-atendido"}
                      >
                        <HugeiconsIcon
                          icon={atendido ? Tick01Icon : MultiplicationSignIcon}
                          size={14}
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                        {texto}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="usuario-form__linha">
                <Input
                  id="usuario-confirmar-senha"
                  label="CONFIRMAR SENHA"
                  type="password"
                  value={confirmarSenha}
                  placeholder="Digite novamente a senha"
                  autoComplete="new-password"
                  maxLength={100}
                  onChange={(event) => setConfirmarSenha(event.target.value)}
                  fullWidth
                  required
                />
              </div>
            </>
          )}

          {erro && (
            <p className="usuario-form__erro" role="alert">
              {erro}
            </p>
          )}

          <div className="usuario-form__botoes">
            <Button
              variant="outline"
              onClick={() => navigate("/admin/usuarios")}
              disabled={salvando}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default UsuarioForm;
