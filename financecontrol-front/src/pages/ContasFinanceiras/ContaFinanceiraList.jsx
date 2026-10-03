import { useEffect, useState } from "react";
import {
  HugeiconsIcon,
  Edit02Icon,
  PlusIcon,
  Search01Icon,
  Wallet01Icon,
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
import contaFinanceiraService from "../../services/contaFinanceiraService";
import "../Cadastros/Cadastros.css";

const PAGE_SIZE = 15;
const FORM_INICIAL = { nome: "", tipo: "CORRENTE", ativo: true };
const TIPOS_CONTA = [
  { value: "CORRENTE", label: "Conta corrente" },
  { value: "POUPANCA", label: "Poupança" },
  { value: "CAIXA", label: "Caixa" },
  { value: "CARTEIRA", label: "Carteira" },
];
const NOMES_TIPO = Object.fromEntries(
  TIPOS_CONTA.map(({ value, label }) => [value, label]),
);

function ContaFinanceiraList() {
  const [contas, setContas] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [tamanhoPagina, setTamanhoPagina] = useState(PAGE_SIZE);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [contaEditada, setContaEditada] = useState(null);
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

    async function carregarContas() {
      try {
        setCarregando(true);
        setErro("");
        const resposta = await contaFinanceiraService.listar({
          page: pagina,
          size: tamanhoPagina,
          nome: filtro || undefined,
        });
        if (!ativo) return;
        setContas(resposta.content);
        setTotalPaginas(resposta.totalPages);
        setTotalRegistros(resposta.totalElements);
      } catch (erroCarregamento) {
        console.error("Erro ao carregar contas financeiras:", erroCarregamento);
        if (ativo) {
          setErro("Não foi possível carregar as contas financeiras.");
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarContas();
    return () => {
      ativo = false;
    };
  }, [pagina, tamanhoPagina, filtro, recarregar]);

  const abrirNovaConta = () => {
    setContaEditada(null);
    setFormulario(FORM_INICIAL);
    setErroFormulario("");
    setModalAberto(true);
  };

  const abrirEdicao = (conta) => {
    setContaEditada(conta);
    setFormulario({
      nome: conta.nome,
      tipo: conta.tipo,
      ativo: conta.ativo,
    });
    setErroFormulario("");
    setModalAberto(true);
  };

  const fecharModal = () => {
    if (salvando) return;
    setModalAberto(false);
    setErroFormulario("");
  };

  const salvarConta = async (event) => {
    event.preventDefault();
    setErroFormulario("");
    setSalvando(true);

    try {
      const dados = {
        nome: formulario.nome.trim(),
        tipo: formulario.tipo,
        ativo: formulario.ativo,
      };

      if (contaEditada) {
        await contaFinanceiraService.atualizar(contaEditada.id, dados);
        setMensagem("Conta financeira atualizada com sucesso.");
      } else {
        await contaFinanceiraService.criar(dados);
        setMensagem("Conta financeira criada com sucesso.");
        setPagina(0);
      }

      setModalAberto(false);
      setRecarregar((valor) => valor + 1);
    } catch (erroSalvamento) {
      console.error("Erro ao salvar conta financeira:", erroSalvamento);
      setErroFormulario(
        erroSalvamento?.response?.data?.erro ||
          erroSalvamento?.response?.data?.message ||
          "Não foi possível salvar a conta financeira.",
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
          aria-label="Buscar contas financeiras"
          placeholder="Buscar por nome..."
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          icon={<HugeiconsIcon icon={Search01Icon} size={18} />}
          fullWidth
        />
        <Button
          onClick={abrirNovaConta}
          icon={<HugeiconsIcon icon={PlusIcon} size={18} />}
        >
          Nova conta financeira
        </Button>
      </Card>

      <Card className="cadastros-list-card">
        {carregando && contas.length === 0 ? (
          <Loading message="Carregando contas financeiras..." />
        ) : erro ? (
          <EmptyState
            icon={<HugeiconsIcon icon={Wallet01Icon} size={32} />}
            title="Erro ao carregar"
            description={erro}
            fullWidth
          />
        ) : contas.length === 0 ? (
          <EmptyState
            icon={<HugeiconsIcon icon={Wallet01Icon} size={32} />}
            title="Nenhuma conta financeira encontrada"
            description="Adicione uma conta ou ajuste a busca."
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
                    <th>Tipo</th>
                    <th>Situação</th>
                    <th className="cadastros-table__actions-heading">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {contas.map((conta) => (
                    <tr key={conta.id}>
                      <td>{conta.nome}</td>
                      <td className="cadastros-table__muted">
                        {NOMES_TIPO[conta.tipo] || conta.tipo}
                      </td>
                      <td>
                        <Badge variant={conta.ativo ? "success" : "danger"}>
                          {conta.ativo ? "Ativa" : "Inativa"}
                        </Badge>
                      </td>
                      <td>
                        <div className="cadastros-table__actions">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => abrirEdicao(conta)}
                            aria-label={`Editar conta financeira ${conta.nome}`}
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
        title={contaEditada ? "Editar conta financeira" : "Nova conta financeira"}
        subtitle="Informe os dados da conta."
      >
        <form className="cadastros-form" onSubmit={salvarConta}>
          <Input
            id="conta-financeira-nome"
            name="nome"
            label="Nome"
            value={formulario.nome}
            onChange={atualizarCampo}
            maxLength={150}
            required
            autoFocus
          />
          <Select
            id="conta-financeira-tipo"
            name="tipo"
            label="Tipo de conta"
            options={TIPOS_CONTA}
            value={formulario.tipo}
            onChange={atualizarCampo}
            required
          />
          <label className="cadastros-checkbox">
            <input
              type="checkbox"
              name="ativo"
              checked={formulario.ativo}
              onChange={atualizarCampo}
            />
            Conta ativa
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

export default ContaFinanceiraList;
