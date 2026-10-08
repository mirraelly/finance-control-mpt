import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  HugeiconsIcon,
  Edit02Icon,
  Invoice03Icon,
  Search01Icon,
  UnavailableIcon,
  UserCheck01Icon,
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
import useToast from "../../components/common/Toast/useToast";
import formaPagamentoService from "../../services/formaPagamentoService";
import { showApiErrorToast } from "../../utils/toastErrors";
import "../Cadastros/Cadastros.css";

const PAGE_SIZE = 15;

function FormaPagamentoList() {
  const navigate = useNavigate();
  const location = useLocation();
  const showToast = useToast();
  const ultimoToastConsumido = useRef(null);
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [tamanhoPagina, setTamanhoPagina] = useState(PAGE_SIZE);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("");
  const [situacaoFiltro, setSituacaoFiltro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [selecionada, setSelecionada] = useState(null);
  const [alterandoSituacao, setAlterandoSituacao] = useState(false);
  const [recarregar, setRecarregar] = useState(0);

  useEffect(() => {
    if (
      !location.state?.mensagem ||
      ultimoToastConsumido.current === location.key
    ) {
      return;
    }
    ultimoToastConsumido.current = location.key;
    showToast({
      type: "success",
      title: "Operação concluída",
      message: location.state.mensagem,
    });
    navigate(location.pathname, { replace: true, state: null });
  }, [location.key, location.pathname, location.state, navigate, showToast]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFiltro(busca.trim());
      setPagina(0);
    }, 400);
    return () => clearTimeout(timeout);
  }, [busca]);

  useEffect(() => {
    let ativo = true;

    async function carregarFormasPagamento() {
      try {
        setCarregando(true);
        setErro("");
        const resposta = await formaPagamentoService.listar({
          page: pagina,
          size: tamanhoPagina,
          nome: filtro || undefined,
          ativo: situacaoFiltro === "" ? undefined : situacaoFiltro,
        });
        if (!ativo) return;
        setFormasPagamento(resposta.content);
        setTotalPaginas(resposta.totalPages);
        setTotalRegistros(resposta.totalElements);
      } catch (loadError) {
        console.error("Erro ao carregar formas de pagamento:", loadError);
        if (ativo) {
          setErro("Não foi possível carregar as formas de pagamento.");
          showApiErrorToast(
            showToast,
            loadError,
            "Não foi possível carregar as formas de pagamento.",
          );
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarFormasPagamento();
    return () => {
      ativo = false;
    };
  }, [pagina, tamanhoPagina, filtro, situacaoFiltro, recarregar, showToast]);

  const confirmarAlteracaoSituacao = async () => {
    try {
      setAlterandoSituacao(true);
      await formaPagamentoService.atualizar(selecionada.id, {
        nome: selecionada.nome,
        contaFinanceiraId: selecionada.contaFinanceiraId,
        ativo: !selecionada.ativo,
      });
      showToast({
        type: "success",
        title: "Situação atualizada",
        message: selecionada.ativo
          ? "Forma de pagamento inativada com sucesso."
          : "Forma de pagamento ativada com sucesso.",
      });
      setSelecionada(null);
      setRecarregar((valor) => valor + 1);
    } catch (updateError) {
      console.error("Erro ao alterar situação da forma de pagamento:", updateError);
      showApiErrorToast(
        showToast,
        updateError,
        "Não foi possível alterar a situação da forma de pagamento.",
      );
    } finally {
      setAlterandoSituacao(false);
    }
  };

  return (
    <div className="cadastros-page">
      <Card className="cadastros-toolbar">
        <Input
          aria-label="Buscar formas de pagamento"
          placeholder="Buscar por nome..."
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          icon={<HugeiconsIcon icon={Search01Icon} size={18} />}
          fullWidth
        />
        <Select
          id="formas-pagamento-filtro-situacao"
          aria-label="Filtrar por situação"
          options={[
            { value: "", label: "Todas as situações" },
            { value: "true", label: "Ativas" },
            { value: "false", label: "Inativas" },
          ]}
          value={situacaoFiltro}
          onChange={(event) => {
            setSituacaoFiltro(event.target.value);
            setPagina(0);
          }}
        />
        <Button
          onClick={() => navigate("/cadastros/formas-pagamento/nova")}
          icon={<HugeiconsIcon icon={Invoice03Icon} size={18} />}
        >
          Nova Forma de Pagamento
        </Button>
      </Card>

      <Card className="cadastros-list-card">
        {carregando && formasPagamento.length === 0 ? (
          <Loading message="Carregando formas de pagamento..." />
        ) : erro ? (
          <EmptyState
            icon={<HugeiconsIcon icon={Wallet01Icon} size={32} />}
            title="Erro ao carregar"
            description={erro}
            fullWidth
          />
        ) : formasPagamento.length === 0 ? (
          <EmptyState
            icon={<HugeiconsIcon icon={Wallet01Icon} size={32} />}
            title="Nenhuma forma de pagamento encontrada"
            description="Adicione uma forma de pagamento ou ajuste a busca."
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
                    <th>Nome</th>
                    <th>Conta financeira</th>
                    <th>Situação</th>
                    <th className="cadastros-table__actions-heading">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {formasPagamento.map((formaPagamento) => (
                    <tr key={formaPagamento.id}>
                      <td>{formaPagamento.nome}</td>
                      <td className="cadastros-table__muted">
                        {formaPagamento.contaFinanceiraNome}
                      </td>
                      <td>
                        <Badge
                          variant={formaPagamento.ativo ? "success" : "danger"}
                        >
                          {formaPagamento.ativo ? "Ativa" : "Inativa"}
                        </Badge>
                      </td>
                      <td>
                        <div className="cadastros-table__actions">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate(
                                `/cadastros/formas-pagamento/${formaPagamento.id}`,
                              )
                            }
                            aria-label={`Editar forma de pagamento ${formaPagamento.nome}`}
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
                            title={
                              formaPagamento.ativo
                                ? "Inativar forma de pagamento"
                                : "Ativar forma de pagamento"
                            }
                            aria-label={`${formaPagamento.ativo ? "Inativar" : "Ativar"} forma de pagamento ${formaPagamento.nome}`}
                            onClick={() => setSelecionada(formaPagamento)}
                            icon={
                              <HugeiconsIcon
                                icon={
                                  formaPagamento.ativo
                                    ? UnavailableIcon
                                    : UserCheck01Icon
                                }
                                color={
                                  formaPagamento.ativo ? "#b91c1c" : "#16a34a"
                                }
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
        isOpen={Boolean(selecionada)}
        onClose={() => !alterandoSituacao && setSelecionada(null)}
        title={
          selecionada?.ativo
            ? "Inativar forma de pagamento"
            : "Ativar forma de pagamento"
        }
        closeOnOverlay={!alterandoSituacao}
        footer={
          <div className="cadastros-form__actions">
            <Button
              variant="outline"
              onClick={() => setSelecionada(null)}
              disabled={alterandoSituacao}
            >
              Cancelar
            </Button>
            <Button
              variant={selecionada?.ativo ? "danger" : "primary"}
              onClick={confirmarAlteracaoSituacao}
              disabled={alterandoSituacao}
            >
              {alterandoSituacao ? "Salvando..." : "Confirmar"}
            </Button>
          </div>
        }
      >
        {selecionada && (
          <p>
            {selecionada.ativo
              ? `Deseja inativar a forma de pagamento ${selecionada.nome}?`
              : `Deseja ativar a forma de pagamento ${selecionada.nome}?`}
          </p>
        )}
      </Modal>
    </div>
  );
}

export default FormaPagamentoList;
