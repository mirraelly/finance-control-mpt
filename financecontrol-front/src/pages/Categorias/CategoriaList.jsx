import { useEffect, useState } from "react";
import {
  HugeiconsIcon,
  Chart01Icon,
  Edit02Icon,
  PlusIcon,
  Search01Icon,
} from "../../assets/icons";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import Input from "../../components/common/Input";
import Loading from "../../components/common/Loading";
import Modal from "../../components/common/Modal/Modal";
import Pagination from "../../components/common/Pagination";
import categoriaService from "../../services/categoriaService";
import "../Cadastros/Cadastros.css";

const PAGE_SIZE = 15;
const FORM_INICIAL = { nome: "", descricao: "", ativo: true };

function CategoriaList() {
  const [categorias, setCategorias] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [tamanhoPagina, setTamanhoPagina] = useState(PAGE_SIZE);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [categoriaEditada, setCategoriaEditada] = useState(null);
  const [formulario, setFormulario] = useState(FORM_INICIAL);
  const [erroFormulario, setErroFormulario] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [recarregar, setRecarregar] = useState(0);

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
  }, [pagina, tamanhoPagina, filtro, recarregar]);

  const abrirNovaCategoria = () => {
    setCategoriaEditada(null);
    setFormulario(FORM_INICIAL);
    setErroFormulario("");
    setModalAberto(true);
  };

  const abrirEdicao = (categoria) => {
    setCategoriaEditada(categoria);
    setFormulario({
      nome: categoria.nome,
      descricao: categoria.descricao || "",
      ativo: categoria.ativo,
    });
    setErroFormulario("");
    setModalAberto(true);
  };

  const fecharModal = () => {
    if (salvando) return;
    setModalAberto(false);
    setErroFormulario("");
  };

  const salvarCategoria = async (event) => {
    event.preventDefault();
    setErroFormulario("");
    setSalvando(true);

    try {
      const dados = {
        nome: formulario.nome.trim(),
        descricao: formulario.descricao.trim() || null,
        ativo: formulario.ativo,
      };

      if (categoriaEditada) {
        await categoriaService.atualizar(categoriaEditada.id, dados);
        setMensagem("Categoria atualizada com sucesso.");
      } else {
        await categoriaService.criar(dados);
        setMensagem("Categoria criada com sucesso.");
        setPagina(0);
      }

      setModalAberto(false);
      setRecarregar((valor) => valor + 1);
    } catch (erroSalvamento) {
      console.error("Erro ao salvar categoria:", erroSalvamento);
      setErroFormulario(
        erroSalvamento?.response?.data?.erro ||
          erroSalvamento?.response?.data?.message ||
          "Não foi possível salvar a categoria.",
      );
    } finally {
      setSalvando(false);
    }
  };

  const atualizarCampo = (event) => {
    const { name, value, checked, type } = event.target;
    setFormulario((atual) => ({
      ...atual,
      [name]: type === "checkbox" ? checked : value,
    }));
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
        <Button
          onClick={abrirNovaCategoria}
          icon={<HugeiconsIcon icon={PlusIcon} size={18} />}
        >
          Nova categoria
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
                            onClick={() => abrirEdicao(categoria)}
                            aria-label={`Editar categoria ${categoria.nome}`}
                            icon={
                              <HugeiconsIcon
                                icon={Edit02Icon}
                                size={18}
                                color="var(--color-emerald-500)"
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
        isOpen={modalAberto}
        onClose={fecharModal}
        title={categoriaEditada ? "Editar categoria" : "Nova categoria"}
      >
        <form className="cadastros-form" onSubmit={salvarCategoria}>
          <Input
            id="categoria-nome"
            name="nome"
            label="Nome"
            value={formulario.nome}
            onChange={atualizarCampo}
            maxLength={100}
            required
            autoFocus
          />
          <label className="cadastros-field" htmlFor="categoria-descricao">
            <span className="cadastros-field__label">Descrição</span>
            <textarea
              id="categoria-descricao"
              name="descricao"
              value={formulario.descricao}
              onChange={atualizarCampo}
              maxLength={255}
              rows={3}
            />
          </label>
          <label className="cadastros-checkbox">
            <input
              type="checkbox"
              name="ativo"
              checked={formulario.ativo}
              onChange={atualizarCampo}
            />
            Categoria ativa
          </label>
          {erroFormulario && (
            <p className="cadastros-form__error" role="alert">
              {erroFormulario}
            </p>
          )}
          <div className="cadastros-form__actions">
            <Button variant="ghost" onClick={fecharModal} disabled={salvando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default CategoriaList;
