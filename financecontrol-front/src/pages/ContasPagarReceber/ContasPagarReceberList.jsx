import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  HugeiconsIcon,
  Edit02Icon,
  MoneySendCircleIcon,
  UnavailableIcon,
  Wallet01Icon,
  MoneyReceiveCircleIcon,
  UserCheck01Icon,
} from "../../assets/icons";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
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

function ContasPagarReceberList({ tipo }) {
  const navigate = useNavigate();
  const location = useLocation();
  const ehPagar = tipo === "pagar";
  const titulo = ehPagar ? "Contas a Pagar" : "Contas a Receber";
  const pessoaLabel = ehPagar ? "Fornecedor / credor" : "Cliente / devedor";
  const iconeTipoConta = ehPagar ? MoneySendCircleIcon: MoneyReceiveCircleIcon;

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
  const [situacaoFiltro, setSituacaoFiltro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [erroOpcoes, setErroOpcoes] = useState("");
  const [mensagem, setMensagem] = useState(location.state?.mensagem || "");
  const [contaSelecionada, setContaSelecionada] = useState(null);
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
          ativo: situacaoFiltro === "" ? undefined : situacaoFiltro,
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
    situacaoFiltro,
    recarregar,
  ]);

  const confirmarAlteracaoSituacao = async () => {
    try {
      setAlterandoSituacao(true);
      await contasPagarReceberService.atualizar(tipo, contaSelecionada.id, {
        ativo: !contaSelecionada.ativo,
      });
      setMensagem(
        contaSelecionada.ativo
          ? `${ehPagar ? "Conta a pagar" : "Conta a receber"} inativada com sucesso.`
          : `${ehPagar ? "Conta a pagar" : "Conta a receber"} ativada com sucesso.`,
      );
      setContaSelecionada(null);
      setRecarregar((valor) => valor + 1);
    } catch (alteracaoError) {
      console.error(`Erro ao alterar situação de ${titulo.toLowerCase()}:`, alteracaoError);
      alert(
        alteracaoError?.response?.data?.erro ||
          `Não foi possível alterar a situação de ${titulo.toLowerCase()}.`,
      );
    } finally {
      setAlterandoSituacao(false);
    }
  };

  const alterarFiltro = (setter) => (event) => {
    setter(event.target.value);
    setPagina(0);
  };

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
        <Select
          id={`${tipo}-filtro-situacao`}
          aria-label="Filtrar por situação"
          options={[
            { value: "", label: "Todas as situações" },
            { value: "true", label: "Ativas" },
            { value: "false", label: "Inativas" },
          ]}
          value={situacaoFiltro}
          onChange={alterarFiltro(setSituacaoFiltro)}
        />
        <Button
          onClick={() => navigate(`/contas/contas-${tipo}/nova`)}
          icon={<HugeiconsIcon icon={iconeTipoConta} size={18} />}
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
                    <th>Situação</th>
                    <th className="cadastros-table__actions-heading">Ações</th>
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
                            onClick={() =>
                              navigate(
                                `/contas/contas-${tipo}/${conta.id}`,
                              )
                            }
                            aria-label={`Editar ${ehPagar ? "conta a pagar" : "conta a receber"} ${conta.descricao || conta.pessoaNome}`}
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
                            title={conta.ativo ? `Inativar ${ehPagar ? "conta a pagar" : "conta a receber"}` : `Ativar ${ehPagar ? "conta a pagar" : "conta a receber"}`}
                            aria-label={`${conta.ativo ? "Inativar" : "Ativar"} ${ehPagar ? "conta a pagar" : "conta a receber"} ${conta.descricao || conta.pessoaNome}`}
                            onClick={() => setContaSelecionada(conta)}
                            icon={
                              <HugeiconsIcon
                                icon={conta.ativo ? UnavailableIcon : UserCheck01Icon}
                                color={conta.ativo ? "#b91c1c" : "#16a34a"}
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
        isOpen={Boolean(contaSelecionada)}
        onClose={() => !alterandoSituacao && setContaSelecionada(null)}
        title={`${contaSelecionada?.ativo ? "Inativar" : "Ativar"} ${ehPagar ? "conta a pagar" : "conta a receber"}`}
        closeOnOverlay={!alterandoSituacao}
        footer={
          <div className="cadastros-form__actions">
            <Button
              variant="outline"
              onClick={() => setContaSelecionada(null)}
              disabled={alterandoSituacao}
            >
              Cancelar
            </Button>
            <Button
              variant={contaSelecionada?.ativo ? "danger" : "primary"}
              onClick={confirmarAlteracaoSituacao}
              disabled={alterandoSituacao}
            >
              {alterandoSituacao ? "Salvando..." : "Confirmar"}
            </Button>
          </div>
        }
      >
        {contaSelecionada && (
          <p>
            Deseja {contaSelecionada.ativo ? "inativar" : "ativar"}{" "}
            {ehPagar ? "a conta a pagar" : "a conta a receber"}{" "}
            {contaSelecionada.descricao || `de ${contaSelecionada.pessoaNome}`}?
          </p>
        )}
      </Modal>
    </div>
  );
}

export default ContasPagarReceberList;
