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
import categoriaService from "../../services/categoriaService";
import contasPagarReceberService from "../../services/contasPagarReceberService";
import pessoaService from "../../services/pessoaService";
import "../Cadastros/Cadastros.css";

function dataLocalHoje() {
  const hoje = new Date();
  return [
    hoje.getFullYear(),
    String(hoje.getMonth() + 1).padStart(2, "0"),
    String(hoje.getDate()).padStart(2, "0"),
  ].join("-");
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
    ativo: true,
  };
}

function ContaPagarReceberForm({ tipo }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const ehPagar = tipo === "pagar";
  const titulo = ehPagar ? "conta a pagar" : "conta a receber";
  const basePath = `/cadastros/contas-${tipo}`;
  const [formulario, setFormulario] = useState(criarFormularioInicial);
  const [pessoas, setPessoas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [contaCarregada, setContaCarregada] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      try {
        const [listaPessoas, listaCategorias, conta] = await Promise.all([
          pessoaService.listarPessoasAtivas(),
          categoriaService.listarAtivas(),
          id ? contasPagarReceberService.buscarPorId(tipo, id) : Promise.resolve(null),
        ]);
        if (!ativo) return;
        setPessoas(listaPessoas);
        setCategorias(listaCategorias);
        if (conta) {
          setContaCarregada(conta);
          setFormulario({
            pessoaId: conta.pessoaId,
            categoriaId: conta.categoriaId || "",
            descricao: conta.descricao || "",
            dataEmissao: conta.dataEmissao || "",
            valorTotal: String(conta.valorTotal ?? ""),
            observacao: conta.observacao || "",
            dataVencimento: conta.parcelas?.[0]?.dataVencimento || "",
            ativo: conta.ativo,
          });
        }
      } catch (loadError) {
        console.error(`Erro ao carregar formulário de ${titulo}:`, loadError);
        if (ativo) {
          setErro(`Não foi possível carregar os dados de ${titulo}.`);
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarDados();
    return () => {
      ativo = false;
    };
  }, [id, tipo, titulo]);

  const atualizarCampo = (event) => {
    const { name, value } = event.target;
    setFormulario((atual) => ({ ...atual, [name]: value }));
  };

  const salvarConta = async (event) => {
    event.preventDefault();
    setErro("");

    if (!formulario.pessoaId) {
      setErro(`Selecione ${ehPagar ? "um fornecedor" : "um cliente"}.`);
      return;
    }

    setSalvando(true);
    try {
      if (id) {
        await contasPagarReceberService.atualizar(tipo, id, {
          pessoaId: formulario.pessoaId,
          categoriaId: formulario.categoriaId || null,
          descricao: formulario.descricao.trim(),
          dataEmissao: formulario.dataEmissao,
          observacao: formulario.observacao.trim(),
          ativo: formulario.ativo,
        });
      } else {
        const valorTotal = Number(formulario.valorTotal);
        if (!Number.isFinite(valorTotal) || valorTotal <= 0) {
          setErro("Informe um valor maior que zero.");
          setSalvando(false);
          return;
        }
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
      setErro(
        saveError?.response?.data?.erro ||
          saveError?.response?.data?.message ||
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
        <form className="cadastros-form" onSubmit={salvarConta}>
          <Select
            id={`${tipo}-pessoa`}
            name="pessoaId"
            label={ehPagar ? "Fornecedor / credor" : "Cliente / devedor"}
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
          {!id && (
            <>
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
            </>
          )}
          {id && (
            <p className="cadastros-form-page__note">
              Valor total:{" "}
              {Number(contaCarregada.valorTotal).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
              {!ehPagar &&
                contaCarregada.parcelas?.length > 0 &&
                ` · ${contaCarregada.parcelas.length} parcela(s)`}
            </p>
          )}
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
          {erro && (
            <p className="cadastros-form__error" role="alert">
              {erro}
            </p>
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
