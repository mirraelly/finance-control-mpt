import { useEffect, useMemo, useState } from "react";
import {
  CancelCircleIcon,
  Edit02Icon,
  HugeiconsIcon,
  Search01Icon,
  Undo03Icon,
  ViewIcon,
} from "../../assets/icons";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import DatePicker from "../../components/common/DatePicker/DatePicker";
import EmptyState from "../../components/common/EmptyState";
import Input from "../../components/common/Input";
import Loading from "../../components/common/Loading";
import Modal from "../../components/common/Modal/Modal";
import Select from "../../components/common/Select";
import useToast from "../../components/common/Toast/useToast";
import contaFinanceiraService from "../../services/contaFinanceiraService";
import contasPagarReceberService from "../../services/contasPagarReceberService";
import formaPagamentoService from "../../services/formaPagamentoService";
import {
  centavosParaMoeda,
  mascaraMoeda,
  moedaParaCentavos,
} from "../../utils/formatters";
import { showApiErrorToast } from "../../utils/toastErrors";
import validateRequiredFields from "../../utils/validateRequiredFields";
import "../Cadastros/Cadastros.css";
import "./PagarContas.css";

const PAGE_SIZE = 100;

const CAMPOS_MOEDA = ["valor", "juros", "multa", "desconto"];

const STATUS_LABELS = {
  ABERTO: "Em aberto",
  PARCIALMENTE_PAGO: "Parcialmente pago",
  PAGO: "Pago",
  CANCELADO: "Cancelado",
};

function dataLocalHoje() {
  const hoje = new Date();
  return [
    hoje.getFullYear(),
    String(hoje.getMonth() + 1).padStart(2, "0"),
    String(hoje.getDate()).padStart(2, "0"),
  ].join("-");
}

function criarNovaBaixa() {
  return {
    dataBaixa: dataLocalHoje(),
    valor: "",
    juros: "",
    multa: "",
    desconto: "",
    formaPagamentoId: "",
    contaFinanceiraId: "",
    observacao: "",
  };
}

function paraCentavos(valor) {
  return Math.round(Number(valor || 0) * 100);
}

function extrairLista(resposta) {
  return Array.isArray(resposta) ? resposta : resposta?.content || [];
}

async function listarTodasAsParcelas(tipo, status) {
  const filtros = { size: PAGE_SIZE, status: status || undefined };
  const primeiraPagina = await contasPagarReceberService.listarParcelas(tipo, {
    ...filtros,
    page: 0,
  });
  const paginasRestantes = Array.from(
    { length: Math.max(0, (primeiraPagina.totalPages || 1) - 1) },
    (_, index) =>
      contasPagarReceberService.listarParcelas(tipo, {
        ...filtros,
        page: index + 1,
      }),
  );
  const paginas = await Promise.all(paginasRestantes);

  return [
    ...extrairLista(primeiraPagina),
    ...paginas.flatMap(extrairLista),
  ].map((parcela) => normalizarParcela(parcela, tipo));
}

function normalizarParcela(parcela, tipo) {
  return {
    id: `${tipo}-${parcela.id}`,
    parcelaId: parcela.id,
    contaId: tipo === "pagar" ? parcela.contaPagarId : parcela.contaReceberId,
    tipo,
    pessoaId: parcela.pessoaId,
    pessoaNome: parcela.pessoaNome || "—",
    descricao: parcela.descricao || "—",
    numeroParcela: parcela.numeroParcela,
    totalParcelas: parcela.totalParcelas,
    dataVencimento: parcela.dataVencimento,
    valor: Number(parcela.valor),
    saldo: Number(parcela.saldo),
    formaPagamentoId: parcela.formaPagamentoId || "",
    status: parcela.status,
  };
}

function resumirParcela(conta, parcelaId, tipo) {
  const parcela = conta.parcelas?.find((item) => item.id === parcelaId);
  const baixas =
    (tipo === "pagar" ? parcela?.pagamentos : parcela?.recebimentos) || [];
  const abatidoCentavos = baixas.reduce(
    (total, baixa) =>
      total + paraCentavos(baixa.valor) + paraCentavos(baixa.desconto),
    0,
  );

  return {
    baixas,
    saldo: (paraCentavos(parcela?.valor) - abatidoCentavos) / 100,
    status: parcela?.status,
  };
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
    .replace(/[̀-ͯ]/g, "")
    .toLocaleLowerCase("pt-BR");
}

function PagarEReceber() {
  const showToast = useToast();
  const [registros, setRegistros] = useState([]);
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [contasFinanceiras, setContasFinanceiras] = useState([]);
  const [registroSelecionado, setRegistroSelecionado] = useState(null);
  const [baixas, setBaixas] = useState([]);
  const [carregandoBaixas, setCarregandoBaixas] = useState(false);
  const [baixa, setBaixa] = useState(criarNovaBaixa);
  const [salvando, setSalvando] = useState(false);
  const [baixaEstorno, setBaixaEstorno] = useState(null);
  const [estornando, setEstornando] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroPessoa, setFiltroPessoa] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [vencimentoDe, setVencimentoDe] = useState("");
  const [vencimentoAte, setVencimentoAte] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [recarregar, setRecarregar] = useState(0);

  useEffect(() => {
    let ativo = true;

    async function carregarOpcoes() {
      const [resultadoFormas, resultadoContas] = await Promise.allSettled([
        formaPagamentoService.listarAtivas(),
        contaFinanceiraService.listarAtivas(),
      ]);

      if (!ativo) return;
      const erros = [];

      if (resultadoFormas.status === "fulfilled") {
        setFormasPagamento(resultadoFormas.value);
      } else {
        console.error(
          "Erro ao carregar formas de pagamento:",
          resultadoFormas.reason,
        );
        erros.push("formas de pagamento");
      }

      if (resultadoContas.status === "fulfilled") {
        setContasFinanceiras(resultadoContas.value);
      } else {
        console.error(
          "Erro ao carregar contas financeiras:",
          resultadoContas.reason,
        );
        erros.push("contas financeiras");
      }

      if (erros.length > 0) {
        showToast({
          type: "warning",
          title: "Opções parcialmente indisponíveis",
          message: `Não foi possível carregar ${erros.join(" e ")}. Algumas opções podem ficar indisponíveis.`,
        });
      }
    }

    carregarOpcoes();
    return () => {
      ativo = false;
    };
  }, [showToast]);

  useEffect(() => {
    let ativo = true;

    async function carregarParcelas() {
      try {
        setCarregando(true);
        setErro("");
        const [resultadoPagar, resultadoReceber] = await Promise.allSettled([
          listarTodasAsParcelas("pagar", filtroStatus),
          listarTodasAsParcelas("receber", filtroStatus),
        ]);

        if (!ativo) return;

        if (resultadoPagar.status === "rejected") {
          console.error("Erro ao carregar contas a pagar:", resultadoPagar.reason);
        }

        if (resultadoReceber.status === "rejected") {
          console.error(
            "Erro ao carregar contas a receber:",
            resultadoReceber.reason,
          );
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
          const mensagemErro =
            "Não foi possível carregar as contas a pagar nem as contas a receber. Verifique a conexão com o servidor e tente novamente.";
          setErro(mensagemErro);
          showApiErrorToast(showToast, resultadoPagar.reason, mensagemErro);
        } else if (
          resultadoPagar.status === "rejected" ||
          resultadoReceber.status === "rejected"
        ) {
          showToast({
            type: "warning",
            title: "Contas parcialmente indisponíveis",
            message: `Não foi possível carregar as ${
              resultadoPagar.status === "rejected"
                ? "contas a pagar"
                : "contas a receber"
            }.`,
          });
        }
      } catch (loadError) {
        console.error("Erro ao carregar parcelas:", loadError);
        if (ativo) {
          const mensagemErro =
            "Não foi possível carregar as parcelas. Recarregue a página e tente novamente.";
          setErro(mensagemErro);
          showApiErrorToast(showToast, loadError, mensagemErro);
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarParcelas();
    return () => {
      ativo = false;
    };
  }, [filtroStatus, recarregar, showToast]);

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
        (!vencimentoDe ||
          (registro.dataVencimento &&
            registro.dataVencimento >= vencimentoDe)) &&
        (!vencimentoAte ||
          (registro.dataVencimento &&
            registro.dataVencimento <= vencimentoAte))
      );
    });
  }, [busca, filtroPessoa, filtroTipo, registros, vencimentoAte, vencimentoDe]);

  const ehPagar = registroSelecionado?.tipo === "pagar";

  const alterarCampoBaixa = (event) => {
    const { name } = event.target;
    const value = CAMPOS_MOEDA.includes(name)
      ? mascaraMoeda(event.target.value)
      : event.target.value;

    setBaixa((atual) => {
      if (name === "formaPagamentoId") {
        const formaSelecionada = formasPagamento.find(
          (forma) => String(forma.id) === String(value),
        );
        return {
          ...atual,
          formaPagamentoId: value,
          contaFinanceiraId: formaSelecionada?.contaFinanceiraId
            ? String(formaSelecionada.contaFinanceiraId)
            : atual.contaFinanceiraId,
        };
      }

      return { ...atual, [name]: value };
    });
  };

  const voltarParaLista = () => {
    setRegistroSelecionado(null);
    setBaixas([]);
    setBaixa(criarNovaBaixa());
  };

  const abrirParcela = async (registro) => {
    const formaParcela = formasPagamento.find(
      (forma) => String(forma.id) === String(registro.formaPagamentoId),
    );
    setRegistroSelecionado(registro);
    setBaixas([]);
    setBaixa({
      ...criarNovaBaixa(),
      valor:
        registro.saldo > 0 ? centavosParaMoeda(paraCentavos(registro.saldo)) : "",
      formaPagamentoId: formaParcela ? String(formaParcela.id) : "",
      contaFinanceiraId: formaParcela?.contaFinanceiraId
        ? String(formaParcela.contaFinanceiraId)
        : "",
    });

    try {
      setCarregandoBaixas(true);
      const conta = await contasPagarReceberService.buscarPorId(
        registro.tipo,
        registro.contaId,
      );
      setBaixas(resumirParcela(conta, registro.parcelaId, registro.tipo).baixas);
    } catch (loadError) {
      console.error("Erro ao carregar baixas da parcela:", loadError);
      showApiErrorToast(
        showToast,
        loadError,
        "Não foi possível carregar o histórico da parcela.",
      );
    } finally {
      setCarregandoBaixas(false);
    }
  };

  const salvarBaixa = async (event) => {
    event.preventDefault();
    if (!validateRequiredFields(event, showToast)) return;
    const notificarErro = (message) =>
      showToast({ type: "error", title: "Dados inválidos", message });

    const valorCentavos = moedaParaCentavos(baixa.valor);
    const descontoCentavos = moedaParaCentavos(baixa.desconto);

    if (!baixa.dataBaixa) {
      notificarErro(`Informe a data do ${ehPagar ? "pagamento" : "recebimento"}.`);
      return;
    }
    if (baixa.dataBaixa > dataLocalHoje()) {
      notificarErro(
        `A data do ${ehPagar ? "pagamento" : "recebimento"} não pode ser futura.`,
      );
      return;
    }
    if (valorCentavos <= 0) {
      notificarErro("Informe um valor maior que zero.");
      return;
    }
    if (
      valorCentavos + descontoCentavos >
      paraCentavos(registroSelecionado.saldo)
    ) {
      notificarErro(
        "O valor somado ao desconto não pode ser maior que o saldo da parcela.",
      );
      return;
    }
    if (!baixa.formaPagamentoId || !baixa.contaFinanceiraId) {
      notificarErro("Selecione a forma de pagamento e a conta financeira.");
      return;
    }

    const dados = {
      [ehPagar ? "dataPagamento" : "dataRecebimento"]: baixa.dataBaixa,
      valor: valorCentavos / 100,
      juros: moedaParaCentavos(baixa.juros) / 100,
      multa: moedaParaCentavos(baixa.multa) / 100,
      desconto: descontoCentavos / 100,
      formaPagamentoId: baixa.formaPagamentoId,
      contaFinanceiraId: baixa.contaFinanceiraId,
      observacao: baixa.observacao.trim() || null,
    };

    try {
      setSalvando(true);
      await contasPagarReceberService.baixarParcela(
        registroSelecionado.tipo,
        registroSelecionado.parcelaId,
        dados,
      );
      showToast({
        type: "success",
        title: "Operação concluída",
        message: ehPagar
          ? "Pagamento registrado com sucesso."
          : "Recebimento registrado com sucesso.",
      });
      voltarParaLista();
      setRecarregar((valor) => valor + 1);
    } catch (saveError) {
      console.error("Erro ao registrar baixa:", saveError);
      showApiErrorToast(
        showToast,
        saveError,
        `Não foi possível registrar o ${ehPagar ? "pagamento" : "recebimento"}.`,
      );
    } finally {
      setSalvando(false);
    }
  };

  const confirmarEstorno = async () => {
    try {
      setEstornando(true);
      const conta = await contasPagarReceberService.estornarBaixa(
        registroSelecionado.tipo,
        baixaEstorno.id,
      );
      const resumo = resumirParcela(
        conta,
        registroSelecionado.parcelaId,
        registroSelecionado.tipo,
      );
      setBaixas(resumo.baixas);
      setRegistroSelecionado((atual) => ({
        ...atual,
        saldo: resumo.saldo,
        status: resumo.status,
      }));
      setBaixa((atual) => ({
        ...atual,
        valor: centavosParaMoeda(paraCentavos(resumo.saldo)),
      }));
      showToast({
        type: "success",
        title: "Operação concluída",
        message: ehPagar
          ? "Pagamento estornado com sucesso."
          : "Recebimento estornado com sucesso.",
      });
      setBaixaEstorno(null);
      setRecarregar((valor) => valor + 1);
    } catch (estornoError) {
      console.error("Erro ao estornar baixa:", estornoError);
      showApiErrorToast(
        showToast,
        estornoError,
        `Não foi possível estornar o ${ehPagar ? "pagamento" : "recebimento"}.`,
      );
    } finally {
      setEstornando(false);
    }
  };

  if (carregando && registros.length === 0 && !registroSelecionado) {
    return <Loading message="Carregando contas..." />;
  }

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

  const permiteBaixa =
    registroSelecionado &&
    registroSelecionado.saldo > 0 &&
    registroSelecionado.status !== "CANCELADO";
  const nomeBaixa = ehPagar ? "pagamento" : "recebimento";

  return (
    <div className="cadastros-page pagar-contas-page">
      {registroSelecionado ? (
        <Card className="cadastros-form-page pagar-contas-form-card">
          <div className="cadastros-form-page__heading">
            <div>
              <h2>
                {permiteBaixa
                  ? `Registrar ${nomeBaixa}`
                  : ehPagar
                    ? "Pagamentos da parcela"
                    : "Recebimentos da parcela"}
              </h2>
              <p>
                {permiteBaixa
                  ? `Confira os dados da parcela e preencha as informações do ${nomeBaixa}.`
                  : "Esta parcela não possui saldo em aberto."}
              </p>
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

          <form className="pagar-contas-form" onSubmit={salvarBaixa} noValidate>
            <div className="pagar-contas-form__grid">
              <Input
                label="TIPO"
                value={ehPagar ? "Contas a pagar" : "Contas a receber"}
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
                label="PARCELA"
                value={`${registroSelecionado.numeroParcela}/${registroSelecionado.totalParcelas}`}
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
              <Input
                label="SALDO"
                value={formatarMoeda(registroSelecionado.saldo)}
                readOnly
                disabled
              />
              <Input
                label="STATUS"
                value={
                  STATUS_LABELS[registroSelecionado.status] ||
                  registroSelecionado.status
                }
                readOnly
                disabled
              />
              {permiteBaixa && (
                <>
                  <DatePicker
                    id="pagar-contas-data-baixa"
                    name="dataBaixa"
                    label={`DATA DO ${nomeBaixa.toUpperCase()}*`}
                    value={baixa.dataBaixa}
                    onChange={alterarCampoBaixa}
                    max={dataLocalHoje()}
                    required
                    dropdownPosition="left"
                  />
                  <Input
                    id="pagar-contas-valor"
                    name="valor"
                    label="VALOR*"
                    inputMode="numeric"
                    prefix="R$"
                    placeholder="0,00"
                    value={baixa.valor}
                    onChange={alterarCampoBaixa}
                    required
                  />
                  <Input
                    id="pagar-contas-juros"
                    name="juros"
                    label="JUROS"
                    inputMode="numeric"
                    prefix="R$"
                    placeholder="0,00"
                    value={baixa.juros}
                    onChange={alterarCampoBaixa}
                  />
                  <Input
                    id="pagar-contas-multa"
                    name="multa"
                    label="MULTA"
                    inputMode="numeric"
                    prefix="R$"
                    placeholder="0,00"
                    value={baixa.multa}
                    onChange={alterarCampoBaixa}
                  />
                  <Input
                    id="pagar-contas-desconto"
                    name="desconto"
                    label="DESCONTO"
                    inputMode="numeric"
                    prefix="R$"
                    placeholder="0,00"
                    value={baixa.desconto}
                    onChange={alterarCampoBaixa}
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
                    value={baixa.formaPagamentoId}
                    onChange={alterarCampoBaixa}
                  />
                  <Select
                    id="pagar-contas-conta-financeira"
                    name="contaFinanceiraId"
                    label="CONTA FINANCEIRA*"
                    required
                    options={[
                      { value: "", label: "Selecione uma conta" },
                      ...contasFinanceiras.map((conta) => ({
                        value: String(conta.id),
                        label: conta.nome,
                      })),
                    ]}
                    value={baixa.contaFinanceiraId}
                    onChange={alterarCampoBaixa}
                  />
                  <label
                    className="cadastros-field pagar-contas-form__observacao"
                    htmlFor="pagar-contas-observacao"
                  >
                    <span className="cadastros-field__label">OBSERVAÇÃO</span>
                    <textarea
                      id="pagar-contas-observacao"
                      name="observacao"
                      value={baixa.observacao}
                      onChange={alterarCampoBaixa}
                      maxLength={255}
                      rows={2}
                    />
                  </label>
                </>
              )}
            </div>

            {permiteBaixa && (
              <div className="cadastros-form__actions">
                <Button
                  variant="outline"
                  onClick={voltarParaLista}
                  disabled={salvando}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={salvando}>
                  {salvando ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            )}
          </form>

          <div className="pagar-contas-historico">
            <h3>{ehPagar ? "Pagamentos" : "Recebimentos"}</h3>
            {carregandoBaixas ? (
              <Loading message="Carregando histórico..." />
            ) : baixas.length === 0 ? (
              <p className="pagar-contas-historico__vazio">
                Nenhum {nomeBaixa} registrado para esta parcela.
              </p>
            ) : (
              <div className="cadastros-table-wrapper">
                <table className="cadastros-table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Valor</th>
                      <th>Juros</th>
                      <th>Multa</th>
                      <th>Desconto</th>
                      <th>Forma de pagamento</th>
                      <th>Conta financeira</th>
                      <th className="cadastros-table__actions-heading">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {baixas.map((item) => (
                      <tr key={item.id}>
                        <td>
                          {formatarData(
                            ehPagar ? item.dataPagamento : item.dataRecebimento,
                          )}
                        </td>
                        <td>{formatarMoeda(item.valor)}</td>
                        <td>{formatarMoeda(item.juros)}</td>
                        <td>{formatarMoeda(item.multa)}</td>
                        <td>{formatarMoeda(item.desconto)}</td>
                        <td>{item.formaPagamentoNome}</td>
                        <td>{item.contaFinanceiraNome}</td>
                        <td>
                          <div className="cadastros-table__actions">
                            <Button
                              variant="ghost"
                              size="sm"
                              title={`Estornar ${nomeBaixa}`}
                              aria-label={`Estornar ${nomeBaixa} de ${formatarMoeda(item.valor)}`}
                              disabled={registroSelecionado.status === "CANCELADO"}
                              onClick={() => setBaixaEstorno(item)}
                              icon={
                                <HugeiconsIcon
                                  icon={CancelCircleIcon}
                                  size={18}
                                  color="#b91c1c"
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
          </div>
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

          <Card className="cadastros-list-card">
            {registrosFiltrados.length === 0 ? (
              <EmptyState
                title="Nenhuma conta encontrada"
                description="Não há contas para os filtros selecionados."
                fullWidth
              />
            ) : (
              <div
                className={`cadastros-table-wrapper${carregando ? " cadastros-table-wrapper--loading" : ""}`}
                aria-busy={carregando}
              >
                <table className="cadastros-table">
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Pessoa</th>
                      <th>Descrição</th>
                      <th>Parcela</th>
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
                    {registrosFiltrados.map((registro) => {
                      const nomeAcao =
                        registro.tipo === "pagar" ? "pagamento" : "recebimento";
                      const titulo =
                        registro.status === "PAGO"
                          ? `Ver ${nomeAcao}s`
                          : `Registrar ${nomeAcao}`;

                      return (
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
                          <td>
                            {registro.numeroParcela}/{registro.totalParcelas}
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
                                title={titulo}
                                aria-label={`${titulo}: ${registro.descricao} — ${registro.pessoaNome}`}
                                disabled={registro.status === "CANCELADO"}
                                onClick={() => abrirParcela(registro)}
                                icon={
                                  <HugeiconsIcon
                                    icon={
                                      registro.status === "PAGO"
                                        ? ViewIcon
                                        : Edit02Icon
                                    }
                                    size={18}
                                    color="var(--color-emerald-500)"
                                  />
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      <Modal
        isOpen={Boolean(baixaEstorno)}
        onClose={() => !estornando && setBaixaEstorno(null)}
        title={`Estornar ${nomeBaixa}`}
        closeOnOverlay={!estornando}
        footer={
          <div className="cadastros-form__actions">
            <Button
              variant="outline"
              onClick={() => setBaixaEstorno(null)}
              disabled={estornando}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={confirmarEstorno}
              disabled={estornando}
            >
              {estornando ? "Estornando..." : "Confirmar"}
            </Button>
          </div>
        }
      >
        {baixaEstorno && (
          <p>
            Deseja estornar o {nomeBaixa} de{" "}
            {formatarMoeda(baixaEstorno.valor)} feito em{" "}
            {formatarData(
              ehPagar
                ? baixaEstorno.dataPagamento
                : baixaEstorno.dataRecebimento,
            )}
            ? O lançamento financeiro gerado também será excluído.
          </p>
        )}
      </Modal>
    </div>
  );
}

export default PagarEReceber;
