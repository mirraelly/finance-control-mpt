import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  HugeiconsIcon,
  Search01Icon,
  UserAdd01Icon,
  ContactBookIcon,
  Edit02Icon,
  UserBlock01Icon,
  UserCheck01Icon,
} from "../../assets/icons";
import pessoaService from "../../services/pessoaService";
import { formatarDocumento, formatarTelefone } from "../../utils/formatters";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Modal from "../../components/common/Modal/Modal";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import "./Pessoas.css";

const TIPO_OPTIONS = [
  { value: "", label: "Todos os tipos" },
  { value: "PESSOA_FISICA", label: "Pessoa física" },
  { value: "PESSOA_JURIDICA", label: "Pessoa jurídica" },
];

const SITUACAO_OPTIONS = [
  { value: "", label: "Todas as situações" },
  { value: "true", label: "Ativas" },
  { value: "false", label: "Inativas" },
];

const TIPO_LABEL = {
  PESSOA_FISICA: "Física",
  PESSOA_JURIDICA: "Jurídica",
};

function PessoaList() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mensagem, setMensagem] = useState(location.state?.mensagem || "");
  const [pessoas, setPessoas] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [tamanhoPagina, setTamanhoPagina] = useState(15);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [nome, setNome] = useState("");
  const [nomeFiltro, setNomeFiltro] = useState("");
  const [documento, setDocumento] = useState("");
  const [documentoFiltro, setDocumentoFiltro] = useState("");
  const [tipoPessoa, setTipoPessoa] = useState("");
  const [situacao, setSituacao] = useState("");

  const [pessoaSelecionada, setPessoaSelecionada] = useState(null);
  const [alterandoSituacao, setAlterandoSituacao] = useState(false);
  const [recarregar, setRecarregar] = useState(0);

  useEffect(() => {
    if (!mensagem) return;

    navigate(location.pathname, { replace: true, state: null });
    const timeout = setTimeout(() => setMensagem(""), 4000);

    return () => clearTimeout(timeout);
  }, [mensagem, navigate, location.pathname]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setNomeFiltro(nome.trim());
      setDocumentoFiltro(documento.replace(/\D/g, ""));
      setPagina(0);
    }, 400);

    return () => clearTimeout(timeout);
  }, [nome, documento]);

  useEffect(() => {
    async function carregarPessoas() {
      try {
        setCarregando(true);
        setErro("");
        const resposta = await pessoaService.listarPessoas({
          page: pagina,
          size: tamanhoPagina,
          nome: nomeFiltro || undefined,
          documento: documentoFiltro || undefined,
          tipoPessoa: tipoPessoa || undefined,
          ativo: situacao || undefined,
        });
        setPessoas(resposta.content);
        setTotalPaginas(resposta.totalPages);
        setTotalRegistros(resposta.totalElements);
      } catch (erro) {
        console.error("Erro ao carregar pessoas:", erro);
        setErro("Não foi possível carregar as pessoas.");
      } finally {
        setCarregando(false);
      }
    }

    carregarPessoas();
  }, [pagina, tamanhoPagina, nomeFiltro, documentoFiltro, tipoPessoa, situacao, recarregar]);

  const handleConfirmarSituacao = async () => {
    try {
      setAlterandoSituacao(true);
      await pessoaService.alterarAtivo(
        pessoaSelecionada.id,
        !pessoaSelecionada.ativo,
      );
      setMensagem(
        pessoaSelecionada.ativo
          ? "Pessoa inativada com sucesso."
          : "Pessoa ativada com sucesso.",
      );
      setPessoaSelecionada(null);
      setRecarregar((valor) => valor + 1);
    } catch (erro) {
      console.error("Erro ao alterar situação da pessoa:", erro);
      alert(
        erro?.response?.data?.erro ||
          "Não foi possível alterar a situação da pessoa.",
      );
    } finally {
      setAlterandoSituacao(false);
    }
  };

  const renderConteudo = () => {
    if (carregando && pessoas.length === 0) {
      return <Loading message="Carregando pessoas..." />;
    }

    if (erro) {
      return (
        <EmptyState
          icon={<HugeiconsIcon icon={ContactBookIcon} size={32} />}
          title="Erro ao carregar"
          description={erro}
          fullWidth
        />
      );
    }

    if (pessoas.length === 0) {
      return (
        <EmptyState
          icon={<HugeiconsIcon icon={ContactBookIcon} size={32} />}
          title="Nenhuma pessoa encontrada"
          description="Tente ajustar a busca ou os filtros selecionados."
          fullWidth
        />
      );
    }

    return (
      <>
        <div
          className={`pessoas-table__wrapper ${carregando ? "pessoas-table__wrapper--carregando" : ""}`}
          aria-busy={carregando}
        >
          <table className="pessoas-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th className="pessoas-table__col-secundaria">CPF / CNPJ</th>
                <th className="pessoas-table__col-tipo">Tipo</th>
                <th className="pessoas-table__col-secundaria">Telefone</th>
                <th className="pessoas-table__col-secundaria pessoas-table__col-cidade">
                  Cidade
                </th>
                <th>Situação</th>
                <th className="pessoas-table__acoes-col">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pessoas.map((pessoa) => {
                const telefone =
                  pessoa.telefones.find((item) => item.principal) ||
                  pessoa.telefones[0];
                const endereco =
                  pessoa.enderecos.find((item) => item.principal) ||
                  pessoa.enderecos[0];
                const documentoPessoa = formatarDocumento(
                  pessoa.cpf || pessoa.cnpj,
                );

                return (
                  <tr key={pessoa.id}>
                    <td>
                      <div className="pessoas-table__nome">
                        <span className="pessoas-avatar" aria-hidden="true">
                          {pessoa.nome.charAt(0).toUpperCase()}
                        </span>
                        <div className="pessoas-table__nome-texto">
                          <span>{pessoa.nome}</span>
                          <span className="pessoas-table__documento-mobile">
                            {documentoPessoa}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="pessoas-table__muted pessoas-table__col-secundaria">
                      {documentoPessoa}
                    </td>
                    <td className="pessoas-table__col-tipo">
                      <Badge
                        variant={
                          pessoa.tipoPessoa === "PESSOA_JURIDICA"
                            ? "purple"
                            : "info"
                        }
                        size="sm"
                      >
                        {TIPO_LABEL[pessoa.tipoPessoa] || pessoa.tipoPessoa}
                      </Badge>
                    </td>
                    <td className="pessoas-table__muted pessoas-table__col-secundaria">
                      {telefone ? formatarTelefone(telefone.numero) : "-"}
                    </td>
                    <td className="pessoas-table__muted pessoas-table__col-secundaria pessoas-table__col-cidade">
                      {endereco?.cidadeNome
                        ? `${endereco.cidadeNome}/${endereco.estadoSigla}`
                        : "-"}
                    </td>
                    <td>
                      <Badge
                        variant={pessoa.ativo ? "success" : "danger"}
                        size="sm"
                      >
                        {pessoa.ativo ? "Ativa" : "Inativa"}
                      </Badge>
                    </td>
                    <td>
                      <div className="pessoas-table__acoes">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Editar pessoa"
                          aria-label={`Editar ${pessoa.nome}`}
                          onClick={() =>
                            navigate(`/cadastros/pessoas/${pessoa.id}`)
                          }
                          icon={<HugeiconsIcon icon={Edit02Icon} size={18} />}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          title={pessoa.ativo ? "Inativar pessoa" : "Ativar pessoa"}
                          aria-label={`${pessoa.ativo ? "Inativar" : "Ativar"} ${pessoa.nome}`}
                          onClick={() => setPessoaSelecionada(pessoa)}
                          icon={
                            <HugeiconsIcon
                              icon={pessoa.ativo ? UserBlock01Icon : UserCheck01Icon}
                              size={18}
                            />
                          }
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
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
    <div className="pessoas-page">
      <Card
        className="pessoas-toolbar"
        padding="sm"
        radius="lg"
        shadow={false}
      >
        <Input
          id="pessoas-busca"
          type="search"
          icon={<HugeiconsIcon icon={Search01Icon} size={18} stroke="2" />}
          placeholder="Buscar pelo nome..."
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          fullWidth
          className="pessoas-toolbar__busca"
        />

        <div className="pessoas-toolbar__filtros">
          <Input
            id="pessoas-documento"
            type="search"
            inputMode="numeric"
            placeholder="CPF / CNPJ"
            value={documento}
            onChange={(event) => setDocumento(event.target.value)}
            width="180px"
            className="pessoas-toolbar__documento"
          />

          <Select
            id="pessoas-tipo"
            options={TIPO_OPTIONS}
            value={tipoPessoa}
            onChange={(event) => {
              setTipoPessoa(event.target.value);
              setPagina(0);
            }}
            width="180px"
            className="pessoas-toolbar__select"
          />

          <Select
            id="pessoas-situacao"
            options={SITUACAO_OPTIONS}
            value={situacao}
            onChange={(event) => {
              setSituacao(event.target.value);
              setPagina(0);
            }}
            width="190px"
            className="pessoas-toolbar__select"
          />

          <Button
            icon={<HugeiconsIcon icon={UserAdd01Icon} size={18} stroke="2" />}
            onClick={() => navigate("/cadastros/pessoas/nova")}
          >
            Nova pessoa
          </Button>
        </div>
      </Card>

      {mensagem && (
        <p className="pessoas-mensagem" role="status">
          {mensagem}
        </p>
      )}

      <Card
        className="pessoas-table-card"
        padding="none"
        radius="lg"
        shadow={false}
      >
        {renderConteudo()}
      </Card>

      <Modal
        isOpen={Boolean(pessoaSelecionada)}
        onClose={() => !alterandoSituacao && setPessoaSelecionada(null)}
        title={pessoaSelecionada?.ativo ? "Inativar pessoa" : "Ativar pessoa"}
        closeOnOverlay={!alterandoSituacao}
        footer={
          <div className="pessoas-modal__botoes">
            <Button
              variant="outline"
              onClick={() => setPessoaSelecionada(null)}
              disabled={alterandoSituacao}
            >
              Cancelar
            </Button>
            <Button
              variant={pessoaSelecionada?.ativo ? "danger" : "primary"}
              onClick={handleConfirmarSituacao}
              disabled={alterandoSituacao}
            >
              {alterandoSituacao ? "Salvando..." : "Confirmar"}
            </Button>
          </div>
        }
      >
        {pessoaSelecionada && (
          <p className="pessoas-modal__texto">
            {pessoaSelecionada.ativo
              ? `Ao inativar ${pessoaSelecionada.nome}, ela deixará de aparecer nas seleções de contas a pagar e a receber.`
              : `Ao ativar ${pessoaSelecionada.nome}, ela voltará a aparecer nas seleções de contas a pagar e a receber.`}
          </p>
        )}
      </Modal>
    </div>
  );
}

export default PessoaList;
