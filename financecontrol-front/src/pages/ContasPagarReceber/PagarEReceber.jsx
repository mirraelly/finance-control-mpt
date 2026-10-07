import { useEffect, useMemo, useState } from "react";
import {
  Edit02Icon,
  HugeiconsIcon,
  Search01Icon,
  Undo03Icon,
} from "../../assets/icons";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import DatePicker from "../../components/common/DatePicker/DatePicker";
import EmptyState from "../../components/common/EmptyState";
import Input from "../../components/common/Input";
import Loading from "../../components/common/Loading";
import Select from "../../components/common/Select";
import contaFinanceiraService from "../../services/contaFinanceiraService";
import contasPagarReceberService from "../../services/contasPagarReceberService";
import formaPagamentoService from "../../services/formaPagamentoService";
import "../Cadastros/Cadastros.css";
import "./PagarContas.css";

const PAGE_SIZE = 100;

function dataLocalHoje() {
  const hoje = new Date();
  return [
    hoje.getFullYear(),
    String(hoje.getMonth() + 1).padStart(2, "0"),
    String(hoje.getDate()).padStart(2, "0"),
  ].join("-");
}

const NOVO_PAGAMENTO = {
  dataPagamento: dataLocalHoje(),
  valorPago: "",
  formaPagamentoId: "",
  contaFinanceiraId: "",
};

const STATUS_LABELS = {
  ABERTO: "Em aberto",
  PARCIALMENTE_PAGO: "Parcialmente pago",
  PAGO: "Pago",
  CANCELADO: "Cancelado",
};

function extrairLista(resposta) {
  return Array.isArray(resposta) ? resposta : resposta?.content || [];
}

async function listarTodasAsContas(tipo) {
  const primeiraPagina = await contasPagarReceberService.listar(tipo, {
    page: 0,
    size: PAGE_SIZE,
    ativo: true,
  });
  const paginasRestantes = Array.from(
    { length: Math.max(0, (primeiraPagina.totalPages || 1) - 1) },
    (_, index) =>
      contasPagarReceberService.listar(tipo, {
        page: index + 1,
        size: PAGE_SIZE,
        ativo: true,
      }),
  );
  const paginas = await Promise.all(paginasRestantes);

  return [
    ...extrairLista(primeiraPagina),
    ...paginas.flatMap(extrairLista),
  ].flatMap((conta) => normalizarConta(conta, tipo));
}

function normalizarConta(conta, tipo) {
  const parcelas = conta.parcelas?.length ? conta.parcelas : [null];
  return parcelas.map((parcela) => {
    const valor = Number(parcela?.valor ?? conta.valorTotal ?? 0);
    const saldo = Number(parcela?.saldo ?? valor);
    const parcelaId = parcela?.id;
    const dataVencimento =
      parcela?.dataVencimento ?? conta.dataVencimento ?? null;

    return {
      id: `${tipo}-${conta.id}${parcelaId ? `-${parcelaId}` : ""}`,
      contaId: conta.id,
      parcelaId,
      tipo,
      pessoaId: conta.pessoaId,
      pessoaNome: conta.pessoaNome || "—",
      descricao: parcela?.descricao || conta.descricao || conta.categoriaNome || "—",
      dataVencimento,
      valor,
      saldo,
      status: parcela?.status || conta.status || "ABERTO",
    };
  });
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
  }).format(Number(valor || 0));
}

function varianteStatus(status) {
  if (status === "PAGO") return "success";
  if (status === "CANCELADO") return "danger";
  if (status === "PARCIALMENTE_PAGO") return "warning";
  return "info";
}

function normalizarTexto(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

function PagarEReceber() {
  const [registros, setRegistros] = useState([]);
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [contasFinanceiras, setContasFinanceiras] = useState([]);
  const [registroSelecionado, setRegistroSelecionado] = useState(null);
  const [pagamento, setPagamento] = useState(NOVO_PAGAMENTO);
  const [busca, setBusca] = useState("");
  const [filtroPessoa, setFiltroPessoa] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [vencimentoDe, setVencimentoDe] = useState("");
  const [vencimentoAte, setVencimentoAte] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [erroOpcoes, setErroOpcoes] = useState("");
  const [erroPagamento, setErroPagamento] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      try {
        setCarregando(true);
        setErro("");
        setErroOpcoes("");
        const resultados = await Promise.allSettled([
          listarTodasAsContas("pagar"),
          listarTodasAsContas("receber"),
          formaPagamentoService.listar({
            page: 0,
            size: PAGE_SIZE,
            ativo: true,
          }),
          contaFinanceiraService.listarAtivas(),
        ]);

        if (!ativo) return;
        const [
          resultadoPagar,
          resultadoReceber,
          resultadoFormas,
          resultadoContas,
        ] = resultados;
        const erros = [];

        if (resultadoPagar.status === "rejected") {
          console.error("Erro ao carregar contas a pagar:", resultadoPagar.reason);
          erros.push("contas a pagar");
        }

        if (resultadoReceber.status === "rejected") {
          console.error(
            "Erro ao carregar contas a receber:",
            resultadoReceber.reason,
          );
          erros.push("contas a receber");
        }

        if (resultadoFormas.status === "fulfilled") {
          setFormasPagamento(extrairLista(resultadoFormas.value));
        } else {
          console.error("Erro ao carregar formas de pagamento:", resultadoFormas.reason);
          setFormasPagamento([]);
          erros.push("formas de pagamento");
        }

        if (resultadoContas.status === "fulfilled") {
          setContasFinanceiras(resultadoContas.value);
        } else {
          console.error(
            "Erro ao carregar contas financeiras:",
            resultadoContas.reason,
          );
          setContasFinanceiras([]);
          erros.push("contas financeiras");
        }

        setRegistros([
          ...(resultadoPagar.status === "fulfilled" ? resultadoPagar.value : []),
          ...(resultadoReceber.status === "fulfilled"
            ? resultadoReceber.value
            : []),
        ]);

        if (
          resultadoPagar.status === "rejected" &&
          resultadoReceber.status === "rejected"
        ) {
          setErro(
            "Não foi possível carregar as contas a pagar nem as contas a receber. Verifique a conexão com o servidor e tente novamente.",
          );
        } else if (erros.length > 0) {
          setErroOpcoes(
            `Não foi possível carregar ${erros.join(" e ")}. Algumas opções podem ficar indisponíveis.`,
          );
        }
      } catch (loadError) {
        console.error("Erro ao carregar contas para pagamento:", loadError);
        if (ativo) {
          setErro(
            "Não foi possível carregar as contas e opções de pagamento. Recarregue a página e tente novamente.",
          );
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarDados();
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (!mensagem) return undefined;
    const timeout = setTimeout(() => setMensagem(""), 4000);
    return () => clearTimeout(timeout);
  }, [mensagem]);

  const pessoas = useMemo(() => {
    const pessoasUnicas = new Map();
    registros.forEach((registro) => {
      if (registro.pessoaId) {
        pessoasUnicas.set(String(registro.pessoaId), registro.pessoaNome);
      }
    });
    return [...pessoasUnicas].map(([id, nome]) => ({ id, nome }));
  }, [registros]);

  const registrosFiltrados = useMemo(() => {
    const termo = normalizarTexto(busca.trim());
    return registros.filter((registro) => {
      const tipoLabel =
        registro.tipo === "pagar" ? "Contas a pagar" : "Contas a receber";
      const statusLabel = STATUS_LABELS[registro.status] || registro.status;
      const correspondeBusca =
        !termo ||
        normalizarTexto(
          [
            registro.pessoaNome,
            registro.descricao,
            tipoLabel,
            statusLabel,
            formatarData(registro.dataVencimento),
          ].join(" "),
        ).includes(termo);

      return (
        correspondeBusca &&
        (!filtroPessoa || String(registro.pessoaId) === filtroPessoa) &&
        (!filtroTipo || registro.tipo === filtroTipo) &&
        (!filtroStatus || registro.status === filtroStatus) &&
        (!vencimentoDe ||
          (registro.dataVencimento &&
            registro.dataVencimento >= vencimentoDe)) &&
        (!vencimentoAte ||
          (registro.dataVencimento &&
            registro.dataVencimento <= vencimentoAte))
      );
    });
  }, [
    busca,
    filtroPessoa,
    filtroStatus,
    filtroTipo,
    registros,
    vencimentoAte,
    vencimentoDe,
  ]);

  const alterarCampoPagamento = (event) => {
    const { name, value } = event.target;
    setPagamento((atual) => ({ ...atual, [name]: value }));
  };

  const voltarParaLista = () => {
    setRegistroSelecionado(null);
    setPagamento(NOVO_PAGAMENTO);
    setErroPagamento("");
  };

  const abrirPagamento = (registro) => {
    setRegistroSelecionado(registro);
    setPagamento({
      ...NOVO_PAGAMENTO,
      valorPago: String(registro.saldo),
    });
    setErroPagamento("");
  };

  const salvarPagamento = (event) => {
    event.preventDefault();
    setErroPagamento("");

    const valorPago = Number(pagamento.valorPago);
    if (!pagamento.dataPagamento) {
      setErroPagamento("Informe a data do pagamento.");
      return;
    }
    if (!Number.isFinite(valorPago) || valorPago <= 0) {
      setErroPagamento("Informe um valor pago maior que zero.");
      return;
    }
    if (valorPago > registroSelecionado.saldo) {
      setErroPagamento("O valor pago não pode ser maior que o saldo da conta.");
      return;
    }
    if (!pagamento.formaPagamentoId || !pagamento.contaFinanceiraId) {
      setErroPagamento("Selecione a forma de pagamento e a conta financeira.");
      return;
    }

    const novoSaldo = Math.max(0, registroSelecionado.saldo - valorPago);
    const novoStatus = novoSaldo === 0 ? "PAGO" : "PARCIALMENTE_PAGO";
    setRegistros((atuais) =>
      atuais.map((atual) =>
        atual.id === registroSelecionado.id
          ? { ...atual, saldo: novoSaldo, status: novoStatus }
          : atual,
      ),
    );
    setMensagem(
      novoStatus === "PAGO"
        ? "Pagamento registrado. A conta foi marcada como paga."
        : "Pagamento parcial registrado. O saldo da conta foi atualizado.",
    );
    voltarParaLista();
  };

  if (carregando) return <Loading message="Carregando contas..." />;

  if (erro) {
    return (
      <div className="cadastros-page pagar-contas-page">
        <EmptyState
          title="Erro ao carregar contas"
          description={erro}
          fullWidth
        />
      </div>
    );
  }

  return (
    <div className="cadastros-page pagar-contas-page">
      {erroOpcoes && (
        <p className="cadastros-form__error" role="alert">
          {erroOpcoes}
        </p>
      )}

      {registroSelecionado ? (
        <Card className="cadastros-form-page pagar-contas-form-card">
          <div className="cadastros-form-page__heading">
            <div>
              <h2>Registrar pagamento</h2>
              <p>Confira os dados da conta e preencha as informações do pagamento.</p>
            </div>
            <Button
              variant="ghost"
              onClick={voltarParaLista}
              className="button__return"
              icon={<HugeiconsIcon icon={Undo03Icon} size={18} />}
            >
              Voltar
            </Button>
          </div>

          <form className="pagar-contas-form" onSubmit={salvarPagamento}>
            <div className="pagar-contas-form__grid">
              <Input
                label="TIPO"
                value={
                  registroSelecionado.tipo === "pagar"
                    ? "Contas a pagar"
                    : "Contas a receber"
                }
                readOnly
                disabled
              />
              <Input
                label="PESSOA"
                value={registroSelecionado.pessoaNome}
                readOnly
                disabled
              />
              <Input
                label="DESCRIÇÃO"
                value={registroSelecionado.descricao}
                readOnly
                disabled
              />
              <Input
                label="VENCIMENTO"
                value={formatarData(registroSelecionado.dataVencimento)}
                readOnly
                disabled
              />
              <Input
                label="VALOR"
                value={formatarMoeda(registroSelecionado.valor)}
                readOnly
                disabled
              />
              <DatePicker
                id="pagar-contas-data-pagamento"
                name="dataPagamento"
                label="DATA DE PAGAMENTO*"
                value={pagamento.dataPagamento}
                onChange={alterarCampoPagamento}
                required
                dropdownPosition="left"
              />
              <Input
                id="pagar-contas-valor-pago"
                name="valorPago"
                label="VALOR PAGO*"
                type="number"
                min="0.01"
                max={registroSelecionado.saldo}
                step="0.01"
                value={pagamento.valorPago}
                onChange={alterarCampoPagamento}
                required
              />
              <Select
                id="pagar-contas-forma-pagamento"
                name="formaPagamentoId"
                label="FORMA DE PAGAMENTO*"
                required
                options={[
                  { value: "", label: "Selecione uma forma de pagamento" },
                  ...formasPagamento.map((forma) => ({
                    value: String(forma.id),
                    label: forma.nome,
                  })),
                ]}
                value={pagamento.formaPagamentoId}
                onChange={alterarCampoPagamento}
              />
              <Select
                id="pagar-contas-conta-financeira"
                name="contaFinanceiraId"
                label="CONTA*"
                required
                options={[
                  { value: "", label: "Selecione uma conta" },
                  ...contasFinanceiras.map((conta) => ({
                    value: String(conta.id),
                    label: conta.nome,
                  })),
                ]}
                value={pagamento.contaFinanceiraId}
                onChange={alterarCampoPagamento}
              />
            </div>

            {erroPagamento && (
              <p className="cadastros-form__error" role="alert">
                {erroPagamento}
              </p>
            )}

            <div className="cadastros-form__actions">
              <Button
                variant="outline"
                onClick={voltarParaLista}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </Card>
      ) : (
        <>
          <Card className="cadastros-toolbar cadastros-toolbar--filters pagar-contas-filtros">
            <Input
              aria-label="Busca geral"
              placeholder="Buscar contas..."
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              icon={<HugeiconsIcon icon={Search01Icon} size={18} />}
              fullWidth
            />
            <Select
              id="pagar-contas-filtro-pessoa"
              aria-label="Filtrar por pessoa"
              options={[
                { value: "", label: "Todas as pessoas" },
                ...pessoas.map((pessoa) => ({
                  value: pessoa.id,
                  label: pessoa.nome,
                })),
              ]}
              value={filtroPessoa}
              onChange={(event) => setFiltroPessoa(event.target.value)}
            />
            <Select
              id="pagar-contas-filtro-tipo"
              aria-label="Filtrar por tipo"
              options={[
                { value: "", label: "Ambos os tipos" },
                { value: "pagar", label: "Contas a pagar" },
                { value: "receber", label: "Contas a receber" },
              ]}
              value={filtroTipo}
              onChange={(event) => setFiltroTipo(event.target.value)}
            />
            <Select
              id="pagar-contas-filtro-status"
              aria-label="Filtrar por status"
              options={[
                { value: "", label: "Todos os status" },
                ...Object.entries(STATUS_LABELS).map(([value, label]) => ({
                  value,
                  label,
                })),
              ]}
              value={filtroStatus}
              onChange={(event) => setFiltroStatus(event.target.value)}
            />
            <div className="pagar-contas-filtros__periodo">
              <DatePicker
                id="pagar-contas-vencimento-de"
                name="vencimentoDe"
                placeholder="Vencimento de"
                value={vencimentoDe}
                onChange={(event) => setVencimentoDe(event.target.value)}
              />
              <span className="pagar-contas-filtros__ate">até</span>
              <DatePicker
                id="pagar-contas-vencimento-ate"
                name="vencimentoAte"
                placeholder="Vencimento até"
                value={vencimentoAte}
                onChange={(event) => setVencimentoAte(event.target.value)}
                dropdownPosition="left"
              />
            </div>
          </Card>

          {mensagem && (
            <p className="cadastros-mensagem" role="status">
              {mensagem}
            </p>
          )}

          <Card className="cadastros-list-card">
            {registrosFiltrados.length === 0 ? (
              <EmptyState
                title="Nenhuma conta encontrada"
                description="Não há contas para os filtros selecionados."
                fullWidth
              />
            ) : (
              <div className="cadastros-table-wrapper">
                <table className="cadastros-table">
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Pessoa</th>
                      <th>Descrição</th>
                      <th>Vencimento</th>
                      <th>Valor</th>
                      <th>Saldo</th>
                      <th>Status</th>
                      <th className="cadastros-table__actions-heading">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrosFiltrados.map((registro) => (
                      <tr key={registro.id}>
                        <td>
                          {registro.tipo === "pagar"
                            ? "Contas a pagar"
                            : "Contas a receber"}
                        </td>
                        <td>{registro.pessoaNome}</td>
                        <td className="cadastros-table__muted">
                          {registro.descricao}
                        </td>
                        <td>{formatarData(registro.dataVencimento)}</td>
                        <td>{formatarMoeda(registro.valor)}</td>
                        <td>{formatarMoeda(registro.saldo)}</td>
                        <td>
                          <Badge variant={varianteStatus(registro.status)}>
                            {STATUS_LABELS[registro.status] ||
                              registro.status}
                          </Badge>
                        </td>
                        <td>
                          <div className="cadastros-table__actions">
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Registrar pagamento"
                              aria-label={`Registrar pagamento: ${registro.descricao} — ${registro.pessoaNome}`}
                              disabled={
                                registro.status === "PAGO" ||
                                registro.status === "CANCELADO"
                              }
                              onClick={() => abrirPagamento(registro)}
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
            )}
          </Card>

          <p className="pagar-contas-aviso">
            A API ainda não expõe o vencimento das contas a pagar nem o endpoint
            de baixa; nesses casos, o vencimento aparece como indisponível e o
            pagamento e o status ficam nesta tela.
          </p>
        </>
      )}
    </div>
  );
}

export default PagarEReceber;
