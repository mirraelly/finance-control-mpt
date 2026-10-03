import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  HugeiconsIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Calendar03Icon,
  Call02Icon,
  ContactBookIcon,
  Delete02Icon,
  InformationCircleIcon,
  Mail01Icon,
  Undo03Icon,
  PlusIcon,
  RealEstate01Icon,
  SaveIcon,
} from "../../assets/icons";
import pessoaService from "../../services/pessoaService";
import {
  formatarCep,
  formatarCnpj,
  formatarCpf,
  formatarTelefone,
  somenteDigitos,
} from "../../utils/formatters";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import ToggleSwitch from "../../components/common/ToggleSwitch";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/common/EmptyState";
import "./Pessoas.css";

const TIPO_PESSOA_OPTIONS = [
  { value: "PESSOA_FISICA", label: "Pessoa física" },
  { value: "PESSOA_JURIDICA", label: "Pessoa jurídica" },
];

const CATEGORIA_CNH_OPTIONS = [
  { value: "", label: "Não informada" },
  "A",
  "B",
  "AB",
  "C",
  "D",
  "E",
  "AC",
  "AD",
  "AE",
];

const ETAPAS_FORMULARIO = [
  { label: "Dados principais", icon: ContactBookIcon },
  { label: "Telefones", icon: Call02Icon },
  { label: "E-mails", icon: Mail01Icon },
  { label: "Endereços", icon: RealEstate01Icon },
];

function LabelObrigatorio({ children }) {
  return (
    <span>
      {children}{" "}
      <span className="pessoa-form__obrigatorio" aria-hidden="true">
        *
      </span>
    </span>
  );
}

function PessoaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdicao = Boolean(id);

  const [tipoPessoa, setTipoPessoa] = useState("PESSOA_FISICA");
  const [nome, setNome] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [cpf, setCpf] = useState("");
  const [rg, setRg] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [cnh, setCnh] = useState("");
  const [cnhCategoria, setCnhCategoria] = useState("");
  const [cnhValidade, setCnhValidade] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [inscricaoEstadual, setInscricaoEstadual] = useState("");
  const [inscricaoMunicipal, setInscricaoMunicipal] = useState("");

  const [telefones, setTelefones] = useState([]);
  const [emails, setEmails] = useState([]);
  const [enderecos, setEnderecos] = useState([]);

  const [tiposTelefone, setTiposTelefone] = useState([]);
  const [tiposEmail, setTiposEmail] = useState([]);
  const [tiposEndereco, setTiposEndereco] = useState([]);

  const [carregando, setCarregando] = useState(isEdicao);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [erroCarregamento, setErroCarregamento] = useState(false);
  const [etapaAtiva, setEtapaAtiva] = useState(0);

  const isFisica = tipoPessoa === "PESSOA_FISICA";

  useEffect(() => {
    async function carregarTipos() {
      try {
        const [telefone, email, endereco] = await Promise.all([
          pessoaService.listarTiposTelefone(),
          pessoaService.listarTiposEmail(),
          pessoaService.listarTiposEndereco(),
        ]);
        const paraOpcoes = (tipos) =>
          tipos.map((tipo) => ({ value: tipo.id, label: tipo.nome }));
        setTiposTelefone(paraOpcoes(telefone));
        setTiposEmail(paraOpcoes(email));
        setTiposEndereco(paraOpcoes(endereco));
      } catch (erro) {
        console.error("Erro ao carregar tipos:", erro);
        setErro("Não foi possível carregar os tipos de telefone, e-mail e endereço.");
      }
    }

    carregarTipos();
  }, []);

  useEffect(() => {
    if (!isEdicao) return;

    async function carregarPessoa() {
      try {
        setCarregando(true);
        const pessoa = await pessoaService.buscarPessoaPorId(id);
        setTipoPessoa(pessoa.tipoPessoa);
        setNome(pessoa.nome || "");
        setAtivo(pessoa.ativo);
        setCpf(pessoa.cpf ? formatarCpf(pessoa.cpf) : "");
        setRg(pessoa.rg || "");
        setDataNascimento(pessoa.dataNascimento || "");
        setCnh(pessoa.cnh || "");
        setCnhCategoria(pessoa.cnhCategoria || "");
        setCnhValidade(pessoa.cnhValidade || "");
        setCnpj(pessoa.cnpj ? formatarCnpj(pessoa.cnpj) : "");
        setRazaoSocial(pessoa.razaoSocial || "");
        setNomeFantasia(pessoa.nomeFantasia || "");
        setInscricaoEstadual(pessoa.inscricaoEstadual || "");
        setInscricaoMunicipal(pessoa.inscricaoMunicipal || "");
        setTelefones(
          pessoa.telefones.map((telefone) => ({
            chave: telefone.id,
            id: telefone.id,
            tipoTelefoneId: telefone.tipoTelefoneId,
            numero: formatarTelefone(telefone.numero || ""),
            observacao: telefone.observacao || "",
            principal: telefone.principal,
          })),
        );
        setEmails(
          pessoa.emails.map((email) => ({
            chave: email.id,
            id: email.id,
            tipoEmailId: email.tipoEmailId,
            email: email.email || "",
            observacao: email.observacao || "",
            principal: email.principal,
          })),
        );
        setEnderecos(
          pessoa.enderecos.map((endereco) => ({
            chave: endereco.id,
            id: endereco.id,
            tipoEnderecoId: endereco.tipoEnderecoId,
            cep: endereco.cep ? formatarCep(endereco.cep) : "",
            rua: endereco.rua || "",
            numero: endereco.numero || "",
            bairro: endereco.bairro || "",
            complemento: endereco.complemento || "",
            cidadeId: endereco.cidadeId,
            cidadeNome: endereco.cidadeNome || "",
            estadoSigla: endereco.estadoSigla || "",
            erroCep: "",
            principal: endereco.principal,
          })),
        );
      } catch (erro) {
        console.error("Erro ao carregar pessoa:", erro);
        setErroCarregamento(true);
      } finally {
        setCarregando(false);
      }
    }

    carregarPessoa();
  }, [id, isEdicao]);

  const alterarItem = (setLista, indice, campos) => {
    setLista((lista) =>
      lista.map((item, i) => (i === indice ? { ...item, ...campos } : item)),
    );
  };

  const marcarPrincipal = (setLista, indice) => {
    setLista((lista) =>
      lista.map((item, i) => ({ ...item, principal: i === indice })),
    );
  };

  const removerItem = (setLista, indice) => {
    setLista((lista) => {
      const novaLista = lista.filter((_, i) => i !== indice);
      if (novaLista.length > 0 && !novaLista.some((item) => item.principal)) {
        novaLista[0] = { ...novaLista[0], principal: true };
      }
      return novaLista;
    });
  };

  const handleCepChange = async (indice, valor) => {
    const cepFormatado = formatarCep(valor);
    const cepNumeros = cepFormatado.replace(/\D/g, "");

    alterarItem(setEnderecos, indice, {
      cep: cepFormatado,
      cidadeId: null,
      cidadeNome: "",
      estadoSigla: "",
      erroCep: "",
    });

    if (cepNumeros.length !== 8) return;

    try {
      const endereco = await pessoaService.buscarCep(cepNumeros);
      setEnderecos((lista) =>
        lista.map((item, i) =>
          i === indice
            ? {
                ...item,
                rua: endereco.rua || item.rua,
                bairro: endereco.bairro || item.bairro,
                cidadeId: endereco.cidadeId,
                cidadeNome: endereco.cidadeNome || "",
                estadoSigla: endereco.estadoSigla || "",
              }
            : item,
        ),
      );
    } catch (erro) {
      alterarItem(setEnderecos, indice, {
        erroCep: erro?.response?.data?.erro || "Não foi possível consultar o CEP.",
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErro("");

    if (nome.trim().length < 3) {
      setEtapaAtiva(0);
      setErro("Informe um nome válido com pelo menos 3 caracteres.");
      return;
    }

    if (isFisica && cpf && somenteDigitos(cpf)?.length !== 11) {
      setEtapaAtiva(0);
      setErro("Informe um CPF válido com 11 dígitos.");
      return;
    }

    if (!isFisica && cnpj && somenteDigitos(cnpj)?.length !== 14) {
      setEtapaAtiva(0);
      setErro("Informe um CNPJ válido com 14 dígitos.");
      return;
    }

    if (telefones.some((telefone) => !telefone.tipoTelefoneId || (somenteDigitos(telefone.numero)?.length || 0) < 10)) {
      setEtapaAtiva(1);
      setErro("Informe o tipo e um número válido em todos os telefones.");
      return;
    }

    if (emails.some((email) => !email.tipoEmailId || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.email.trim()))) {
      setEtapaAtiva(2);
      setErro("Informe o tipo e um e-mail válido em todos os e-mails.");
      return;
    }

    if (enderecos.some((endereco) => !endereco.tipoEnderecoId)) {
      setEtapaAtiva(3);
      setErro("Informe o tipo de todos os endereços.");
      return;
    }

    const texto = (valor) => valor.trim() || null;

    const dados = {
      nome: nome.trim(),
      tipoPessoa,
      ativo,
      dataNascimento: isFisica ? dataNascimento || null : null,
      cpf: isFisica ? somenteDigitos(cpf) : null,
      rg: isFisica ? texto(rg) : null,
      cnh: isFisica ? texto(cnh) : null,
      cnhCategoria: isFisica ? cnhCategoria || null : null,
      cnhValidade: isFisica ? cnhValidade || null : null,
      cnpj: isFisica ? null : somenteDigitos(cnpj),
      razaoSocial: isFisica ? null : texto(razaoSocial),
      nomeFantasia: isFisica ? null : texto(nomeFantasia),
      inscricaoEstadual: isFisica ? null : texto(inscricaoEstadual),
      inscricaoMunicipal: isFisica ? null : texto(inscricaoMunicipal),
      telefones: telefones.map((telefone) => ({
        id: telefone.id || null,
        tipoTelefoneId: telefone.tipoTelefoneId,
        numero: somenteDigitos(telefone.numero),
        observacao: texto(telefone.observacao),
        principal: telefone.principal,
      })),
      emails: emails.map((email) => ({
        id: email.id || null,
        tipoEmailId: email.tipoEmailId,
        email: email.email.trim(),
        observacao: texto(email.observacao),
        principal: email.principal,
      })),
      enderecos: enderecos.map((endereco) => ({
        id: endereco.id || null,
        tipoEnderecoId: endereco.tipoEnderecoId,
        cep: somenteDigitos(endereco.cep),
        rua: texto(endereco.rua),
        numero: texto(endereco.numero),
        bairro: texto(endereco.bairro),
        complemento: texto(endereco.complemento),
        cidadeId: endereco.cidadeId || null,
        principal: endereco.principal,
      })),
    };

    try {
      setSalvando(true);

      if (isEdicao) {
        await pessoaService.atualizarPessoa(id, dados);
      } else {
        await pessoaService.criarPessoa(dados);
      }

      navigate("/cadastros/pessoas", {
        state: {
          mensagem: isEdicao
            ? "Pessoa atualizada com sucesso."
            : "Pessoa cadastrada com sucesso.",
        },
      });
    } catch (erro) {
      setErro(
        erro?.response?.data?.erro ||
          "Não foi possível salvar a pessoa. Tente novamente.",
      );
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return <Loading message="Carregando pessoa..." />;
  }

  if (erroCarregamento) {
    return (
      <div className="pessoas-page">
        <Card className="pessoa-form-card" padding="lg" radius="lg" shadow={false}>
          <EmptyState
            icon={<HugeiconsIcon icon={ContactBookIcon} size={32} />}
            title="Pessoa não encontrada"
            description="Não foi possível carregar os dados desta pessoa."
            action={
              <Button onClick={() => navigate("/cadastros/pessoas")}>
                Voltar para a lista
              </Button>
            }
            fullWidth
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="pessoas-page">
      <form
        className="pessoa-form"
        onSubmit={handleSubmit}
        onChange={() => erro && setErro("")}
        noValidate
      >
        <div className="pessoa-form__cabecalho">
          <div>
            <h2>{isEdicao ? "Editar pessoa" : "Nova pessoa"}</h2>
            <p>
              Cadastre clientes, fornecedores e demais pessoas usadas nas contas a
              pagar e a receber.
            </p>
          </div>
          <button
            className="pessoa-form__voltar"
            type="button"
            aria-label="Voltar à tela anterior"
            title="Voltar à tela anterior"
            onClick={() => navigate("/cadastros/pessoas")}
            disabled={salvando}
          >
            <HugeiconsIcon icon={Undo03Icon} size={20} />
          </button>
        </div>

        <div
          className="pessoa-form__abas"
          role="tablist"
          aria-label="Etapas do cadastro de pessoa"
        >
          {ETAPAS_FORMULARIO.map((etapa, indice) => (
            <button
              key={etapa.label}
              id={`pessoa-etapa-tab-${indice}`}
              className={`pessoa-form__aba ${etapaAtiva === indice ? "pessoa-form__aba--ativa" : ""}`}
              type="button"
              role="tab"
              aria-selected={etapaAtiva === indice}
              aria-controls={`pessoa-etapa-panel-${indice}`}
              onClick={() => setEtapaAtiva(indice)}
            >
              <HugeiconsIcon
                className="pessoa-form__aba-icone"
                icon={etapa.icon}
                size={20}
                stroke={etapaAtiva === indice ? "2.5" : "2"}
              />
              <span>{etapa.label}</span>
            </button>
          ))}
        </div>

        <Card
          className="pessoa-form-card"
          padding="md"
          radius="md"
          shadow={false}
          hidden={etapaAtiva !== 0}
        >
          <section
            id="pessoa-etapa-panel-0"
            className="pessoa-form__etapa"
            role="tabpanel"
            aria-labelledby="pessoa-etapa-tab-0"
          >
            <p className="pessoa-form__dica">
              <HugeiconsIcon
                className="pessoa-form__dica-icone"
                icon={InformationCircleIcon}
                size={18}
                stroke="2"
                aria-hidden="true"
              />
              <span>
                Os campos marcados com * são obrigatórios. Os demais são opcionais e podem ser preenchidos em outro momento.
              </span>
            </p>
          <div
            className={`pessoa-form__grid ${isEdicao ? "pessoa-form__grid--edicao" : ""}`}
          >
            <Select
              id="pessoa-tipo"
              label={<LabelObrigatorio>TIPO DE PESSOA</LabelObrigatorio>}
              options={TIPO_PESSOA_OPTIONS}
              value={tipoPessoa}
              onChange={(event) => setTipoPessoa(event.target.value)}
              required
              fullWidth
            />
            <Input
              id="pessoa-nome"
              label={
                <LabelObrigatorio>
                  {isFisica ? "NOME COMPLETO" : "NOME"}
                </LabelObrigatorio>
              }
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              maxLength={255}
              fullWidth
              required
            />
            {isEdicao && (
              <div className="pessoa-form__situacao">
                <span className="pessoa-form__situacao-label">SITUAÇÃO</span>
                <div className="pessoa-form__situacao-controle">
                  <ToggleSwitch
                    checked={ativo}
                    onChange={setAtivo}
                    title={ativo ? "Inativar" : "Ativar"}
                    className="pessoa-form__toggle"
                  />
                </div>
              </div>
            )}
          </div>

          {isFisica ? (
            <div className="pessoa-form__grid">
              <Input
                id="pessoa-cpf"
                label="CPF"
                inputMode="numeric"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(event) => setCpf(formatarCpf(event.target.value))}
                fullWidth
              />
              <Input
                id="pessoa-rg"
                label="RG"
                value={rg}
                onChange={(event) => setRg(event.target.value)}
                maxLength={20}
                fullWidth
              />
              <Input
                id="pessoa-data-nascimento"
                label="DATA DE NASCIMENTO"
                type="date"
                value={dataNascimento}
                onChange={(event) => setDataNascimento(event.target.value)}
                icon={<HugeiconsIcon icon={Calendar03Icon} size={18} />}
                iconPosition="right"
                fullWidth
              />
              <Input
                id="pessoa-cnh"
                label="CNH"
                inputMode="numeric"
                value={cnh}
                onChange={(event) =>
                  setCnh(event.target.value.replace(/\D/g, "").slice(0, 11))
                }
                fullWidth
              />
              <Select
                id="pessoa-cnh-categoria"
                label="CATEGORIA DA CNH"
                options={CATEGORIA_CNH_OPTIONS}
                value={cnhCategoria}
                onChange={(event) => setCnhCategoria(event.target.value)}
                fullWidth
              />
              <Input
                id="pessoa-cnh-validade"
                label="VALIDADE DA CNH"
                type="date"
                value={cnhValidade}
                onChange={(event) => setCnhValidade(event.target.value)}
                icon={<HugeiconsIcon icon={Calendar03Icon} size={18} />}
                iconPosition="right"
                fullWidth
              />
            </div>
          ) : (
            <div className="pessoa-form__grid">
              <Input
                id="pessoa-cnpj"
                label="CNPJ"
                inputMode="numeric"
                placeholder="00.000.000/0000-00"
                value={cnpj}
                onChange={(event) => setCnpj(formatarCnpj(event.target.value))}
                fullWidth
              />
              <Input
                id="pessoa-razao-social"
                label="RAZÃO SOCIAL"
                value={razaoSocial}
                onChange={(event) => setRazaoSocial(event.target.value)}
                maxLength={255}
                fullWidth
              />
              <Input
                id="pessoa-nome-fantasia"
                label="NOME FANTASIA"
                value={nomeFantasia}
                onChange={(event) => setNomeFantasia(event.target.value)}
                maxLength={255}
                fullWidth
              />
              <Input
                id="pessoa-inscricao-estadual"
                label="INSCRIÇÃO ESTADUAL"
                value={inscricaoEstadual}
                onChange={(event) => setInscricaoEstadual(event.target.value)}
                maxLength={50}
                fullWidth
              />
              <Input
                id="pessoa-inscricao-municipal"
                label="INSCRIÇÃO MUNICIPAL"
                value={inscricaoMunicipal}
                onChange={(event) => setInscricaoMunicipal(event.target.value)}
                maxLength={50}
                fullWidth
              />
            </div>
          )}
          </section>
        </Card>

        <Card
          className="pessoa-form-card"
          padding="lg"
          radius="lg"
          shadow={false}
          hidden={etapaAtiva !== 1}
        >
          <section
            id="pessoa-etapa-panel-1"
            className="pessoa-form__etapa"
            role="tabpanel"
            aria-labelledby="pessoa-etapa-tab-1"
          >
          <div className="pessoa-form__secao-cabecalho">
            <h3>Telefones</h3>
            <Button
              variant="outline"
              size="sm"
              className="pessoa-form__adicionar"
              icon={
                <span className="pessoa-form__adicionar-icone">
                  <HugeiconsIcon icon={PlusIcon} size={10} stroke="2.5" />
                </span>
              }
              onClick={() =>
                setTelefones((lista) => [
                  ...lista,
                  {
                    chave: crypto.randomUUID(),
                    id: null,
                    tipoTelefoneId: tiposTelefone[0]?.value || "",
                    numero: "",
                    observacao: "",
                    principal: lista.length === 0,
                  },
                ])
              }
            >
              Adicionar telefone
            </Button>
          </div>

          {telefones.length === 0 ? (
            <p className="pessoa-form__vazio">Nenhum telefone cadastrado.</p>
          ) : (
            <div className="pessoa-form__lista">
              {telefones.map((telefone, indice) => (
                <div key={telefone.chave} className="pessoa-form__item">
                  <Select
                    id={`telefone-tipo-${indice}`}
                    label={<LabelObrigatorio>TIPO</LabelObrigatorio>}
                    options={tiposTelefone}
                    value={telefone.tipoTelefoneId}
                    required
                    onChange={(event) =>
                      alterarItem(setTelefones, indice, {
                        tipoTelefoneId: event.target.value,
                      })
                    }
                    fullWidth
                  />
                  <Input
                    id={`telefone-numero-${indice}`}
                    label={<LabelObrigatorio>NÚMERO</LabelObrigatorio>}
                    type="tel"
                    placeholder="(00)00000-0000"
                    value={telefone.numero}
                    required
                    onChange={(event) =>
                      alterarItem(setTelefones, indice, {
                        numero: formatarTelefone(event.target.value),
                      })
                    }
                    fullWidth
                  />
                  <Input
                    id={`telefone-observacao-${indice}`}
                    label="OBSERVAÇÃO"
                    value={telefone.observacao}
                    onChange={(event) =>
                      alterarItem(setTelefones, indice, {
                        observacao: event.target.value,
                      })
                    }
                    maxLength={255}
                    fullWidth
                  />
                  <div className="pessoa-form__item-acoes">
                    <label className="pessoa-form__principal">
                      <input
                        type="radio"
                        name="telefone-principal"
                        checked={telefone.principal}
                        onChange={() => marcarPrincipal(setTelefones, indice)}
                      />
                      Principal
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="pessoa-form__remover"
                      title="Remover telefone"
                      aria-label="Remover telefone"
                      onClick={() => removerItem(setTelefones, indice)}
                      icon={<HugeiconsIcon icon={Delete02Icon} size={18} />}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          </section>
        </Card>

        <Card
          className="pessoa-form-card"
          padding="lg"
          radius="lg"
          shadow={false}
          hidden={etapaAtiva !== 2}
        >
          <section
            id="pessoa-etapa-panel-2"
            className="pessoa-form__etapa"
            role="tabpanel"
            aria-labelledby="pessoa-etapa-tab-2"
          >
          <div className="pessoa-form__secao-cabecalho">
            <h3>E-mails</h3>
            <Button
              variant="outline"
              size="sm"
              className="pessoa-form__adicionar"
              icon={
                <span className="pessoa-form__adicionar-icone">
                  <HugeiconsIcon icon={PlusIcon} size={10} stroke="2.5" />
                </span>
              }
              onClick={() =>
                setEmails((lista) => [
                  ...lista,
                  {
                    chave: crypto.randomUUID(),
                    id: null,
                    tipoEmailId: tiposEmail[0]?.value || "",
                    email: "",
                    observacao: "",
                    principal: lista.length === 0,
                  },
                ])
              }
            >
              Adicionar e-mail
            </Button>
          </div>

          {emails.length === 0 ? (
            <p className="pessoa-form__vazio">Nenhum e-mail cadastrado.</p>
          ) : (
            <div className="pessoa-form__lista">
              {emails.map((email, indice) => (
                <div key={email.chave} className="pessoa-form__item">
                  <Select
                    id={`email-tipo-${indice}`}
                    label={<LabelObrigatorio>TIPO</LabelObrigatorio>}
                    options={tiposEmail}
                    value={email.tipoEmailId}
                    required
                    onChange={(event) =>
                      alterarItem(setEmails, indice, {
                        tipoEmailId: event.target.value,
                      })
                    }
                    fullWidth
                  />
                  <Input
                    id={`email-endereco-${indice}`}
                    label={<LabelObrigatorio>E-MAIL</LabelObrigatorio>}
                    type="email"
                    placeholder="email@email.com"
                    value={email.email}
                    required
                    onChange={(event) =>
                      alterarItem(setEmails, indice, {
                        email: event.target.value,
                      })
                    }
                    maxLength={255}
                    fullWidth
                  />
                  <Input
                    id={`email-observacao-${indice}`}
                    label="OBSERVAÇÃO"
                    value={email.observacao}
                    onChange={(event) =>
                      alterarItem(setEmails, indice, {
                        observacao: event.target.value,
                      })
                    }
                    maxLength={255}
                    fullWidth
                  />
                  <div className="pessoa-form__item-acoes">
                    <label className="pessoa-form__principal">
                      <input
                        type="radio"
                        name="email-principal"
                        checked={email.principal}
                        onChange={() => marcarPrincipal(setEmails, indice)}
                      />
                      Principal
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="pessoa-form__remover"
                      title="Remover e-mail"
                      aria-label="Remover e-mail"
                      onClick={() => removerItem(setEmails, indice)}
                      icon={<HugeiconsIcon icon={Delete02Icon} size={18} />}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          </section>
        </Card>

        <Card
          className="pessoa-form-card"
          padding="lg"
          radius="lg"
          shadow={false}
          hidden={etapaAtiva !== 3}
        >
          <section
            id="pessoa-etapa-panel-3"
            className="pessoa-form__etapa"
            role="tabpanel"
            aria-labelledby="pessoa-etapa-tab-3"
          >
          <div className="pessoa-form__secao-cabecalho">
            <h3>Endereços</h3>
            <Button
              variant="outline"
              size="sm"
              className="pessoa-form__adicionar"
              icon={
                <span className="pessoa-form__adicionar-icone">
                  <HugeiconsIcon icon={PlusIcon} size={10} stroke="2.5" />
                </span>
              }
              onClick={() =>
                setEnderecos((lista) => [
                  ...lista,
                  {
                    chave: crypto.randomUUID(),
                    id: null,
                    tipoEnderecoId: tiposEndereco[0]?.value || "",
                    cep: "",
                    rua: "",
                    numero: "",
                    bairro: "",
                    complemento: "",
                    cidadeId: null,
                    cidadeNome: "",
                    estadoSigla: "",
                    erroCep: "",
                    principal: lista.length === 0,
                  },
                ])
              }
            >
              Adicionar endereço
            </Button>
          </div>

          {enderecos.length === 0 ? (
            <p className="pessoa-form__vazio">Nenhum endereço cadastrado.</p>
          ) : (
            <div className="pessoa-form__lista">
              {enderecos.map((endereco, indice) => (
                <div key={endereco.chave} className="pessoa-form__endereco">
                  <div className="pessoa-form__endereco-topo">
                    <label className="pessoa-form__principal">
                      <input
                        type="radio"
                        name="endereco-principal"
                        checked={endereco.principal}
                        onChange={() => marcarPrincipal(setEnderecos, indice)}
                      />
                      Principal
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="pessoa-form__remover"
                      title="Remover endereço"
                      aria-label="Remover endereço"
                      onClick={() => removerItem(setEnderecos, indice)}
                      icon={<HugeiconsIcon icon={Delete02Icon} size={18} />}
                    />
                  </div>

                  <div className="pessoa-form__grid">
                    <Select
                      id={`endereco-tipo-${indice}`}
                      label={<LabelObrigatorio>TIPO</LabelObrigatorio>}
                      options={tiposEndereco}
                      value={endereco.tipoEnderecoId}
                      required
                      onChange={(event) =>
                        alterarItem(setEnderecos, indice, {
                          tipoEnderecoId: event.target.value,
                        })
                      }
                      fullWidth
                    />
                    <div className="pessoa-form__campo">
                      <Input
                        id={`endereco-cep-${indice}`}
                        label="CEP"
                        inputMode="numeric"
                        placeholder="00000-000"
                        value={endereco.cep}
                        onChange={(event) =>
                          handleCepChange(indice, event.target.value)
                        }
                        fullWidth
                      />
                      {endereco.erroCep && (
                        <span className="pessoa-form__erro-campo" role="alert">
                          {endereco.erroCep}
                        </span>
                      )}
                    </div>
                    <div className="pessoa-form__campo pessoa-form__campo--largo">
                      <Input
                        id={`endereco-rua-${indice}`}
                        label="RUA"
                        value={endereco.rua}
                        onChange={(event) =>
                          alterarItem(setEnderecos, indice, {
                            rua: event.target.value,
                          })
                        }
                        maxLength={255}
                        fullWidth
                      />
                    </div>
                    <Input
                      id={`endereco-numero-${indice}`}
                      label="NÚMERO"
                      value={endereco.numero}
                      onChange={(event) =>
                        alterarItem(setEnderecos, indice, {
                          numero: event.target.value,
                        })
                      }
                      maxLength={20}
                      fullWidth
                    />
                    <Input
                      id={`endereco-bairro-${indice}`}
                      label="BAIRRO"
                      value={endereco.bairro}
                      onChange={(event) =>
                        alterarItem(setEnderecos, indice, {
                          bairro: event.target.value,
                        })
                      }
                      maxLength={100}
                      fullWidth
                    />
                    <div className="pessoa-form__campo pessoa-form__campo--largo">
                      <Input
                        id={`endereco-complemento-${indice}`}
                        label="COMPLEMENTO"
                        value={endereco.complemento}
                        onChange={(event) =>
                          alterarItem(setEnderecos, indice, {
                            complemento: event.target.value,
                          })
                        }
                        maxLength={100}
                        fullWidth
                      />
                    </div>
                    <Input
                      id={`endereco-cidade-${indice}`}
                      label="CIDADE"
                      value={endereco.cidadeNome}
                      placeholder="Preenchida pelo CEP"
                      readOnly
                      fullWidth
                    />
                    <Input
                      id={`endereco-estado-${indice}`}
                      label="ESTADO"
                      value={endereco.estadoSigla}
                      placeholder="Preenchido pelo CEP"
                      readOnly
                      fullWidth
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          </section>
        </Card>

        {erro && (
          <p className="pessoa-form__erro" role="alert">
            {erro}
          </p>
        )}

        <div className="pessoa-form__rodape">
          <Button
            variant="outline"
            onClick={() => navigate("/cadastros/pessoas")}
            disabled={salvando}
          >
            Cancelar
          </Button>
          <div className="pessoa-form__navegacao">
            <span className="pessoa-form__contador" aria-live="polite">
              {etapaAtiva + 1} de {ETAPAS_FORMULARIO.length}
            </span>
            {etapaAtiva > 0 && (
              <Button
                variant="outline"
                icon={<HugeiconsIcon icon={ArrowLeft01Icon} size={16} />}
                onClick={() => setEtapaAtiva((etapa) => etapa - 1)}
                disabled={salvando}
              >
                Anterior
              </Button>
            )}
            {etapaAtiva < ETAPAS_FORMULARIO.length - 1 && (
              <Button
                variant="outline"
                icon={<HugeiconsIcon icon={ArrowRight01Icon} size={16} />}
                iconPosition="right"
                onClick={() => setEtapaAtiva((etapa) => etapa + 1)}
                disabled={salvando}
              >
                Próximo
              </Button>
            )}
            <Button
              type="submit"
              icon={<HugeiconsIcon icon={SaveIcon} size={16} />}
              disabled={salvando}
            >
              {salvando ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default PessoaForm;