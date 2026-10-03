import { useEffect, useState } from "react";
import { HugeiconsIcon, Search01Icon, Clock01Icon } from "../../assets/icons";
import loginLogService from "../../services/loginLogService";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import DatePicker from "../../components/common/DatePicker/Datepicker";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import "./LogsLogin.css";

const RESULTADO_OPTIONS = [
  { value: "", label: "Todos os resultados" },
  { value: "true", label: "Sucesso" },
  { value: "false", label: "Falha" },
];

const MOTIVO_FALHA_LABEL = {
  USUARIO_INEXISTENTE: "E-mail não cadastrado",
  USUARIO_INATIVO: "Usuário inativo",
  SENHA_INVALIDA: "Senha inválida",
};

function formatarDataHora(dataISO) {
  return new Date(dataISO).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function LogLoginList() {
  const [logs, setLogs] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [tamanhoPagina, setTamanhoPagina] = useState(15);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [email, setEmail] = useState("");
  const [emailFiltro, setEmailFiltro] = useState("");
  const [resultado, setResultado] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setEmailFiltro(email.trim());
      setPagina(0);
    }, 400);

    return () => clearTimeout(timeout);
  }, [email]);

  useEffect(() => {
    async function carregarLogs() {
      try {
        setCarregando(true);
        setErro("");
        const resposta = await loginLogService.listarLogs({
          page: pagina,
          size: tamanhoPagina,
          email: emailFiltro || undefined,
          sucesso: resultado || undefined,
          dataInicio: dataInicio || undefined,
          dataFim: dataFim || undefined,
        });
        setLogs(resposta.content);
        setTotalPaginas(resposta.totalPages);
        setTotalRegistros(resposta.totalElements);
      } catch (erro) {
        console.error("Erro ao carregar logs de login:", erro);
        setErro("Não foi possível carregar os logs de login.");
      } finally {
        setCarregando(false);
      }
    }

      carregarLogs();
  }, [pagina, tamanhoPagina, emailFiltro, resultado, dataInicio, dataFim]);

  const renderConteudo = () => {
    if (carregando) {
      return <Loading message="Carregando logs..." />;
    }

    if (erro || logs.length === 0) {
      return (
        <EmptyState
          icon={<HugeiconsIcon icon={Clock01Icon} size={32} />}
          title={erro ? "Erro ao carregar" : "Nenhum login encontrado"}
          description={
            erro || "Tente ajustar a busca ou os filtros selecionados."
          }
          fullWidth
        />
      );
    }

    return (
      <>
        <div className="logs-login-table__wrapper">
          <table className="logs-login-table">
            <thead>
              <tr>
                <th>Data e hora</th>
                <th>Usuário</th>
                <th>Resultado</th>
                <th className="logs-login-table__col-ip">IP</th>
                <th className="logs-login-table__col-navegador">Navegador</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="logs-login-table__muted">
                    {formatarDataHora(log.dataLogin)}
                  </td>
                  <td>
                    <div className="logs-login-table__usuario">
                      <span>{log.usuarioNome || "Não identificado"}</span>
                      <span className="logs-login-table__muted">
                        {log.email}
                      </span>
                    </div>
                  </td>
                  <td>
                    <Badge variant={log.sucesso ? "success" : "danger"} size="sm">
                      {log.sucesso
                        ? "Sucesso"
                        : MOTIVO_FALHA_LABEL[log.motivoFalha] || "Falha"}
                    </Badge>
                  </td>
                  <td className="logs-login-table__muted logs-login-table__col-ip">
                    {log.enderecoIp || "-"}
                  </td>
                  <td
                    className="logs-login-table__muted logs-login-table__navegador logs-login-table__col-navegador"
                    title={log.userAgent || ""}
                  >
                    {log.userAgent || "-"}
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
          onChange={setPagina}
          pageSize={tamanhoPagina}
          onPageSizeChange={(tamanho) => {
            setTamanhoPagina(tamanho);
            setPagina(0);
          }}
        />
      </>
    );
  };

  return (
    <div className="logs-login-page">
      <Card
        className="logs-login-toolbar"
        padding="sm"
        radius="lg"
        shadow={false}
      >
        <Input
          id="logs-login-busca"
          type="search"
          icon={<HugeiconsIcon icon={Search01Icon} size={18} stroke="2" />}
          placeholder="Buscar pelo e-mail..."
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          fullWidth
          className="logs-login-toolbar__busca"
        />

        <div className="logs-login-toolbar__filtros">
          <Select
            id="logs-login-resultado"
            options={RESULTADO_OPTIONS}
            value={resultado}
            onChange={(event) => {
              setResultado(event.target.value);
              setPagina(0);
            }}
            width="200px"
            className="logs-login-toolbar__select"
          />

          <DatePicker
            id="logs-login-data-inicio"
            placeholder="Data inicial"
            value={dataInicio}
            max={dataFim || undefined}
            onChange={(event) => {
              setDataInicio(event.target.value);
              setPagina(0);
            }}
            width="170px"
          />

          <DatePicker
            id="logs-login-data-fim"
            placeholder="Data final"
            value={dataFim}
            min={dataInicio || undefined}
            onChange={(event) => {
              setDataFim(event.target.value);
              setPagina(0);
            }}
            width="170px"
          />
        </div>
      </Card>

      <Card
        className="logs-login-table-card"
        padding="none"
        radius="lg"
        shadow={false}
      >
        {renderConteudo()}
      </Card>
    </div>
  );
}

export default LogLoginList;
