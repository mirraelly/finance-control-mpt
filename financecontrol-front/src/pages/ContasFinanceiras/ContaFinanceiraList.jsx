import { useEffect, useState } from "react";
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
import contaFinanceiraService from "../../services/contaFinanceiraService";
import "../Cadastros/Cadastros.css";

const PAGE_SIZE = 15;
const TIPOS_CONTA = [
  { value: "CORRENTE", label: "Conta corrente" },
  { value: "POUPANCA", label: "Poupança" },
  { value: "CAIXA", label: "Caixa" },
  { value: "CARTEIRA", label: "Carteira" },
];
const NOMES_TIPO = Object.fromEntries(
  TIPOS_CONTA.map(({ value, label }) => [value, label]),
);

function ContaFinanceiraList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [contas, setContas] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [tamanhoPagina, setTamanhoPagina] = useState(PAGE_SIZE);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("");
  const [situacaoFiltro, setSituacaoFiltro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState(location.state?.mensagem || "");
  const [contaSelecionada, setContaSelecionada] = useState(null);
  const [alterandoSituacao, setAlterandoSituacao] = useState(false);
  const [recarregar, setRecarregar] = useState(0);

  useEffect(() => {
    if (!location.state?.mensagem) return;
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!mensagem) return;
    const timeout = setTimeout(() => setMensagem(""), 4000);
    return () => clearTimeout(timeout);
  }, [mensagem]);

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
        const resposta = await contaFinanceiraService.listar({
          page: pagina,
          size: tamanhoPagina,
          nome: filtro || undefined,
          tipo: tipoFiltro || undefined,
          ativo: situacaoFiltro === "" ? undefined : situacaoFiltro,
        });
        if (!ativo) return;
        setContas(resposta.content);
        setTotalPaginas(resposta.totalPages);
        setTotalRegistros(resposta.totalElements);
      } catch (erroCarregamento) {
        console.error("Erro ao carregar contas financeiras:", erroCarregamento);
        if (ativo) {
          setErro("Não foi possível carregar as contas financeiras.");
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarContas();
    return () => {
      ativo = false;
    };
  }, [pagina, tamanhoPagina, filtro, tipoFiltro, situacaoFiltro, recarregar]);

  const confirmarAlteracaoSituacao = async () => {
    try {
      setAlterandoSituacao(true);
      await contaFinanceiraService.atualizar(contaSelecionada.id, {
        nome: contaSelecionada.nome,
        tipo: contaSelecionada.tipo,
        ativo: !contaSelecionada.ativo,
      });
      setMensagem(
        contaSelecionada.ativo
          ? "Conta financeira inativada com sucesso."
          : "Conta financeira ativada com sucesso.",
      );
      setContaSelecionada(null);
      setRecarregar((valor) => valor + 1);
    } catch (alteracaoError) {
      console.error("Erro ao alterar situação da conta financeira:", alteracaoError);
      alert(
        alteracaoError?.response?.data?.erro ||
          "Não foi possível alterar a situação da conta financeira.",
      );
    } finally {
      setAlterandoSituacao(false);
    }
  };

  return (
    <div className="cadastros-page">
      {mensagem && (
        <p className="cadastros-mensagem" role="status">
          {mensagem}
        </p>
      )}

      <Card className="cadastros-toolbar">
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
          onClick={() => navigate("/cadastros/contas-financeiras/nova")}
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
        ) : contas.length === 0 ? (
          <EmptyState
            icon={<HugeiconsIcon icon={Wallet01Icon} size={32} />}
            title="Nenhuma conta financeira encontrada"
            description="Adicione uma conta ou ajuste a busca."
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
                  {contas.map((conta) => (
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
                              navigate(`/cadastros/contas-financeiras/${conta.id}`)
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
