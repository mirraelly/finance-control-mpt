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
import contaFinanceiraService from "../../services/contaFinanceiraService";
import formaPagamentoService from "../../services/formaPagamentoService";
import { showApiErrorToast } from "../../utils/toastErrors";
import validateRequiredFields from "../../utils/validateRequiredFields";
import "../Cadastros/Cadastros.css";

function FormaPagamentoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();
  const [formulario, setFormulario] = useState({
    nome: "",
    contaFinanceiraId: "",
    ativo: true,
  });
  const [contasFinanceiras, setContasFinanceiras] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      try {
        const [contas, formaPagamento] = await Promise.all([
          contaFinanceiraService.listarAtivas(),
          id ? formaPagamentoService.buscarPorId(id) : Promise.resolve(null),
        ]);
        if (!ativo) return;

        setContasFinanceiras(contas);
        if (formaPagamento) {
          setFormulario({
            nome: formaPagamento.nome || "",
            contaFinanceiraId: formaPagamento.contaFinanceiraId,
            ativo: formaPagamento.ativo,
          });
          if (
            formaPagamento.contaFinanceiraId &&
            !contas.some(
              (conta) => conta.id === formaPagamento.contaFinanceiraId,
            )
          ) {
            setContasFinanceiras([
              ...contas,
              {
                id: formaPagamento.contaFinanceiraId,
                nome: formaPagamento.contaFinanceiraNome,
              },
            ]);
          }
        }
      } catch (loadError) {
        console.error("Erro ao carregar forma de pagamento:", loadError);
        if (ativo) {
          setErro("Não foi possível carregar os dados da forma de pagamento.");
          showApiErrorToast(
            showToast,
            loadError,
            "Não foi possível carregar os dados da forma de pagamento.",
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
  }, [id, showToast]);

  const atualizarCampo = (event) => {
    const { name, value } = event.target;
    setFormulario((atual) => ({ ...atual, [name]: value }));
  };

  const salvarFormaPagamento = async (event) => {
    event.preventDefault();
    if (!validateRequiredFields(event, showToast)) return;
    setErro("");
    setSalvando(true);

    try {
      const dados = {
        nome: formulario.nome.trim(),
        contaFinanceiraId: formulario.contaFinanceiraId,
        ativo: formulario.ativo,
      };
      if (id) {
        await formaPagamentoService.atualizar(id, dados);
      } else {
        await formaPagamentoService.criar(dados);
      }
      navigate("/cadastros/formas-pagamento", {
        replace: true,
        state: {
          mensagem: id
            ? "Forma de pagamento atualizada com sucesso."
            : "Forma de pagamento criada com sucesso.",
        },
      });
    } catch (saveError) {
      console.error("Erro ao salvar forma de pagamento:", saveError);
      const mensagemErro =
        saveError?.response?.data?.erro ||
        saveError?.response?.data?.message ||
        "Não foi possível salvar a forma de pagamento.";
      setErro(mensagemErro);
      showApiErrorToast(
        showToast,
        saveError,
        "Não foi possível salvar a forma de pagamento.",
      );
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) return <Loading message="Carregando forma de pagamento..." />;

  if (erro && id && !formulario.nome) {
    return (
      <EmptyState
        title="Erro ao carregar forma de pagamento"
        description={erro}
        fullWidth
      />
    );
  }

  const contasOptions = [
    { value: "", label: "Selecione uma conta financeira" },
    ...contasFinanceiras.map((conta) => ({
      value: conta.id,
      label: conta.nome,
    })),
  ];

  return (
    <div className="cadastros-page">
      <Card className="cadastros-form-page">
        <div className="cadastros-form-page__heading">
          <div>
            <h2>{id ? "Editar forma de pagamento" : "Nova forma de pagamento"}</h2>
            <p>Preencha os dados da forma de pagamento.</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate("/cadastros/formas-pagamento")}
            className="button__return"
            icon={<HugeiconsIcon icon={Undo03Icon} size={18} />}
            aria-label="Voltar para formas de pagamento"
          />
        </div>
        <form className="cadastros-form" onSubmit={salvarFormaPagamento} noValidate>
          <Input
            id="forma-pagamento-nome"
            name="nome"
            label="NOME"
            value={formulario.nome}
            onChange={atualizarCampo}
            maxLength={150}
            required
            autoFocus
          />
          <Select
            id="forma-pagamento-conta-financeira"
            name="contaFinanceiraId"
            label="CONTA FINANCEIRA"
            options={contasOptions}
            value={formulario.contaFinanceiraId}
            onChange={atualizarCampo}
            required
          />
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
                    ? "Inativar forma de pagamento"
                    : "Ativar forma de pagamento"
                }
              />
              <span className="cadastros-situacao__status">
                {formulario.ativo ? "Ativa" : "Inativa"}
              </span>
            </div>
          </div>
          <div className="cadastros-form__actions">
            <Button
              variant="outline"
              onClick={() => navigate("/cadastros/formas-pagamento")}
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

export default FormaPagamentoForm;
