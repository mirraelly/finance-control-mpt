import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HugeiconsIcon, Undo03Icon } from "../../assets/icons";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import Input from "../../components/common/Input";
import Loading from "../../components/common/Loading";
import ToggleSwitch from "../../components/common/ToggleSwitch";
import useToast from "../../components/common/Toast/useToast";
import categoriaService from "../../services/categoriaService";
import { showApiErrorToast } from "../../utils/toastErrors";
import validateRequiredFields from "../../utils/validateRequiredFields";
import "../Cadastros/Cadastros.css";

const FORM_INICIAL = { nome: "", descricao: "", ativo: true };

function CategoriaForm() {
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

    categoriaService
      .buscarPorId(id)
      .then((categoria) => {
        if (!ativo) return;
        setFormulario({
          nome: categoria.nome || "",
          descricao: categoria.descricao || "",
          ativo: categoria.ativo,
        });
      })
      .catch((loadError) => {
        console.error("Erro ao carregar categoria:", loadError);
        if (ativo) {
          setErro("Não foi possível carregar a categoria.");
          showApiErrorToast(showToast, loadError, "Não foi possível carregar a categoria.");
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

  const salvarCategoria = async (event) => {
    event.preventDefault();
    if (!validateRequiredFields(event, showToast)) return;
    setErro("");
    setSalvando(true);

    try {
      const dados = {
        nome: formulario.nome.trim(),
        descricao: formulario.descricao.trim() || null,
        ativo: formulario.ativo,
      };
      if (id) {
        await categoriaService.atualizar(id, dados);
      } else {
        await categoriaService.criar(dados);
      }
      navigate("/cadastros/categorias", {
        replace: true,
        state: {
          mensagem: id
            ? "Categoria atualizada com sucesso."
            : "Categoria criada com sucesso.",
        },
      });
    } catch (saveError) {
      console.error("Erro ao salvar categoria:", saveError);
      const mensagemErro =
        saveError?.response?.data?.erro ||
        saveError?.response?.data?.message ||
        "Não foi possível salvar a categoria.";
      setErro(mensagemErro);
      showApiErrorToast(
        showToast,
        saveError,
        "Não foi possível salvar a categoria.",
      );
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) return <Loading message="Carregando categoria..." />;

  if (erro && id && !formulario.nome) {
    return (
      <EmptyState
        title="Erro ao carregar categoria"
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
            <h2>{id ? "Editar categoria" : "Nova categoria"}</h2>
            <p>Preencha os dados da categoria.</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate("/cadastros/categorias")}
            className="button__return"
            icon={<HugeiconsIcon icon={Undo03Icon} size={18} />}
          >
          </Button>
        </div>
        <form className="cadastros-form" onSubmit={salvarCategoria} noValidate>
          <Input
            id="categoria-nome"
            name="nome"
            label="NOME"
            value={formulario.nome}
            onChange={atualizarCampo}
            maxLength={100}
            required
            autoFocus
          />
          <label className="cadastros-field" htmlFor="categoria-descricao">
            <span className="cadastros-field__label">DESCRIÇÃO</span>
            <textarea
              id="categoria-descricao"
              name="descricao"
              value={formulario.descricao}
              onChange={atualizarCampo}
              maxLength={255}
              rows={3}
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
                  title={formulario.ativo ? "Inativar categoria" : "Ativar categoria"}
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
              onClick={() => navigate("/cadastros/categorias")}
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

export default CategoriaForm;
