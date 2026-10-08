import { useEffect, useMemo, useRef, useState } from "react";
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
import contaFinanceiraService from "../../services/contaFinanceiraService";
import { showApiErrorToast } from "../../utils/toastErrors";
import "../Cadastros/Cadastros.css";
import "./ContaFinanceiraList.css";

const PAGE_SIZE = 15;
const API_PAGE_SIZE = 100;
const TIPOS_CONTA = [
  { value: "CORRENTE", label: "Conta corrente" },
  { value: "POUPANCA", label: "Poupança" },
  { value: "CAIXA", label: "Caixa" },
  { value: "CARTEIRA", label: "Carteira" },
];
const NOMES_TIPO = Object.fromEntries(
  TIPOS_CONTA.map(({ value, label }) => [value, label]),
);

async function listarContasFinanceiras(nome) {
  const primeiraPagina = await contaFinanceiraService.listar({
    page: 0,
    size: API_PAGE_SIZE,
    nome: nome || undefined,
  });
  const totalPaginas = primeiraPagina.totalPages || 1;
  const paginasRestantes = await Promise.all(
    Array.from({ length: Math.max(0, totalPaginas - 1) }, (_, index) =>
      contaFinanceiraService.listar({
        page: index + 1,
        size: API_PAGE_SIZE,
        nome: nome || undefined,
      }),
    ),
  );

  return [
    ...(primeiraPagina.content || []),
    ...paginasRestantes.flatMap((pagina) => pagina.content || []),
  ];
}

function ContaFinanceiraList() {
  const navigate = useNavigate();
  const location = useLocation();
  const showToast = useToast();
  const ultimoToastConsumido = useRef(null);
  const [contas, setContas] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [tamanhoPagina, setTamanhoPagina] = useState(PAGE_SIZE);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("");
  const [situacaoFiltro, setSituacaoFiltro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [contaSelecionada, setContaSelecionada] = useState(null);
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

    async function carregarContas() {
      try {
        setCarregando(true);
        setErro("");
        const resposta = await listarContasFinanceiras(filtro);
        if (!ativo) return;
        setContas(resposta);
      } catch (erroCarregamento) {
        console.error("Erro ao carregar contas financeiras:", erroCarregamento);
        if (ativo) {
          setErro("Não foi possível carregar as contas financeiras.");
          showApiErrorToast(
            showToast,
            erroCarregamento,
            "Não foi possível carregar as contas financeiras.",
          );
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarContas();
    return () => {
      ativo = false;
    };
  }, [filtro, recarregar, showToast]);

  const contasFiltradas = useMemo(
    () =>
      contas.filter(
        (conta) =>
          (!tipoFiltro || conta.tipo === tipoFiltro) &&
          (situacaoFiltro === "" ||
            String(conta.ativo) === situacaoFiltro),
      ),
    [contas, situacaoFiltro, tipoFiltro],
  );
  const totalPaginas = Math.ceil(contasFiltradas.length / tamanhoPagina);
  const contasDaPagina = contasFiltradas.slice(
    pagina * tamanhoPagina,
    (pagina + 1) * tamanhoPagina,
  );

  const confirmarAlteracaoSituacao = async () => {
    try {
      setAlterandoSituacao(true);
      await contaFinanceiraService.atualizar(contaSelecionada.id, {
        nome: contaSelecionada.nome,
        tipo: contaSelecionada.tipo,
        ativo: !contaSelecionada.ativo,
      });
      showToast({
        type: "success",
        title: "Situação atualizada",
        message: contaSelecionada.ativo
          ? "Conta financeira inativada com sucesso."
          : "Conta financeira ativada com sucesso.",
      });
      setContaSelecionada(null);
      setRecarregar((valor) => valor + 1);
    } catch (alteracaoError) {
      console.error("Erro ao alterar situação da conta financeira:", alteracaoError);
      showApiErrorToast(
        showToast,
        alteracaoError,
        "Não foi possível alterar a situação da conta financeira.",
      );
    } finally {
      setAlterandoSituacao(false);
    }
  };

  return (
    <div className="cadastros-page">
      <Card className="cadastros-toolbar contas-financeiras-toolbar">
        <Input
          aria-label="Buscar contas financeiras"
          placeholder="Buscar por nome..."
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          icon={<HugeiconsIcon icon={Search01Icon} size={18} />}
          fullWidth
        />
        <Select
          id="contas-financeiras-filtro-tipo"
          aria-label="Filtrar por tipo de conta"
          options={[
            { value: "", label: "Todos os tipos" },
            ...TIPOS_CONTA,
          ]}
          value={tipoFiltro}
          onChange={(event) => {
            setTipoFiltro(event.target.value);
            setPagina(0);
          }}
        />
        <Select
          id="contas-financeiras-filtro-situacao"
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
          onClick={() => navigate("/contas/contas-financeiras/nova")}
          icon={<HugeiconsIcon icon={Invoice03Icon} size={18} />}
        >
          Nova Conta
        </Button>
      </Card>

      <Card className="cadastros-list-card">
        {carregando && contas.length === 0 ? (
          <Loading message="Carregando contas financeiras..." />
        ) : erro ? (
          <EmptyState
            icon={<HugeiconsIcon icon={Wallet01Icon} size={32} />}
            title="Erro ao carregar"
            description={erro}
            fullWidth
          />
        ) : contasFiltradas.length === 0 ? (
          <EmptyState
            icon={<HugeiconsIcon icon={Wallet01Icon} size={32} />}
            title="Nenhuma conta financeira encontrada"
            description="Adicione uma conta ou ajuste os filtros."
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
                    <th>Tipo</th>
                    <th>Situação</th>
                    <th className="cadastros-table__actions-heading">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {contasDaPagina.map((conta) => (
                    <tr key={conta.id}>
                      <td>{conta.nome}</td>
                      <td className="cadastros-table__muted">
                        {NOMES_TIPO[conta.tipo] || conta.tipo}
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
                              navigate(`/contas/contas-financeiras/${conta.id}`)
                            }
                            aria-label={`Editar conta financeira ${conta.nome}`}
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
                            title={conta.ativo ? "Inativar conta financeira" : "Ativar conta financeira"}
                            aria-label={`${conta.ativo ? "Inativar" : "Ativar"} conta financeira ${conta.nome}`}
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
              totalElements={contasFiltradas.length}
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
        title={contaSelecionada?.ativo ? "Inativar conta financeira" : "Ativar conta financeira"}
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
            {contaSelecionada.ativo
              ? `Deseja inativar a conta financeira ${contaSelecionada.nome}?`
              : `Deseja ativar a conta financeira ${contaSelecionada.nome}?`}
          </p>
        )}
      </Modal>
    </div>
  );
}

export default ContaFinanceiraList;
