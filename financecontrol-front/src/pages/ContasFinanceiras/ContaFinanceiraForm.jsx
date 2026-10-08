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
import { showApiErrorToast } from "../../utils/toastErrors";
import validateRequiredFields from "../../utils/validateRequiredFields";
import "../Cadastros/Cadastros.css";

const FORM_INICIAL = { nome: "", tipo: "CORRENTE", ativo: true };
const TIPOS_CONTA = [
  { value: "CORRENTE", label: "Conta corrente" },
  { value: "POUPANCA", label: "Poupança" },
  { value: "CAIXA", label: "Caixa" },
  { value: "CARTEIRA", label: "Carteira" },
];

function ContaFinanceiraForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();
  const [formulario, setFormulario] = useState(FORM_INICIAL);
  const [carregando, setCarregando] = useState(Boolean(id));
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!id) return undefined;
    let ativo = true;

    contaFinanceiraService
      .buscarPorId(id)
      .then((conta) => {
        if (!ativo) return;
        setFormulario({
          nome: conta.nome || "",
          tipo: conta.tipo || "CORRENTE",
          ativo: conta.ativo,
        });
      })
      .catch((loadError) => {
        console.error("Erro ao carregar conta financeira:", loadError);
        if (ativo) {
          setErro("Não foi possível carregar a conta financeira.");
          showApiErrorToast(
            showToast,
            loadError,
            "Não foi possível carregar a conta financeira.",
          );
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [id, showToast]);

  const atualizarCampo = (event) => {
    const { name, value, checked, type } = event.target;
    setFormulario((atual) => ({
      ...atual,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const salvarConta = async (event) => {
    event.preventDefault();
    if (!validateRequiredFields(event, showToast)) return;
    setErro("");
    setSalvando(true);

    try {
      const dados = {
        nome: formulario.nome.trim(),
        tipo: formulario.tipo,
        ativo: formulario.ativo,
      };
      if (id) {
        await contaFinanceiraService.atualizar(id, dados);
      } else {
        await contaFinanceiraService.criar(dados);
      }
      navigate("/contas/contas-financeiras", {
        replace: true,
        state: {
          mensagem: id
            ? "Conta financeira atualizada com sucesso."
            : "Conta financeira criada com sucesso.",
        },
      });
    } catch (saveError) {
      console.error("Erro ao salvar conta financeira:", saveError);
      const mensagemErro =
        saveError?.response?.data?.erro ||
        saveError?.response?.data?.message ||
        "Não foi possível salvar a conta financeira.";
      setErro(mensagemErro);
      showApiErrorToast(
        showToast,
        saveError,
        "Não foi possível salvar a conta financeira.",
      );
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) return <Loading message="Carregando conta financeira..." />;

  if (erro && id && !formulario.nome) {
    return (
      <EmptyState
        title="Erro ao carregar conta financeira"
        description={erro}
        fullWidth
      />
    );
  }

  return (
    <div className="cadastros-page">
      <Card className="cadastros-form-page">
        <div className="cadastros-form-page__heading">
          <div>
            <h2>{id ? "Editar Conta Financeira" : "Nova Conta Financeira"}</h2>
            <p>{id ? "Altere os dados da conta conforme necessário." : "Preencha os campos abaixo para cadastrar uma nova conta."}</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate("/contas/contas-financeiras")}
            className="button__return"
            icon={<HugeiconsIcon icon={Undo03Icon} size={18} />}
          >
          </Button>
        </div>
        <form className="cadastros-form" onSubmit={salvarConta} noValidate>
          <Input
            id="conta-financeira-nome"
            name="nome"
            label="NOME"
            value={formulario.nome}
            onChange={atualizarCampo}
            maxLength={150}
            required
            autoFocus
          />
          <Select
            id="conta-financeira-tipo"
            name="tipo"
            label="TIPO DE CONTA"
            options={TIPOS_CONTA}
            value={formulario.tipo}
            onChange={atualizarCampo}
            required
          />
          {id && (
            <div className="cadastros-situacao">
              <span>SITUAÇÃO</span>
              <div className="cadastros-situacao__controle">
                <ToggleSwitch
                  checked={formulario.ativo}
                  onChange={(ativo) =>
                    setFormulario((atual) => ({ ...atual, ativo }))
                  }
                  title={formulario.ativo ? "Inativar conta financeira" : "Ativar conta financeira"}
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
              onClick={() => navigate("/contas/contas-financeiras")}
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

export default ContaFinanceiraForm;
