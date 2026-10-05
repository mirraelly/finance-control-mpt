import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  HugeiconsIcon,
  Chart01Icon,
  Edit02Icon,
  Tag01Icon,
  Search01Icon,
  UnavailableIcon,
  UserCheck01Icon,
} from "../../assets/icons";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import Input from "../../components/common/Input";
import Loading from "../../components/common/Loading";
import Modal from "../../components/common/Modal/Modal";
import Pagination from "../../components/common/Pagination";
import Select from "../../components/common/Select";
import categoriaService from "../../services/categoriaService";
import "../Cadastros/Cadastros.css";

const PAGE_SIZE = 15;
function CategoriaList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [categorias, setCategorias] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [tamanhoPagina, setTamanhoPagina] = useState(PAGE_SIZE);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("");
  const [situacaoFiltro, setSituacaoFiltro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState(location.state?.mensagem || "");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [alterandoSituacao, setAlterandoSituacao] = useState(false);
  const [recarregar, setRecarregar] = useState(0);

  useEffect(() => {
    if (!location.state?.mensagem) return;
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!mensagem) return;
    const timeout = setTimeout(() => setMensagem(""), 4000);
    return () => clearTimeout(timeout);
  }, [mensagem]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFiltro(busca.trim());
      setPagina(0);
    }, 400);

    return () => clearTimeout(timeout);
  }, [busca]);

  useEffect(() => {
    let ativo = true;

    async function carregarCategorias() {
      try {
        setCarregando(true);
        setErro("");
        const resposta = await categoriaService.listar({
          page: pagina,
          size: tamanhoPagina,
          nome: filtro || undefined,
          ativo: situacaoFiltro === "" ? undefined : situacaoFiltro,
        });
        if (!ativo) return;
        setCategorias(resposta.content);
        setTotalPaginas(resposta.totalPages);
        setTotalRegistros(resposta.totalElements);
      } catch (erroCarregamento) {
        console.error("Erro ao carregar categorias:", erroCarregamento);
        if (ativo) setErro("Não foi possível carregar as categorias.");
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarCategorias();
    return () => {
      ativo = false;
    };
  }, [pagina, tamanhoPagina, filtro, situacaoFiltro, recarregar]);

  const confirmarAlteracaoSituacao = async () => {
    try {
      setAlterandoSituacao(true);
      await categoriaService.atualizar(categoriaSelecionada.id, {
        nome: categoriaSelecionada.nome,
        descricao: categoriaSelecionada.descricao,
        ativo: !categoriaSelecionada.ativo,
      });
      setMensagem(
        categoriaSelecionada.ativo
          ? "Categoria inativada com sucesso."
          : "Categoria ativada com sucesso.",
      );
      setCategoriaSelecionada(null);
      setRecarregar((valor) => valor + 1);
    } catch (alteracaoError) {
      console.error("Erro ao alterar situação da categoria:", alteracaoError);
      alert(
        alteracaoError?.response?.data?.erro ||
          "Não foi possível alterar a situação da categoria.",
      );
    } finally {
      setAlterandoSituacao(false);
    }
  };

  return (
    <div className="cadastros-page">
      {mensagem && (
        <p className="cadastros-mensagem" role="status">
          {mensagem}
        </p>
      )}

      <Card className="cadastros-toolbar">
        <Input
          aria-label="Buscar categorias"
          placeholder="Buscar por nome..."
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          icon={<HugeiconsIcon icon={Search01Icon} size={18} />}
          fullWidth
        />
        <Select
          id="categorias-filtro-situacao"
          aria-label="Filtrar por situação"
          options={[
            { value: "", label: "Todas as situações" },
            { value: "true", label: "Ativas" },
            { value: "false", label: "Inativas" },
          ]}
          value={situacaoFiltro}
          onChange={(event) => {
            setSituacaoFiltro(event.target.value);
            setPagina(0);
          }}
        />
        <Button
          onClick={() => navigate("/cadastros/categorias/nova")}
          icon={<HugeiconsIcon icon={Tag01Icon} size={18} />}
        >
          Nova Categoria
        </Button>
      </Card>

      <Card className="cadastros-list-card">
        {carregando && categorias.length === 0 ? (
          <Loading message="Carregando categorias..." />
        ) : erro ? (
          <EmptyState
            icon={<HugeiconsIcon icon={Chart01Icon} size={32} />}
            title="Erro ao carregar"
            description={erro}
            fullWidth
          />
        ) : categorias.length === 0 ? (
          <EmptyState
            icon={<HugeiconsIcon icon={Chart01Icon} size={32} />}
            title="Nenhuma categoria encontrada"
            description="Adicione uma categoria ou ajuste a busca."
            fullWidth
          />
        ) : (
          <>
            <div
              className={`cadastros-table-wrapper${carregando ? " cadastros-table-wrapper--loading" : ""}`}
              aria-busy={carregando}
            >
              <table className="cadastros-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Descrição</th>
                    <th>Situação</th>
                    <th className="cadastros-table__actions-heading">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {categorias.map((categoria) => (
                    <tr key={categoria.id}>
                      <td>{categoria.nome}</td>
                      <td className="cadastros-table__muted">
                        {categoria.descricao || "—"}
                      </td>
                      <td>
                        <Badge variant={categoria.ativo ? "success" : "danger"}>
                          {categoria.ativo ? "Ativa" : "Inativa"}
                        </Badge>
                      </td>
                      <td>
                        <div className="cadastros-table__actions">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate(`/cadastros/categorias/${categoria.id}`)
                            }
                            aria-label={`Editar categoria ${categoria.nome}`}
                            icon={
                              <HugeiconsIcon
                                icon={Edit02Icon}
                                size={18}
                                color="var(--color-emerald-500)"
                              />
                            }
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            title={categoria.ativo ? "Inativar categoria" : "Ativar categoria"}
                            aria-label={`${categoria.ativo ? "Inativar" : "Ativar"} ${categoria.nome}`}
                            onClick={() => setCategoriaSelecionada(categoria)}
                            icon={
                              <HugeiconsIcon
                                icon={categoria.ativo ? UnavailableIcon : UserCheck01Icon}
                                color={categoria.ativo ? '#b91c1c': '#16a34a'}
                                size={18}
                              />
                          }
                        />
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
              pageSize={tamanhoPagina}
              onChange={setPagina}
              onPageSizeChange={(tamanho) => {
                setTamanhoPagina(tamanho);
                setPagina(0);
              }}
            />
          </>
        )}
      </Card>

      <Modal
        isOpen={Boolean(categoriaSelecionada)}
        onClose={() => !alterandoSituacao && setCategoriaSelecionada(null)}
        title={categoriaSelecionada?.ativo ? "Inativar categoria" : "Ativar categoria"}
        closeOnOverlay={!alterandoSituacao}
        footer={
          <div className="cadastros-form__actions">
            <Button
              variant="outline"
              onClick={() => setCategoriaSelecionada(null)}
              disabled={alterandoSituacao}
            >
              Cancelar
            </Button>
            <Button
              variant={categoriaSelecionada?.ativo ? "danger" : "primary"}
              onClick={confirmarAlteracaoSituacao}
              disabled={alterandoSituacao}
            >
              {alterandoSituacao ? "Salvando..." : "Confirmar"}
            </Button>
          </div>
        }
      >
        {categoriaSelecionada && (
          <p>
            {categoriaSelecionada.ativo
              ? `Deseja inativar a categoria ${categoriaSelecionada.nome}?`
              : `Deseja ativar a categoria ${categoriaSelecionada.nome}?`}
          </p>
        )}
      </Modal>
    </div>
  );
}

export default CategoriaList;
