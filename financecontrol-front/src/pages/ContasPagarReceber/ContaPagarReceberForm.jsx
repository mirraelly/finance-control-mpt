import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HugeiconsIcon, Undo03Icon } from "../../assets/icons";
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

function paraCentavos(valor) {
  const numero = Number(valor);
  return Number.isFinite(numero) ? Math.round(numero * 100) : 0;
}

function paraValorInput(centavos) {
  return (centavos / 100).toFixed(2);
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
    dataVencimento: dataLocalHoje(),
    status: "ABERTO",
    formaPagamentoId: "",
    contaFinanceiraId: "",
    quantidadeParcelas: "1",
    valorParcela: "",
    ativo: true,
  };
}

function ContaPagarReceberForm({ tipo }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();
  const ehPagar = tipo === "pagar";
  const titulo = ehPagar ? "conta a pagar" : "conta a receber";
  const basePath = `/contas/contas-${tipo}`;
  const [formulario, setFormulario] = useState(criarFormularioInicial);
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
          const formaPagamentoAtualId = conta.parcelas?.[0]?.formaPagamentoId;
          let formasDisponiveis = listaFormasPagamento;
          let contasDisponiveis = listaContasFinanceiras;
          if (
            formaPagamentoAtualId &&
            !listaFormasPagamento.some(
              (forma) => String(forma.id) === String(formaPagamentoAtualId),
            )
          ) {
            if (!formasPagamentoIndisponiveis) {
              try {
                const formaAtual =
                  await formaPagamentoService.buscarPorId(formaPagamentoAtualId);
                formasDisponiveis = [...listaFormasPagamento, formaAtual];
                if (
                  formaAtual.contaFinanceiraId &&
                  !listaContasFinanceiras.some(
                    (item) =>
                      String(item.id) === String(formaAtual.contaFinanceiraId),
                  )
                ) {
                  contasDisponiveis = [
                    ...listaContasFinanceiras,
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
                formasDisponiveis = [
                  ...listaFormasPagamento,
                  {
                    id: formaPagamentoAtualId,
                    nome: conta.parcelas[0].formaPagamentoNome,
                    contaFinanceiraId: "",
                  },
                ];
              }
            } else {
              formasDisponiveis = [
                {
                  id: formaPagamentoAtualId,
                  nome: conta.parcelas[0].formaPagamentoNome,
                  contaFinanceiraId: "",
                },
              ];
            }
          }
          if (!ativo) return;
          setFormasPagamento(formasDisponiveis);
          setContasFinanceiras(contasDisponiveis);
          setContaCarregada(conta);
          const primeiraParcela = conta.parcelas?.[0];
          const quantidadeParcelas = conta.parcelas?.length || 1;
          const valorParcela =
            quantidadeParcelas > 0
              ? Math.floor(paraCentavos(conta.valorTotal) / quantidadeParcelas)
              : paraCentavos(conta.valorTotal);
          setFormulario({
            pessoaId: conta.pessoaId,
            categoriaId: conta.categoriaId || "",
            descricao: conta.descricao || "",
            dataEmissao: conta.dataEmissao || "",
            valorTotal: String(conta.valorTotal ?? ""),
            observacao: conta.observacao || "",
            dataVencimento: primeiraParcela?.dataVencimento || dataLocalHoje(),
            status: conta.status || "ABERTO",
            formaPagamentoId: primeiraParcela?.formaPagamentoId || "",
            contaFinanceiraId:
              formasDisponiveis.find(
                (forma) =>
                  String(forma.id) === String(primeiraParcela?.formaPagamentoId),
              )?.contaFinanceiraId || "",
            quantidadeParcelas: String(quantidadeParcelas),
            valorParcela: paraValorInput(valorParcela),
            ativo: conta.ativo,
          });
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

  const atualizarCampo = (event) => {
    const { name, value } = event.target;
    if (
      !ehPagar &&
      [
        "valorTotal",
        "formaPagamentoId",
        "contaFinanceiraId",
        "dataVencimento",
        "quantidadeParcelas",
        "valorParcela",
      ].includes(name)
    ) {
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

      if (name === "valorTotal") {
        const centavos = paraCentavos(value);
        const quantidade = Math.max(1, Number(atual.quantidadeParcelas) || 1);
        return {
          ...atual,
          valorTotal: value,
          valorParcela: centavos
            ? paraValorInput(Math.floor(centavos / quantidade))
            : "",
        };
      }

      if (name === "quantidadeParcelas") {
        const quantidade = Math.max(1, Number(value) || 1);
        const centavos = paraCentavos(atual.valorTotal);
        return {
          ...atual,
          quantidadeParcelas: value,
          valorParcela: centavos
            ? paraValorInput(Math.floor(centavos / quantidade))
            : "",
        };
      }

      if (name === "valorParcela") {
        const quantidade = Math.max(1, Number(atual.quantidadeParcelas) || 1);
        const centavos = paraCentavos(value);
        return {
          ...atual,
          valorParcela: value,
          valorTotal: centavos
            ? paraValorInput(centavos * quantidade)
            : "",
        };
      }

      return { ...atual, [name]: value };
    });
  };

  const salvarConta = async (event) => {
    event.preventDefault();
    if (!validateRequiredFields(event, showToast)) return;
    setErro("");
    const notificarErro = (message) => {
      setErro(message);
      showToast({ type: "error", title: "Verifique os dados", message });
    };

    if (!formulario.pessoaId) {
      notificarErro(`Selecione ${ehPagar ? "um fornecedor" : "um cliente"}.`);
      return;
    }

    setSalvando(true);
    try {
      if (ehPagar && paraCentavos(formulario.valorTotal) <= 0) {
        notificarErro("Informe um valor total maior que zero.");
        return;
      }
      if (!ehPagar && (!id || parcelasAlteradas)) {
        const quantidadeParcelas = Number(formulario.quantidadeParcelas);
        const valorTotalCentavos = paraCentavos(formulario.valorTotal);
        const valorParcelaCentavos = paraCentavos(formulario.valorParcela);

        if (!Number.isInteger(quantidadeParcelas) || quantidadeParcelas < 1) {
          notificarErro("Informe uma quantidade de parcelas válida.");
          return;
        }
        if (valorTotalCentavos <= 0 || valorParcelaCentavos <= 0) {
          notificarErro("Informe o valor total e o valor da parcela.");
          return;
        }
        if (
          valorParcelaCentavos * quantidadeParcelas > valorTotalCentavos ||
          valorTotalCentavos - valorParcelaCentavos * quantidadeParcelas >=
            quantidadeParcelas
        ) {
          notificarErro(
            "O valor total deve corresponder às parcelas; o ajuste de arredondamento não pode exceder R$ 0,01 por parcela.",
          );
          return;
        }
        if (!formulario.dataVencimento) {
          notificarErro("Informe o vencimento da primeira parcela.");
          return;
        }
        if (formulario.dataVencimento < formulario.dataEmissao) {
          notificarErro(
            "O vencimento da primeira parcela não pode ser anterior à data de emissão.",
          );
          return;
        }
        if (!formulario.contaFinanceiraId || !formulario.formaPagamentoId) {
          notificarErro("Selecione a conta financeira e a forma de pagamento.");
          return;
        }
      }
      if (
        ehPagar &&
        !erroFormasPagamento &&
        (!formulario.contaFinanceiraId || !formulario.formaPagamentoId)
      ) {
        notificarErro("Selecione a conta financeira e a forma de pagamento.");
        return;
      }

      const criarParcelasReceber = () => {
        const quantidadeParcelas = Number(formulario.quantidadeParcelas);
        const valorTotalCentavos = paraCentavos(formulario.valorTotal);
        const valorParcelaCentavos = paraCentavos(formulario.valorParcela);
        const parcelasComAjuste =
          valorTotalCentavos - valorParcelaCentavos * quantidadeParcelas;

        return Array.from({ length: quantidadeParcelas }, (_, index) => ({
          dataVencimento: adicionarMeses(formulario.dataVencimento, index),
          valor: paraValorInput(
            valorParcelaCentavos +
              (index >= quantidadeParcelas - parcelasComAjuste ? 1 : 0),
          ),
          formaPagamentoId: formulario.formaPagamentoId,
          observacao: null,
        }));
      };

      if (id) {
        const dadosAtualizacao = {
          pessoaId: formulario.pessoaId,
          categoriaId: formulario.categoriaId || null,
          descricao: formulario.descricao.trim(),
          dataEmissao: formulario.dataEmissao,
          observacao: formulario.observacao.trim(),
          ativo: formulario.ativo,
        };

        if (!ehPagar) {
          if (["ABERTO", "CANCELADO"].includes(formulario.status)) {
            dadosAtualizacao.status = formulario.status;
          }
          const parcelasBloqueadas = contaCarregada.parcelas?.some(
            (parcela) => parcela.recebimentos?.length > 0,
          );
          if (
            !parcelasBloqueadas &&
            parcelasAlteradas &&
            formulario.status !== "CANCELADO"
          ) {
            dadosAtualizacao.valorTotal = Number(formulario.valorTotal);
            dadosAtualizacao.parcelas = criarParcelasReceber();
          }
        } else {
          dadosAtualizacao.valorTotal = Number(formulario.valorTotal);
          dadosAtualizacao.status = formulario.status;
        }

        await contasPagarReceberService.atualizar(tipo, id, dadosAtualizacao);
      } else {
        const valorTotal = Number(formulario.valorTotal);
        if (!Number.isFinite(valorTotal) || valorTotal <= 0) {
          notificarErro("Informe um valor maior que zero.");
          setSalvando(false);
          return;
        }
        const dados = {
          pessoaId: formulario.pessoaId,
          categoriaId: formulario.categoriaId || null,
          descricao: formulario.descricao.trim() || null,
          dataEmissao: formulario.dataEmissao,
          valorTotal,
          ...(ehPagar ? { status: formulario.status } : {}),
          observacao: formulario.observacao.trim() || null,
          ativo: true,
        };
        if (!ehPagar) {
          dados.parcelas = criarParcelasReceber();
        }
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
  const parcelasBloqueadas = Boolean(
    contaCarregada?.parcelas?.some(
      (parcela) => parcela.recebimentos?.length > 0,
    ),
  );
  const parcelasSomenteLeitura =
    !ehPagar &&
    (parcelasBloqueadas ||
      Boolean(erroFormasPagamento) ||
      (id && formulario.status === "CANCELADO"));
  const statusReceberOptions = [
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
  const statusOptions = ehPagar
    ? [
        { value: "ABERTO", label: "Em aberto" },
        { value: "PARCIALMENTE_PAGO", label: "Parcialmente pago" },
        { value: "PAGO", label: "Pago" },
        { value: "CANCELADO", label: "Cancelado" },
      ]
    : statusReceberOptions;

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
          >
          </Button>
        </div>
        <form className="cadastros-form" onSubmit={salvarConta} noValidate>
          <Select
            id={`${tipo}-pessoa`}
            name="pessoaId"
            label={ehPagar ? "FORNECEDOR / CREDOR" : "CLIENTE / DEVEDOR"}
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
              label="VALOR TOTAL"
              type="number"
              min="0.01"
              step="0.01"
              value={formulario.valorTotal}
              onChange={atualizarCampo}
              disabled={parcelasSomenteLeitura}
              required
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
              label="CONTA FINANCEIRA"
              options={contasFinanceirasOptions}
              value={formulario.contaFinanceiraId}
              onChange={atualizarCampo}
              disabled={parcelasSomenteLeitura}
              required
            />
            <Select
              id={`${tipo}-forma-pagamento`}
              name="formaPagamentoId"
              label="FORMA DE PAGAMENTO"
              options={formasPagamentoOptions}
              value={formulario.formaPagamentoId}
              onChange={atualizarCampo}
              disabled={
                parcelasSomenteLeitura ||
                Boolean(erroFormasPagamento) ||
                !formulario.contaFinanceiraId
              }
              required
            />
            <Input
              id={`${tipo}-data-vencimento`}
              name="dataVencimento"
              label="VENCIMENTO DA PRIMEIRA PARCELA"
              type="date"
              value={formulario.dataVencimento}
              onChange={atualizarCampo}
              disabled={parcelasSomenteLeitura}
              required
            />
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
              required
            />
            <Input
              id={`${tipo}-valor-parcela`}
              name="valorParcela"
              label="VALOR DA PARCELA*"
              type="number"
              min="0.01"
              step="0.01"
              value={formulario.valorParcela}
              onChange={atualizarCampo}
              disabled={parcelasSomenteLeitura}
              required
            />
            {ehPagar ? (
              <p className="conta-receber-form__hint">
                Vencimento, parcelamento, conta financeira e forma de pagamento
                são exibidos no formulário, mas ainda não são persistidos pelo
                serviço atual de Contas a Pagar.
              </p>
            ) : (
              <p className="conta-receber-form__hint">
                As parcelas vencem mensalmente a partir da data informada. Se
                necessário, algumas parcelas podem ajustar até R$ 0,01 para
                fechar o valor total.
              </p>
            )}
            {!ehPagar && parcelasBloqueadas && (
              <p className="conta-receber-form__hint">
                Os dados das parcelas não podem ser alterados porque esta conta
                já possui recebimentos.
              </p>
            )}
          </div>
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
                    formulario.ativo
                      ? `Inativar ${titulo}`
                      : `Ativar ${titulo}`
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
