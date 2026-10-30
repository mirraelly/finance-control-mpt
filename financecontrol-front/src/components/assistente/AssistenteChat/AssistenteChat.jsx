import { useEffect, useRef, useState } from "react";
import {
  Delete02Icon,
  Download04Icon,
  HugeiconsIcon,
  MultiplicationSignIcon,
  SentIcon,
} from "../../../assets/icons";
import assistenteService from "../../../services/assistenteService";
import useToast from "../../common/Toast/useToast";
import { showApiErrorToast } from "../../../utils/toastErrors";
import "./AssistenteChat.css";

const LIMITE_HISTORICO = 20;
const LIMITE_MENSAGENS_SALVAS = 40;

const sugestoes = [
  "Quais contas vencem hoje?",
  "O que vence esta semana?",
  "Qual o saldo das minhas contas?",
  "Gere um relatório PDF dos lançamentos deste mês",
];

const mensagemInicial = {
  papel: "assistente",
  texto:
    "Olá! Sou o assistente do Finance Control. Posso consultar vencimentos, lançamentos e saldos, gerar relatórios em PDF e preparar lançamentos, baixas, contas e transferências para você confirmar.",
};

function chaveConversa() {
  return `financecontrol_assistente_${localStorage.getItem("userId") || "usuario"}`;
}

function carregarConversa() {
  try {
    const salva = JSON.parse(sessionStorage.getItem(chaveConversa()));
    return Array.isArray(salva) && salva.length > 0 ? salva : [mensagemInicial];
  } catch {
    return [mensagemInicial];
  }
}

function AssistenteChat() {
  const showToast = useToast();
  const [aberto, setAberto] = useState(false);
  const [mensagens, setMensagens] = useState(carregarConversa);
  const [texto, setTexto] = useState("");
  const [aguardando, setAguardando] = useState(false);
  const [acaoEmExecucao, setAcaoEmExecucao] = useState(null);
  const listaRef = useRef(null);
  const campoRef = useRef(null);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        chaveConversa(),
        JSON.stringify(mensagens.slice(-LIMITE_MENSAGENS_SALVAS)),
      );
    } catch {
      return;
    }
  }, [mensagens]);

  useEffect(() => {
    if (!aberto) return;
    listaRef.current?.scrollTo({ top: listaRef.current.scrollHeight });
  }, [aberto, mensagens, aguardando]);

  useEffect(() => {
    if (!aberto) return undefined;
    campoRef.current?.focus();

    const fecharComEsc = (event) => {
      if (event.key === "Escape") setAberto(false);
    };
    document.addEventListener("keydown", fecharComEsc);
    return () => document.removeEventListener("keydown", fecharComEsc);
  }, [aberto]);

  const enviar = async (mensagemInformada) => {
    const mensagem = (mensagemInformada ?? texto).trim();
    if (!mensagem || aguardando) return;

    const ultimaAcao = mensagens.findLastIndex((item) => item.acoes?.length > 0);
    const historico = mensagens
      .slice(ultimaAcao + 1)
      .filter((item) => item.texto && item.texto !== mensagemInicial.texto)
      .slice(-LIMITE_HISTORICO)
      .map(({ papel, texto: conteudo }) => ({ papel, texto: conteudo }));

    setTexto("");
    setMensagens((atuais) => [...atuais, { papel: "usuario", texto: mensagem }]);
    setAguardando(true);

    try {
      const resposta = await assistenteService.perguntar(mensagem, historico);
      setMensagens((atuais) => [
        ...atuais,
        {
          papel: "assistente",
          texto: resposta.resposta,
          acoes: (resposta.acoes || []).map((acao, indice) => ({
            ...acao,
            chave: `${Date.now()}-${indice}`,
            situacao: "pendente",
          })),
        },
      ]);
    } catch (error) {
      setMensagens((atuais) => [
        ...atuais,
        {
          papel: "assistente",
          texto:
            error?.response?.data?.erro ||
            "Não foi possível falar com o assistente agora. Tente novamente em instantes.",
          erro: true,
        },
      ]);
    } finally {
      setAguardando(false);
    }
  };

  const atualizarAcao = (chave, alteracoes) => {
    setMensagens((atuais) =>
      atuais.map((mensagem) =>
        mensagem.acoes?.some((acao) => acao.chave === chave)
          ? {
              ...mensagem,
              acoes: mensagem.acoes.map((acao) =>
                acao.chave === chave ? { ...acao, ...alteracoes } : acao,
              ),
            }
          : mensagem,
      ),
    );
  };

  const confirmarAcao = async (acao) => {
    setAcaoEmExecucao(acao.chave);
    try {
      if (acao.tipo === "BAIXAR_RELATORIO") {
        await assistenteService.baixarRelatorio(acao.dados);
        return;
      }
      await assistenteService.executarAcao(acao);
      atualizarAcao(acao.chave, { situacao: "concluida" });
      showToast({
        type: "success",
        title: acao.titulo,
        message: "Registro salvo com sucesso.",
      });
    } catch (error) {
      showApiErrorToast(
        showToast,
        error,
        acao.tipo === "BAIXAR_RELATORIO"
          ? "Não foi possível baixar o relatório."
          : "Não foi possível concluir a ação.",
      );
    } finally {
      setAcaoEmExecucao(null);
    }
  };

  const limparConversa = () => {
    setMensagens([mensagemInicial]);
    setTexto("");
  };

  const aoPressionarTecla = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      enviar();
    }
  };

  return (
    <>
      {aberto && (
        <section
          className="assistente-chat"
          role="dialog"
          aria-label="Assistente Finance Control"
        >
          <header className="assistente-chat__cabecalho">
            <span className="assistente-chat__logo" aria-hidden="true">
              FC
            </span>
            <div className="assistente-chat__titulo">
              <strong>Assistente Finance Control</strong>
              <span>Consultas e ações do sistema</span>
            </div>
            <button
              type="button"
              className="assistente-chat__icone"
              onClick={limparConversa}
              title="Limpar conversa"
              aria-label="Limpar conversa"
            >
              <HugeiconsIcon icon={Delete02Icon} size={18} />
            </button>
            <button
              type="button"
              className="assistente-chat__icone"
              onClick={() => setAberto(false)}
              title="Fechar assistente"
              aria-label="Fechar assistente"
            >
              <HugeiconsIcon icon={MultiplicationSignIcon} size={18} />
            </button>
          </header>

          <div className="assistente-chat__mensagens" ref={listaRef}>
            {mensagens.map((mensagem, indice) => (
              <div
                key={indice}
                className={`assistente-chat__mensagem assistente-chat__mensagem--${mensagem.papel} ${
                  mensagem.erro ? "assistente-chat__mensagem--erro" : ""
                }`}
              >
                {mensagem.texto && (
                  <p className="assistente-chat__balao">{mensagem.texto}</p>
                )}
                {mensagem.acoes?.map((acao) => (
                  <div className="assistente-chat__acao" key={acao.chave}>
                    <strong>{acao.titulo}</strong>
                    {acao.resumo?.length > 0 && (
                      <dl>
                        {acao.resumo.map((item) => (
                          <div key={`${item.rotulo}-${item.valor}`}>
                            <dt>{item.rotulo}</dt>
                            <dd>{item.valor}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    {acao.tipo === "BAIXAR_RELATORIO" ? (
                      <div className="assistente-chat__acao-botoes">
                        <button
                          type="button"
                          className="assistente-chat__botao assistente-chat__botao--primario"
                          onClick={() => confirmarAcao(acao)}
                          disabled={acaoEmExecucao === acao.chave}
                        >
                          <HugeiconsIcon icon={Download04Icon} size={16} />
                          {acaoEmExecucao === acao.chave ? "Gerando..." : "Baixar PDF"}
                        </button>
                      </div>
                    ) : acao.situacao === "pendente" ? (
                      <div className="assistente-chat__acao-botoes">
                        <button
                          type="button"
                          className="assistente-chat__botao"
                          onClick={() => atualizarAcao(acao.chave, { situacao: "cancelada" })}
                          disabled={acaoEmExecucao === acao.chave}
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          className="assistente-chat__botao assistente-chat__botao--primario"
                          onClick={() => confirmarAcao(acao)}
                          disabled={acaoEmExecucao === acao.chave}
                        >
                          {acaoEmExecucao === acao.chave ? "Salvando..." : "Confirmar"}
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`assistente-chat__situacao assistente-chat__situacao--${acao.situacao}`}
                      >
                        {acao.situacao === "concluida" ? "Concluído" : "Cancelado"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}

            {mensagens.length === 1 && !aguardando && (
              <div className="assistente-chat__sugestoes">
                {sugestoes.map((sugestao) => (
                  <button
                    type="button"
                    key={sugestao}
                    onClick={() => enviar(sugestao)}
                  >
                    {sugestao}
                  </button>
                ))}
              </div>
            )}

            {aguardando && (
              <div className="assistente-chat__mensagem assistente-chat__mensagem--assistente">
                <p className="assistente-chat__balao assistente-chat__digitando">
                  Digitando...
                </p>
              </div>
            )}
          </div>

          <form
            className="assistente-chat__formulario"
            onSubmit={(event) => {
              event.preventDefault();
              enviar();
            }}
          >
            <textarea
              ref={campoRef}
              value={texto}
              onChange={(event) => setTexto(event.target.value)}
              onKeyDown={aoPressionarTecla}
              placeholder="Pergunte sobre suas contas..."
              rows={1}
              maxLength={1000}
              aria-label="Mensagem para o assistente"
              disabled={aguardando}
            />
            <button
              type="submit"
              className="assistente-chat__enviar"
              disabled={aguardando || !texto.trim()}
              aria-label="Enviar mensagem"
              title="Enviar"
            >
              <HugeiconsIcon icon={SentIcon} size={18} />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className={`assistente-chat__flutuante ${
          aberto ? "assistente-chat__flutuante--aberto" : ""
        }`}
        onClick={() => setAberto((atual) => !atual)}
        aria-label={aberto ? "Fechar assistente" : "Abrir assistente"}
        title="Assistente Finance Control"
      >
        FC
      </button>
    </>
  );
}

export default AssistenteChat;
