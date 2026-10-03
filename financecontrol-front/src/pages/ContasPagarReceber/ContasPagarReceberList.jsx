import { useEffect, useState } from "react";
import {
  HugeiconsIcon,
  PlusIcon,
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
import categoriaService from "../../services/categoriaService";
import contasPagarReceberService from "../../services/contasPagarReceberService";
import pessoaService from "../../services/pessoaService";
import "../Cadastros/Cadastros.css";

const PAGE_SIZE = 15;
const STATUS_OPTIONS = [
  { value: "", label: "Todos os status" },
  { value: "ABERTO", label: "Em aberto" },
  { value: "PARCIALMENTE_PAGO", label: "Parcialmente pago" },
  { value: "PAGO", label: "Pago" },
  { value: "CANCELADO", label: "Cancelado" },
];
const STATUS_LABELS = Object.fromEntries(
  STATUS_OPTIONS.filter(({ value }) => value).map(({ value, label }) => [
    value,
    label,
  ]),
);

function dataLocalHoje() {
  const hoje = new Date();
  return [
    hoje.getFullYear(),
    String(hoje.getMonth() + 1).padStart(2, "0"),
    String(hoje.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatarData(data) {
  if (!data) return "—";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(
    new Date(`${data}T00:00:00Z`),
  );
}

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor));
}

function variantStatus(status) {
  if (status === "PAGO") return "success";
  if (status === "CANCELADO") return "danger";
  if (status === "PARCIALMENTE_PAGO") return "warning";
  return "info";
}

function criarFormularioInicial() {
  return {
    pessoaId: "",
    categoriaId: "",
    descricao: "",
    dataEmissao: dataLocalHoje(),
    valorTotal: "",
    observacao: "",
    dataVencimento: dataLocalHoje(),
  };
}

function ContasPagarReceberList({ tipo }) {
  const ehPagar = tipo === "pagar";
  const titulo = ehPagar ? "Contas a pagar" : "Contas a receber";
  const pessoaLabel = ehPagar ? "Fornecedor / credor" : "Cliente / devedor";

  const [contas, setContas] = useState([]);
  const [pessoas, setPessoas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [tamanhoPagina, setTamanhoPagina] = useState(PAGE_SIZE);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [pessoaFiltro, setPessoaFiltro] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [erroOpcoes, setErroOpcoes] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [formulario, setFormulario] = useState(criarFormularioInicial);
  const [erroFormulario, setErroFormulario] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [recarregar, setRecarregar] = useState(0);

  useEffect(() => {
    let ativo = true;

    async function carregarOpcoes() {
      try {
        setErroOpcoes("");
        const [listaPessoas, listaCategorias] = await Promise.all([
          pessoaService.listarPessoasAtivas(),
          categoriaService.listarAtivas(),
        ]);
        if (!ativo) return;
        setPessoas(listaPessoas);
        setCategorias(listaCategorias);
      } catch (erroCarregamento) {
        console.error("Erro ao carregar opções da conta:", erroCarregamento);
        if (ativo) {
          setErroOpcoes(
            "Não foi possível carregar pessoas e categorias. Recarregue a página e tente novamente.",
          );
        }
      }
    }

    carregarOpcoes();
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    let ativo = true;

    async function carregarContas() {
      try {
        setCarregando(true);
        setErro("");
        const resposta = await contasPagarReceberService.listar(tipo, {
          page: pagina,
          size: tamanhoPagina,
          pessoaId: pessoaFiltro || undefined,
          categoriaId: categoriaFiltro || undefined,
          status: statusFiltro || undefined,
        });
        if (!ativo) return;
        setContas(resposta.content);
        setTotalPaginas(resposta.totalPages);
        setTotalRegistros(resposta.totalElements);
      } catch (erroCarregamento) {
        console.error(`Erro ao carregar ${titulo.toLowerCase()}:`, erroCarregamento);
        if (ativo) setErro(`Não foi possível carregar ${titulo.toLowerCase()}.`);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarContas();
    return () => {
      ativo = false;
    };
  }, [
    tipo,
    titulo,
    pagina,
    tamanhoPagina,
    pessoaFiltro,
    categoriaFiltro,
    statusFiltro,
    recarregar,
  ]);

  const atualizarCampo = (event) => {
    const { name, value } = event.target;
    setFormulario((atual) => ({ ...atual, [name]: value }));
  };

  const alterarFiltro = (setter) => (event) => {
    setter(event.target.value);
    setPagina(0);
  };

  const abrirModal = () => {
    setFormulario(criarFormularioInicial());
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

    if (!formulario.pessoaId) {
      setErroFormulario(`Selecione ${ehPagar ? "um fornecedor" : "um cliente"}.`);
      return;
    }

    const valorTotal = Number(formulario.valorTotal);
    if (!Number.isFinite(valorTotal) || valorTotal <= 0) {
      setErroFormulario("Informe um valor maior que zero.");
      return;
    }

    setSalvando(true);
    const dados = {
      pessoaId: formulario.pessoaId,
      categoriaId: formulario.categoriaId || null,
      descricao: formulario.descricao.trim() || null,
      dataEmissao: formulario.dataEmissao,
      valorTotal,
      observacao: formulario.observacao.trim() || null,
      ativo: true,
    };

    if (!ehPagar) {
      dados.parcelas = [
        {
          dataVencimento: formulario.dataVencimento,
          valor: valorTotal,
          formaPagamentoId: null,
          observacao: null,
        },
      ];
    }

    try {
      await contasPagarReceberService.criar(tipo, dados);
      setMensagem(
        `${ehPagar ? "Conta a pagar" : "Conta a receber"} criada com sucesso.`,
      );
      setModalAberto(false);
      setPagina(0);
      setRecarregar((valor) => valor + 1);
    } catch (erroSalvamento) {
      console.error(`Erro ao criar ${titulo.toLowerCase()}:`, erroSalvamento);
      setErroFormulario(
        erroSalvamento?.response?.data?.erro ||
          erroSalvamento?.response?.data?.message ||
          `Não foi possível criar ${titulo.toLowerCase()}.`,
      );
    } finally {
      setSalvando(false);
    }
  };

  const pessoasOptions = [
    { value: "", label: `Selecione ${ehPagar ? "um fornecedor" : "um cliente"}` },
    ...pessoas.map((pessoa) => ({ value: pessoa.id, label: pessoa.nome })),
  ];
  const categoriasOptions = [
    { value: "", label: "Sem categoria" },
    ...categorias.map((categoria) => ({
      value: categoria.id,
      label: categoria.nome,
    })),
  ];

  return (
    <div className="cadastros-page">
      {mensagem && (
        <p className="cadastros-mensagem" role="status">
          {mensagem}
        </p>
      )}

      {erroOpcoes && (
        <p className="cadastros-form__error" role="alert">
          {erroOpcoes}
        </p>
      )}

      <p className="cadastros-ajuda">
        O cadastro registra o compromisso, mas não efetua a baixa nem cria a
        movimentação financeira.
      </p>

      <Card className="cadastros-toolbar cadastros-toolbar--filters">
        <Select
          id={`${tipo}-filtro-pessoa`}
          aria-label={`Filtrar por ${pessoaLabel.toLowerCase()}`}
          options={[
            { value: "", label: "Todas as pessoas" },
            ...pessoas.map((pessoa) => ({
              value: pessoa.id,
              label: pessoa.nome,
            })),
          ]}
          value={pessoaFiltro}
          onChange={alterarFiltro(setPessoaFiltro)}
        />
        <Select
          id={`${tipo}-filtro-categoria`}
          aria-label="Filtrar por categoria"
          options={[
            { value: "", label: "Todas as categorias" },
            ...categorias.map((categoria) => ({
              value: categoria.id,
              label: categoria.nome,
            })),
          ]}
          value={categoriaFiltro}
          onChange={alterarFiltro(setCategoriaFiltro)}
        />
        <Select
          id={`${tipo}-filtro-status`}
          aria-label="Filtrar por status"
          options={STATUS_OPTIONS}
          value={statusFiltro}
          onChange={alterarFiltro(setStatusFiltro)}
        />
        <Button
          onClick={abrirModal}
          disabled={Boolean(erroOpcoes)}
          icon={<HugeiconsIcon icon={PlusIcon} size={18} />}
        >
          Nova conta
        </Button>
      </Card>

      <Card className="cadastros-list-card">
        {carregando && contas.length === 0 ? (
          <Loading message={`Carregando ${titulo.toLowerCase()}...`} />
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
            title={`Nenhuma ${ehPagar ? "conta a pagar" : "conta a receber"} encontrada`}
            description={`Cadastre ${ehPagar ? "uma obrigação" : "um valor a receber"} ou ajuste os filtros.`}
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
                    <th>{pessoaLabel}</th>
                    <th>Descrição</th>
                    <th>Data de emissão</th>
                    {!ehPagar && <th>Vencimento</th>}
                    <th>Valor</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {contas.map((conta) => (
                    <tr key={conta.id}>
                      <td>{conta.pessoaNome}</td>
                      <td>{conta.descricao || conta.categoriaNome || "—"}</td>
                      <td>{formatarData(conta.dataEmissao)}</td>
                      {!ehPagar && (
                        <td>
                          {formatarData(conta.parcelas?.[0]?.dataVencimento)}
                          {conta.parcelas?.length > 1 &&
                            ` (+${conta.parcelas.length - 1})`}
                        </td>
                      )}
                      <td>{formatarMoeda(conta.valorTotal)}</td>
                      <td>
                        <Badge variant={variantStatus(conta.status)}>
                          {STATUS_LABELS[conta.status] || conta.status}
                        </Badge>
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
        title={`Nova ${ehPagar ? "conta a pagar" : "conta a receber"}`}
        subtitle="Preencha os dados do compromisso financeiro."
      >
        <form className="cadastros-form" onSubmit={salvarConta}>
          <Select
            id={`${tipo}-pessoa`}
            name="pessoaId"
            label={pessoaLabel}
            options={pessoasOptions}
            value={formulario.pessoaId}
            onChange={atualizarCampo}
            required
          />
          <Select
            id={`${tipo}-categoria`}
            name="categoriaId"
            label="Categoria"
            options={categoriasOptions}
            value={formulario.categoriaId}
            onChange={atualizarCampo}
          />
          <Input
            id={`${tipo}-descricao`}
            name="descricao"
            label="Descrição"
            value={formulario.descricao}
            onChange={atualizarCampo}
            maxLength={255}
          />
          <Input
            id={`${tipo}-data-emissao`}
            name="dataEmissao"
            label="Data de emissão"
            type="date"
            value={formulario.dataEmissao}
            onChange={atualizarCampo}
            required
          />
          {!ehPagar && (
            <Input
              id="conta-receber-data-vencimento"
              name="dataVencimento"
              label="Vencimento da parcela"
              type="date"
              value={formulario.dataVencimento}
              onChange={atualizarCampo}
              required
            />
          )}
          <Input
            id={`${tipo}-valor`}
            name="valorTotal"
            label="Valor total"
            type="number"
            min="0.01"
            step="0.01"
            value={formulario.valorTotal}
            onChange={atualizarCampo}
            required
          />
          <label className="cadastros-field" htmlFor={`${tipo}-observacao`}>
            <span className="cadastros-field__label">Observações</span>
            <textarea
              id={`${tipo}-observacao`}
              name="observacao"
              value={formulario.observacao}
              onChange={atualizarCampo}
              maxLength={255}
              rows={2}
            />
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

export default ContasPagarReceberList;
