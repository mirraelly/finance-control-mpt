import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Delete02Icon,
  HugeiconsIcon,
  PlusIcon,
  Undo03Icon,
} from "../../assets/icons";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import Input from "../../components/common/Input";
import Loading from "../../components/common/Loading";
import Select from "../../components/common/Select";
import ToggleSwitch from "../../components/common/ToggleSwitch";
import useToast from "../../components/common/Toast/useToast";
import categoriaService from "../../services/categoriaService";
import contaFinanceiraService from "../../services/contaFinanceiraService";
import contasPagarReceberService from "../../services/contasPagarReceberService";
import formaPagamentoService from "../../services/formaPagamentoService";
import pessoaService from "../../services/pessoaService";
import {
  centavosParaMoeda,
  mascaraMoeda,
  moedaParaCentavos,
} from "../../utils/formatters";
import { showApiErrorToast } from "../../utils/toastErrors";
import validateRequiredFields from "../../utils/validateRequiredFields";
import "../Cadastros/Cadastros.css";
import "./ContaPagarReceberForm.css";

function dataLocalHoje() {
  const hoje = new Date();
  return [
    hoje.getFullYear(),
    String(hoje.getMonth() + 1).padStart(2, "0"),
    String(hoje.getDate()).padStart(2, "0"),
  ].join("-");
}

function adicionarMeses(data, quantidade) {
  const [ano, mes, dia] = data.split("-").map(Number);
  const dataAlvo = new Date(ano, mes - 1 + quantidade, 1);
  const ultimoDiaMes = new Date(
    dataAlvo.getFullYear(),
    dataAlvo.getMonth() + 1,
    0,
  ).getDate();
  dataAlvo.setDate(Math.min(dia, ultimoDiaMes));

  return [
    dataAlvo.getFullYear(),
    String(dataAlvo.getMonth() + 1).padStart(2, "0"),
    String(dataAlvo.getDate()).padStart(2, "0"),
  ].join("-");
}

function extrairLista(resposta) {
  return Array.isArray(resposta) ? resposta : resposta?.content || [];
}

async function listarTodasAsFormasPagamento() {
  const tamanhoPagina = 100;
  const primeiraPagina = await formaPagamentoService.listar({
    page: 0,
    size: tamanhoPagina,
    ativo: true,
  });
  const paginasRestantes = await Promise.all(
    Array.from(
      { length: Math.max(0, (primeiraPagina.totalPages || 1) - 1) },
      (_, index) =>
        formaPagamentoService.listar({
          page: index + 1,
          size: tamanhoPagina,
          ativo: true,
        }),
    ),
  );

  return [
    ...extrairLista(primeiraPagina),
    ...paginasRestantes.flatMap(extrairLista),
  ];
}

function criarFormularioInicial() {
  return {
    pessoaId: "",
    categoriaId: "",
    descricao: "",
    dataEmissao: dataLocalHoje(),
    valorTotal: "",
    observacao: "",
    dataPrimeiroVencimento: dataLocalHoje(),
    status: "ABERTO",
    formaPagamentoId: "",
    contaFinanceiraId: "",
    quantidadeParcelas: "1",
    ativo: true,
  };
}

function ContaPagarReceberForm({ tipo }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();
  const ehPagar = tipo === "pagar";
  const chaveBaixas = ehPagar ? "pagamentos" : "recebimentos";
  const titulo = ehPagar ? "conta a pagar" : "conta a receber";
  const basePath = `/contas/contas-${tipo}`;
  const [formulario, setFormulario] = useState(criarFormularioInicial);
  const [parcelas, setParcelas] = useState([]);
  const ultimaChaveParcela = useRef(0);
  const [pessoas, setPessoas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [contasFinanceiras, setContasFinanceiras] = useState([]);
  const [contaCarregada, setContaCarregada] = useState(null);
  const [erroFormasPagamento, setErroFormasPagamento] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [parcelasAlteradas, setParcelasAlteradas] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      try {
        setErroFormasPagamento("");
        const [
          listaPessoas,
          listaCategorias,
          conta,
          listaContasFinanceiras,
        ] = await Promise.all([
          pessoaService.listarPessoasAtivas(),
          categoriaService.listarAtivas(),
          id ? contasPagarReceberService.buscarPorId(tipo, id) : Promise.resolve(null),
          contaFinanceiraService.listarAtivas(),
        ]);
        if (!ativo) return;
        setPessoas(listaPessoas);
        setCategorias(listaCategorias);
        setContasFinanceiras(listaContasFinanceiras);
        let listaFormasPagamento = [];
        let formasPagamentoIndisponiveis = false;
        try {
          listaFormasPagamento = await listarTodasAsFormasPagamento();
        } catch (formasError) {
          formasPagamentoIndisponiveis = true;
          console.error("Erro ao carregar formas de pagamento:", formasError);
          if (ativo) {
            setErroFormasPagamento(
              "Não foi possível carregar as opções de formas de pagamento.",
            );
            showToast({
              type: "warning",
              title: "Formas de pagamento indisponíveis",
              message:
                "Não foi possível carregar as opções de formas de pagamento.",
            });
          }
        }
        if (conta) {
          const parcelasConta = [...(conta.parcelas || [])].sort(
            (a, b) => a.numeroParcela - b.numeroParcela,
          );
          const formasAusentes = [
            ...new Map(
              parcelasConta
                .filter(
                  (parcela) =>
                    parcela.formaPagamentoId &&
                    !listaFormasPagamento.some(
                      (forma) =>
                        String(forma.id) === String(parcela.formaPagamentoId),
                    ),
                )
                .map((parcela) => [String(parcela.formaPagamentoId), parcela]),
            ).values(),
          ];
          let formasDisponiveis = listaFormasPagamento;
          let contasDisponiveis = listaContasFinanceiras;
          for (const parcelaFormaAusente of formasAusentes) {
            const formaParcela = {
              id: parcelaFormaAusente.formaPagamentoId,
              nome: parcelaFormaAusente.formaPagamentoNome,
              contaFinanceiraId: "",
            };
            if (formasPagamentoIndisponiveis) {
              formasDisponiveis = [...formasDisponiveis, formaParcela];
              continue;
            }
            try {
              const formaAtual = await formaPagamentoService.buscarPorId(
                parcelaFormaAusente.formaPagamentoId,
              );
              formasDisponiveis = [...formasDisponiveis, formaAtual];
              if (
                formaAtual.contaFinanceiraId &&
                !contasDisponiveis.some(
                  (item) =>
                    String(item.id) === String(formaAtual.contaFinanceiraId),
                )
              ) {
                contasDisponiveis = [
                  ...contasDisponiveis,
                  {
                    id: formaAtual.contaFinanceiraId,
                    nome: formaAtual.contaFinanceiraNome,
                  },
                ];
              }
            } catch (formaError) {
              console.error(
                "Erro ao carregar a forma de pagamento da conta:",
                formaError,
              );
              if (ativo) {
                setErroFormasPagamento(
                  "Não foi possível carregar a forma de pagamento atual.",
                );
                showToast({
                  type: "warning",
                  title: "Forma de pagamento indisponível",
                  message:
                    "Não foi possível carregar a forma de pagamento atual.",
                });
              }
              formasDisponiveis = [...formasDisponiveis, formaParcela];
            }
          }
          if (!ativo) return;
          setFormasPagamento(formasDisponiveis);
          setContasFinanceiras(contasDisponiveis);
          setContaCarregada(conta);
          const primeiraParcela = parcelasConta[0];
          setFormulario({
            pessoaId: conta.pessoaId,
            categoriaId: conta.categoriaId || "",
            descricao: conta.descricao || "",
            dataEmissao: conta.dataEmissao || "",
            valorTotal: centavosParaMoeda(
              Math.round(Number(conta.valorTotal) * 100),
            ),
            observacao: conta.observacao || "",
            dataPrimeiroVencimento:
              primeiraParcela?.dataVencimento || dataLocalHoje(),
            status: conta.status || "ABERTO",
            formaPagamentoId: primeiraParcela?.formaPagamentoId || "",
            contaFinanceiraId:
              formasDisponiveis.find(
                (forma) =>
                  String(forma.id) === String(primeiraParcela?.formaPagamentoId),
              )?.contaFinanceiraId || "",
            quantidadeParcelas: String(parcelasConta.length || 1),
            ativo: conta.ativo,
          });
          setParcelas(
            parcelasConta.map((parcela) => {
              ultimaChaveParcela.current += 1;
              return {
                chave: ultimaChaveParcela.current,
                dataVencimento: parcela.dataVencimento || "",
                valor: centavosParaMoeda(
                  Math.round(Number(parcela.valor) * 100),
                ),
                formaPagamentoId: parcela.formaPagamentoId || "",
                observacao: parcela.observacao || "",
              };
            }),
          );
        } else {
          setFormasPagamento(listaFormasPagamento);
        }
      } catch (loadError) {
        console.error(`Erro ao carregar formulário de ${titulo}:`, loadError);
        if (ativo) {
          setErro(`Não foi possível carregar os dados de ${titulo}.`);
          showApiErrorToast(
            showToast,
            loadError,
            `Não foi possível carregar os dados de ${titulo}.`,
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
  }, [ehPagar, id, tipo, titulo, showToast]);

  const valorTotalCentavos = moedaParaCentavos(formulario.valorTotal);
  const totalParceladoCentavos = parcelas.reduce(
    (total, parcela) => total + moedaParaCentavos(parcela.valor),
    0,
  );
  const saldoRestanteCentavos = valorTotalCentavos - totalParceladoCentavos;
  const parcelasBloqueadas = Boolean(
    contaCarregada?.parcelas?.some(
      (parcela) => parcela[chaveBaixas]?.length > 0,
    ),
  );
  const parcelasSomenteLeitura =
    parcelasBloqueadas ||
    Boolean(erroFormasPagamento) ||
    Boolean(id && formulario.status === "CANCELADO");

  const notificarErro = (message) => {
    setErro(message);
    showToast({ type: "error", title: "Verifique os dados", message });
  };

  const criarParcela = (dados) => {
    ultimaChaveParcela.current += 1;
    return {
      chave: ultimaChaveParcela.current,
      observacao: "",
      ...dados,
    };
  };

  const gerarParcelas = () => {
    setErro("");
    const quantidade = Number(formulario.quantidadeParcelas);

    if (valorTotalCentavos <= 0) {
      notificarErro("Informe o valor total antes de gerar as parcelas.");
      return;
    }
    if (!Number.isInteger(quantidade) || quantidade < 1) {
      notificarErro("Informe uma quantidade de parcelas válida.");
      return;
    }
    if (!formulario.dataPrimeiroVencimento) {
      notificarErro("Informe o vencimento da primeira parcela.");
      return;
    }
    if (formulario.dataPrimeiroVencimento < formulario.dataEmissao) {
      notificarErro(
        "O vencimento da primeira parcela não pode ser anterior à data de emissão.",
      );
      return;
    }

    const valorParcelaCentavos = Math.floor(valorTotalCentavos / quantidade);
    const parcelasComAjuste =
      valorTotalCentavos - valorParcelaCentavos * quantidade;

    setParcelas(
      Array.from({ length: quantidade }, (_, index) =>
        criarParcela({
          dataVencimento: adicionarMeses(
            formulario.dataPrimeiroVencimento,
            index,
          ),
          valor: centavosParaMoeda(
            valorParcelaCentavos +
              (index >= quantidade - parcelasComAjuste ? 1 : 0),
          ),
          formaPagamentoId: formulario.formaPagamentoId,
        }),
      ),
    );
    setParcelasAlteradas(true);
  };

  const adicionarParcela = () => {
    const ultimaParcela = parcelas[parcelas.length - 1];
    setParcelas((atuais) => [
      ...atuais,
      criarParcela({
        dataVencimento: ultimaParcela?.dataVencimento
          ? adicionarMeses(ultimaParcela.dataVencimento, 1)
          : formulario.dataPrimeiroVencimento,
        valor:
          saldoRestanteCentavos > 0
            ? centavosParaMoeda(saldoRestanteCentavos)
            : "",
        formaPagamentoId: formulario.formaPagamentoId,
      }),
    ]);
    setParcelasAlteradas(true);
  };

  const atualizarParcela = (chave, event) => {
    const { name } = event.target;
    const value =
      name === "valor"
        ? mascaraMoeda(event.target.value)
        : event.target.value;
    setParcelas((atuais) =>
      atuais.map((parcela) =>
        parcela.chave === chave ? { ...parcela, [name]: value } : parcela,
      ),
    );
    setParcelasAlteradas(true);
  };

  const removerParcela = (chave) => {
    setParcelas((atuais) => atuais.filter((parcela) => parcela.chave !== chave));
    setParcelasAlteradas(true);
  };

  const atualizarCampo = (event) => {
    const { name } = event.target;
    const value =
      name === "valorTotal"
        ? mascaraMoeda(event.target.value)
        : event.target.value;
    if (name === "valorTotal") {
      setParcelasAlteradas(true);
    }
    setFormulario((atual) => {
      if (name === "contaFinanceiraId") {
        const formaSelecionada = formasPagamento.find(
          (forma) => String(forma.id) === String(atual.formaPagamentoId),
        );
        return {
          ...atual,
          contaFinanceiraId: value,
          formaPagamentoId:
            formaSelecionada &&
            String(formaSelecionada.contaFinanceiraId) === String(value)
              ? atual.formaPagamentoId
              : "",
        };
      }

      if (name === "formaPagamentoId") {
        const formaSelecionada = formasPagamento.find(
          (forma) => String(forma.id) === String(value),
        );
        return {
          ...atual,
          formaPagamentoId: value,
          contaFinanceiraId: formaSelecionada?.contaFinanceiraId || "",
        };
      }

      return { ...atual, [name]: value };
    });
  };

  const salvarConta = async (event) => {
    event.preventDefault();
    if (!validateRequiredFields(event, showToast)) return;
    setErro("");

    if (!formulario.pessoaId) {
      notificarErro(`Selecione ${ehPagar ? "um fornecedor" : "um cliente"}.`);
      return;
    }

    setSalvando(true);
    try {
      if (!id || (parcelasAlteradas && !parcelasSomenteLeitura)) {
        if (valorTotalCentavos <= 0) {
          notificarErro("Informe o valor total.");
          return;
        }
        if (parcelas.length === 0) {
          notificarErro("Informe ao menos uma parcela.");
          return;
        }
        for (const [index, parcela] of parcelas.entries()) {
          const numeroParcela = index + 1;
          if (!parcela.dataVencimento) {
            notificarErro(`Informe o vencimento da parcela ${numeroParcela}.`);
            return;
          }
          if (parcela.dataVencimento < formulario.dataEmissao) {
            notificarErro(
              `O vencimento da parcela ${numeroParcela} não pode ser anterior à data de emissão.`,
            );
            return;
          }
          if (moedaParaCentavos(parcela.valor) <= 0) {
            notificarErro(`Informe o valor da parcela ${numeroParcela}.`);
            return;
          }
          if (!parcela.formaPagamentoId) {
            notificarErro(
              `Selecione a forma de pagamento da parcela ${numeroParcela}.`,
            );
            return;
          }
        }
        if (saldoRestanteCentavos !== 0) {
          notificarErro(
            "A soma das parcelas deve ser igual ao valor total da conta.",
          );
          return;
        }
      }

      const criarParcelas = () =>
        [...parcelas]
          .sort((a, b) => a.dataVencimento.localeCompare(b.dataVencimento))
          .map((parcela) => ({
            dataVencimento: parcela.dataVencimento,
            valor: moedaParaCentavos(parcela.valor) / 100,
            formaPagamentoId: parcela.formaPagamentoId,
            observacao: parcela.observacao.trim() || null,
          }));

      if (id) {
        const dadosAtualizacao = {
          pessoaId: formulario.pessoaId,
          categoriaId: formulario.categoriaId || null,
          removerCategoria: Boolean(
            contaCarregada.categoriaId && !formulario.categoriaId,
          ),
          descricao: formulario.descricao.trim(),
          dataEmissao: formulario.dataEmissao,
          observacao: formulario.observacao.trim(),
          ativo: formulario.ativo,
        };

        if (
          ["ABERTO", "CANCELADO"].includes(formulario.status) &&
          formulario.status !== contaCarregada.status
        ) {
          dadosAtualizacao.status = formulario.status;
        }
        if (parcelasAlteradas && !parcelasSomenteLeitura) {
          dadosAtualizacao.valorTotal = valorTotalCentavos / 100;
          dadosAtualizacao.parcelas = criarParcelas();
        }

        await contasPagarReceberService.atualizar(tipo, id, dadosAtualizacao);
      } else {
        const dados = {
          pessoaId: formulario.pessoaId,
          categoriaId: formulario.categoriaId || null,
          descricao: formulario.descricao.trim() || null,
          dataEmissao: formulario.dataEmissao,
          valorTotal: valorTotalCentavos / 100,
          observacao: formulario.observacao.trim() || null,
          ativo: true,
          parcelas: criarParcelas(),
        };
        await contasPagarReceberService.criar(tipo, dados);
      }

      navigate(basePath, {
        replace: true,
        state: {
          mensagem: id
            ? `${ehPagar ? "Conta a pagar" : "Conta a receber"} atualizada com sucesso.`
            : `${ehPagar ? "Conta a pagar" : "Conta a receber"} criada com sucesso.`,
        },
      });
    } catch (saveError) {
      console.error(`Erro ao salvar ${titulo}:`, saveError);
      const mensagemErro =
        saveError?.response?.data?.erro ||
        saveError?.response?.data?.message ||
        `Não foi possível salvar ${titulo}.`;
      setErro(mensagemErro);
      showApiErrorToast(
        showToast,
        saveError,
        `Não foi possível salvar ${titulo}.`,
      );
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) return <Loading message={`Carregando ${titulo}...`} />;

  if (erro && id && !contaCarregada) {
    return (
      <EmptyState
        title={`Erro ao carregar ${titulo}`}
        description={erro}
        fullWidth
      />
    );
  }

  const pessoasOptions = [
    {
      value: "",
      label: `Selecione ${ehPagar ? "um fornecedor" : "um cliente"}`,
    },
    ...pessoas.map((pessoa) => ({ value: pessoa.id, label: pessoa.nome })),
  ];
  if (
    contaCarregada?.pessoaId &&
    !pessoas.some((pessoa) => pessoa.id === contaCarregada.pessoaId)
  ) {
    pessoasOptions.push({
      value: contaCarregada.pessoaId,
      label: contaCarregada.pessoaNome,
    });
  }
  const categoriasOptions = [
    { value: "", label: "Sem categoria" },
    ...categorias.map((categoria) => ({
      value: categoria.id,
      label: categoria.nome,
    })),
  ];
  if (
    contaCarregada?.categoriaId &&
    !categorias.some((categoria) => categoria.id === contaCarregada.categoriaId)
  ) {
    categoriasOptions.push({
      value: contaCarregada.categoriaId,
      label: contaCarregada.categoriaNome,
    });
  }
  const formasPagamentoDaConta = formasPagamento.filter(
    (forma) =>
      String(forma.contaFinanceiraId) === String(formulario.contaFinanceiraId),
  );
  const formasPagamentoOptions = [
    { value: "", label: "Selecione uma forma de pagamento" },
    ...formasPagamentoDaConta.map((forma) => ({
      value: forma.id,
      label: forma.nome,
    })),
  ];
  const contasFinanceirasOptions = [
    { value: "", label: "Selecione uma conta financeira" },
    ...contasFinanceiras.map((conta) => ({
      value: conta.id,
      label: conta.nome,
    })),
  ];
  const formasPagamentoParcelaOptions = [
    { value: "", label: "Selecione" },
    ...formasPagamento.map((forma) => ({
      value: forma.id,
      label: forma.contaFinanceiraNome
        ? `${forma.nome} (${forma.contaFinanceiraNome})`
        : forma.nome,
    })),
  ];
  const situacaoSaldo =
    saldoRestanteCentavos < 0
      ? "negativo"
      : saldoRestanteCentavos === 0
        ? "zerado"
        : "positivo";
  const statusOptions = [
    { value: "ABERTO", label: "Em aberto" },
    {
      value: "PARCIALMENTE_PAGO",
      label: "Parcialmente pago",
      disabled: true,
    },
    { value: "PAGO", label: "Pago", disabled: true },
    {
      value: "CANCELADO",
      label: "Cancelado",
      disabled:
        !id ||
        (parcelasBloqueadas && formulario.status !== "CANCELADO"),
    },
  ].map((option) => ({
    ...option,
    disabled:
      option.disabled ||
      (option.value === "ABERTO" &&
        id &&
        !["ABERTO", "CANCELADO"].includes(contaCarregada?.status)),
  }));

  return (
    <div className="cadastros-page">
      <Card className="cadastros-form-page">
        <div className="cadastros-form-page__heading">
          <div>
            <h2>{id ? `Editar ${titulo}` : `Nova ${titulo}`}</h2>
            <p>
              {id
                ? "Atualize os dados do compromisso financeiro."
                : "Preencha os dados do compromisso financeiro."}
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate(basePath)}
            className="button__return"
            icon={<HugeiconsIcon icon={Undo03Icon} size={18} />}
          ></Button>
        </div>
        <form className="cadastros-form" onSubmit={salvarConta} noValidate>
          <Select
            id={`${tipo}-pessoa`}
            name="pessoaId"
            label={
              <span>
                {ehPagar ? "FORNECEDOR / CREDOR" : "CLIENTE / DEVEDOR"}
                <span className="form__campo-obrigatorio">*</span>
              </span>
            }
            options={pessoasOptions}
            value={formulario.pessoaId}
            onChange={atualizarCampo}
            required
          />
          <Select
            id={`${tipo}-categoria`}
            name="categoriaId"
            label="CATEGORIA"
            options={categoriasOptions}
            value={formulario.categoriaId}
            onChange={atualizarCampo}
          />
          <Input
            id={`${tipo}-descricao`}
            name="descricao"
            label="DESCRIÇÃO"
            value={formulario.descricao}
            onChange={atualizarCampo}
            maxLength={255}
          />
          <Input
            id={`${tipo}-data-emissao`}
            name="dataEmissao"
            label="DATA DE EMISSÃO"
            type="date"
            value={formulario.dataEmissao}
            onChange={atualizarCampo}
            required
          />
          <div className="conta-parcelamento-form__grid">
            {erroFormasPagamento && (
              <p className="conta-receber-form__warning" role="status">
                {erroFormasPagamento}
              </p>
            )}
            <Input
              id={`${tipo}-valor-total`}
              name="valorTotal"
              label={
                <span>
                  VALOR TOTAL
                  <span className="form__campo-obrigatorio">*</span>
                </span>
              }
              inputMode="numeric"
              prefix="R$"
              placeholder="0,00"
              value={formulario.valorTotal}
              onChange={atualizarCampo}
              disabled={parcelasSomenteLeitura}
              required={!parcelasSomenteLeitura}
            />
            <Select
              id={`${tipo}-status`}
              name="status"
              label="STATUS"
              options={statusOptions}
              value={formulario.status}
              onChange={atualizarCampo}
            />
            <Select
              id={`${tipo}-conta-financeira`}
              name="contaFinanceiraId"
              label="CONTA FINANCEIRA PADRÃO"
              options={contasFinanceirasOptions}
              value={formulario.contaFinanceiraId}
              onChange={atualizarCampo}
              disabled={parcelasSomenteLeitura}
            />
            <Select
              id={`${tipo}-forma-pagamento`}
              name="formaPagamentoId"
              label="FORMA DE PAGAMENTO PADRÃO"
              options={formasPagamentoOptions}
              value={formulario.formaPagamentoId}
              onChange={atualizarCampo}
              disabled={
                parcelasSomenteLeitura ||
                Boolean(erroFormasPagamento) ||
                !formulario.contaFinanceiraId
              }
            />
            <Input
              id={`${tipo}-data-primeiro-vencimento`}
              name="dataPrimeiroVencimento"
              label="VENCIMENTO DA PRIMEIRA PARCELA"
              type="date"
              value={formulario.dataPrimeiroVencimento}
              onChange={atualizarCampo}
              disabled={parcelasSomenteLeitura}
            />
            <div className="conta-parcelamento-form__gerar">
              <Input
                id={`${tipo}-quantidade-parcelas`}
                name="quantidadeParcelas"
                label="QTE. PARCELAS"
                type="number"
                min="1"
                step="1"
                value={formulario.quantidadeParcelas}
                onChange={atualizarCampo}
                disabled={parcelasSomenteLeitura}
              />
              <Button
                variant="outline"
                onClick={gerarParcelas}
                disabled={parcelasSomenteLeitura}
              >
                Gerar parcelas
              </Button>
            </div>
          </div>
          <section className="conta-parcelas">
            <div className="conta-parcelas__cabecalho">
              <span className="conta-parcelas__titulo">
                PARCELAS
                <span className="form__campo-obrigatorio">*</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={adicionarParcela}
                disabled={parcelasSomenteLeitura}
                icon={<HugeiconsIcon icon={PlusIcon} size={16} />}
              >
                Adicionar parcela
              </Button>
            </div>
            {parcelas.length === 0 ? (
              <p className="conta-receber-form__hint">
                Nenhuma parcela informada. Gere as parcelas a partir do valor
                total ou adicione manualmente.
              </p>
            ) : (
              <div className="conta-parcelas__lista">
                <div className="conta-parcelas__linha conta-parcelas__linha--titulo">
                  <span>Nº</span>
                  <span>
                    VENCIMENTO
                    <span className="form__campo-obrigatorio">*</span>
                  </span>
                  <span>
                    VALOR
                    <span className="form__campo-obrigatorio">*</span>
                  </span>
                  <span>
                    FORMA DE PAGAMENTO
                    <span className="form__campo-obrigatorio">*</span>
                  </span>
                  <span />
                </div>
                {parcelas.map((parcela, index) => (
                  <div className="conta-parcelas__linha" key={parcela.chave}>
                    <span className="conta-parcelas__numero">
                      {index + 1}ª
                    </span>
                    <Input
                      id={`${tipo}-parcela-vencimento-${parcela.chave}`}
                      name="dataVencimento"
                      type="date"
                      className="conta-parcelas__vencimento"
                      aria-label={`Vencimento da parcela ${index + 1}`}
                      value={parcela.dataVencimento}
                      onChange={(event) =>
                        atualizarParcela(parcela.chave, event)
                      }
                      disabled={parcelasSomenteLeitura}
                    />
                    <Input
                      id={`${tipo}-parcela-valor-${parcela.chave}`}
                      name="valor"
                      className="conta-parcelas__valor"
                      aria-label={`Valor da parcela ${index + 1}`}
                      inputMode="numeric"
                      prefix="R$"
                      placeholder="0,00"
                      value={parcela.valor}
                      onChange={(event) =>
                        atualizarParcela(parcela.chave, event)
                      }
                      disabled={parcelasSomenteLeitura}
                    />
                    <Select
                      id={`${tipo}-parcela-forma-${parcela.chave}`}
                      name="formaPagamentoId"
                      className="conta-parcelas__forma"
                      aria-label={`Forma de pagamento da parcela ${index + 1}`}
                      options={formasPagamentoParcelaOptions}
                      value={parcela.formaPagamentoId}
                      onChange={(event) =>
                        atualizarParcela(parcela.chave, event)
                      }
                      disabled={parcelasSomenteLeitura}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="conta-parcelas__remover"
                      title="Remover parcela"
                      aria-label={`Remover parcela ${index + 1}`}
                      onClick={() => removerParcela(parcela.chave)}
                      disabled={parcelasSomenteLeitura}
                      icon={<HugeiconsIcon icon={Delete02Icon} size={18} />}
                    />
                  </div>
                ))}
              </div>
            )}
            <div className="conta-parcelas__resumo">
              <div>
                <span>Valor total</span>
                <strong>R$ {centavosParaMoeda(valorTotalCentavos)}</strong>
              </div>
              <div>
                <span>Total parcelado</span>
                <strong>R$ {centavosParaMoeda(totalParceladoCentavos)}</strong>
              </div>
              <div>
                <span>Saldo restante</span>
                <strong
                  className={`conta-parcelas__saldo conta-parcelas__saldo--${situacaoSaldo}`}
                >
                  R$ {centavosParaMoeda(saldoRestanteCentavos)}
                </strong>
              </div>
              <div>
                <span>Parcelas</span>
                <strong>{parcelas.length}</strong>
              </div>
            </div>
            <p className="conta-receber-form__hint">
              Gere as parcelas a partir do valor total e ajuste vencimentos,
              valores e formas de pagamento, ou adicione cada parcela
              manualmente. A soma das parcelas deve ser igual ao valor total.
            </p>
            {parcelasBloqueadas && (
              <p className="conta-receber-form__hint">
                Os dados das parcelas não podem ser alterados porque esta conta
                já possui {chaveBaixas}.
              </p>
            )}
          </section>
          <label className="cadastros-field" htmlFor={`${tipo}-observacao`}>
            <span className="cadastros-field__label">OBSERVAÇÃO</span>
            <textarea
              id={`${tipo}-observacao`}
              name="observacao"
              value={formulario.observacao}
              onChange={atualizarCampo}
              maxLength={255}
              rows={2}
            />
          </label>
          {id && (
            <div className="cadastros-situacao">
              <span>SITUAÇÃO</span>
              <div className="cadastros-situacao__controle">
                <ToggleSwitch
                  checked={formulario.ativo}
                  onChange={(ativo) =>
                    setFormulario((atual) => ({ ...atual, ativo }))
                  }
                  title={
                    formulario.ativo ? `Inativar ${titulo}` : `Ativar ${titulo}`
                  }
                />
                <span className="cadastros-situacao__status">
                  {formulario.ativo ? "Ativa" : "Inativa"}
                </span>
              </div>
            </div>
          )}
          <div className="cadastros-form__actions">
            <Button
              variant="outline"
              onClick={() => navigate(basePath)}
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

export default ContaPagarReceberForm;
