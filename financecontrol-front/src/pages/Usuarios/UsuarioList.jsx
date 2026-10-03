import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HugeiconsIcon,
  Search01Icon,
  UserAdd01Icon,
  UserGroupIcon,
  Edit02Icon,
  UserBlock01Icon,
  UserCheck01Icon,
} from "../../assets/icons";
import usuarioService from "../../services/usuarioService";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Modal from "../../components/common/Modal/Modal";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import "./Usuarios.css";

const SITUACAO_OPTIONS = [
  { value: "", label: "Todas as situações" },
  { value: "true", label: "Ativos" },
  { value: "false", label: "Inativos" },
];

const PERFIL_OPTIONS = [
  { value: "", label: "Todos os perfis" },
  { value: "USER", label: "Usuário" },
  { value: "SUPERADMIN", label: "Super administrador" },
];

const PERFIL_LABEL = {
  USER: "Usuário",
  SUPERADMIN: "Super administrador",
};

function UsuarioList() {
  const navigate = useNavigate();
  const usuarioLogadoId = localStorage.getItem("userId");

  const [usuarios, setUsuarios] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [tamanhoPagina, setTamanhoPagina] = useState(15);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [nome, setNome] = useState("");
  const [nomeFiltro, setNomeFiltro] = useState("");
  const [situacao, setSituacao] = useState("");
  const [perfil, setPerfil] = useState("");

  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [alterandoSituacao, setAlterandoSituacao] = useState(false);
  const [recarregar, setRecarregar] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setNomeFiltro(nome.trim());
      setPagina(0);
    }, 400);

    return () => clearTimeout(timeout);
  }, [nome]);

  useEffect(() => {
    async function carregarUsuarios() {
      try {
        setCarregando(true);
        setErro("");
        const resposta = await usuarioService.listarUsuarios({
          page: pagina,
          size: tamanhoPagina,
          nome: nomeFiltro || undefined,
          ativo: situacao || undefined,
          role: perfil || undefined,
        });
        setUsuarios(resposta.content);
        setTotalPaginas(resposta.totalPages);
        setTotalRegistros(resposta.totalElements);
      } catch (erro) {
        console.error("Erro ao carregar usuários:", erro);
        setErro("Não foi possível carregar os usuários.");
      } finally {
        setCarregando(false);
      }
    }

    carregarUsuarios();
}, [pagina, tamanhoPagina, nomeFiltro, situacao, perfil, recarregar]);

  const handleConfirmarSituacao = async () => {
    try {
      setAlterandoSituacao(true);
      await usuarioService.alterarAtivo(
        usuarioSelecionado.id,
        !usuarioSelecionado.ativo,
      );
      setUsuarioSelecionado(null);
      setRecarregar((valor) => valor + 1);
    } catch (erro) {
      console.error("Erro ao alterar situação do usuário:", erro);
      alert(
        erro?.response?.data?.erro ||
          "Não foi possível alterar a situação do usuário.",
      );
    } finally {
      setAlterandoSituacao(false);
    }
  };

  const renderConteudo = () => {
    if (carregando) {
      return <Loading message="Carregando usuários..." />;
    }

    if (erro) {
      return (
        <EmptyState
          icon={<HugeiconsIcon icon={UserGroupIcon} size={32} />}
          title="Erro ao carregar"
          description={erro}
          fullWidth
        />
      );
    }

    if (usuarios.length === 0) {
      return (
        <EmptyState
          icon={<HugeiconsIcon icon={UserGroupIcon} size={32} />}
          title="Nenhum usuário encontrado"
          description="Tente ajustar a busca ou os filtros selecionados."
          fullWidth
        />
      );
    }

    return (
      <>
        <div className="usuarios-table__wrapper">
          <table className="usuarios-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th className="usuarios-table__col-secundaria">E-mail</th>
                <th className="usuarios-table__col-secundaria">Telefone</th>
                <th className="usuarios-table__col-perfil">Perfil</th>
                <th>Situação</th>
                <th className="usuarios-table__acoes-col">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>
                    <div className="usuarios-table__nome">
                      <span className="usuarios-avatar" aria-hidden="true">
                        {usuario.nome.charAt(0).toUpperCase()}
                      </span>
                      <div className="usuarios-table__nome-texto">
                        <span>{usuario.nome}</span>
                        <span className="usuarios-table__email-mobile">
                          {usuario.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="usuarios-table__muted usuarios-table__col-secundaria">
                    {usuario.email}
                  </td>
                  <td className="usuarios-table__muted usuarios-table__col-secundaria">
                    {usuario.telefone
                      ? `+${usuario.codigoPais} ${usuario.telefone}`
                      : "-"}
                  </td>
                  <td className="usuarios-table__col-perfil">
                    <Badge
                      variant={usuario.role === "SUPERADMIN" ? "purple" : "info"}
                      size="sm"
                    >
                      {PERFIL_LABEL[usuario.role] || usuario.role}
                    </Badge>
                  </td>
                  <td>
                    <Badge
                      variant={usuario.ativo ? "success" : "danger"}
                      size="sm"
                    >
                      {usuario.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td>
                    <div className="usuarios-table__acoes">
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Editar usuário"
                        aria-label={`Editar ${usuario.nome}`}
                        onClick={() => navigate(`/admin/usuarios/${usuario.id}`)}
                        icon={<HugeiconsIcon icon={Edit02Icon} size={18} />}
                      />
                      {usuario.id !== usuarioLogadoId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          title={usuario.ativo ? "Desativar usuário" : "Ativar usuário"}
                          aria-label={`${usuario.ativo ? "Desativar" : "Ativar"} ${usuario.nome}`}
                          onClick={() => setUsuarioSelecionado(usuario)}
                          icon={
                            <HugeiconsIcon
                              icon={usuario.ativo ? UserBlock01Icon : UserCheck01Icon}
                              size={18}
                            />
                          }
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          page={pagina}
          totalPages={totalPaginas}
          totalElements={totalRegistros}
          onChange={setPagina}
          pageSize={tamanhoPagina}
          onPageSizeChange={(tamanho) => {
            setTamanhoPagina(tamanho);
            setPagina(0);
          }}
        />
      </>
    );
  };

  return (
    <div className="usuarios-page">
      <Card
        className="usuarios-toolbar"
        padding="sm"
        radius="lg"
        shadow={false}
      >
        <Input
          id="usuarios-busca"
          type="search"
          icon={<HugeiconsIcon icon={Search01Icon} size={18} stroke="2" />}
          placeholder="Buscar pelo nome..."
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          fullWidth
          className="usuarios-toolbar__busca"
        />

        <div className="usuarios-toolbar__filtros">
          <Select
            id="usuarios-situacao"
            options={SITUACAO_OPTIONS}
            value={situacao}
            onChange={(event) => {
              setSituacao(event.target.value);
              setPagina(0);
            }}
            width="190px"
            className="usuarios-toolbar__select"
          />

          <Select
            id="usuarios-perfil"
            options={PERFIL_OPTIONS}
            value={perfil}
            onChange={(event) => {
              setPerfil(event.target.value);
              setPagina(0);
            }}
            width="200px"
            className="usuarios-toolbar__select"
          />

          <Button
            icon={<HugeiconsIcon icon={UserAdd01Icon} size={18} stroke="2" />}
            onClick={() => navigate("/admin/usuarios/novo")}
          >
            Novo usuário
          </Button>
        </div>
      </Card>

      <Card
        className="usuarios-table-card"
        padding="none"
        radius="lg"
        shadow={false}
      >
        {renderConteudo()}
      </Card>

      <Modal
        isOpen={Boolean(usuarioSelecionado)}
        onClose={() => !alterandoSituacao && setUsuarioSelecionado(null)}
        title={usuarioSelecionado?.ativo ? "Desativar usuário" : "Ativar usuário"}
        closeOnOverlay={!alterandoSituacao}
        footer={
          <div className="usuarios-modal__botoes">
            <Button
              variant="outline"
              onClick={() => setUsuarioSelecionado(null)}
              disabled={alterandoSituacao}
            >
              Cancelar
            </Button>
            <Button
              variant={usuarioSelecionado?.ativo ? "danger" : "primary"}
              onClick={handleConfirmarSituacao}
              disabled={alterandoSituacao}
            >
              {alterandoSituacao ? "Salvando..." : "Confirmar"}
            </Button>
          </div>
        }
      >
        {usuarioSelecionado && (
          <p className="usuarios-modal__texto">
            {usuarioSelecionado.ativo
              ? `Ao desativar ${usuarioSelecionado.nome}, o acesso ao sistema será bloqueado até que o usuário seja ativado novamente.`
              : `Ao ativar ${usuarioSelecionado.nome}, o acesso ao sistema será liberado novamente.`}
          </p>
        )}
      </Modal>
    </div>
  );
}

export default UsuarioList;
