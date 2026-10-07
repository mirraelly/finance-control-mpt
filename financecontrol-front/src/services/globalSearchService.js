import categoriaService from "./categoriaService";
import contaFinanceiraService from "./contaFinanceiraService";
import contasPagarReceberService from "./contasPagarReceberService";
import lancamentoFinanceiroService from "./lancamentoFinanceiroService";
import loginLogService from "./loginLogService";
import { pessoaService } from "./pessoaService";
import usuarioService from "./usuarioService";

const PAGE_RESULTS = [
  { label: "Dashboard", path: "/dashboard", roles: ["USER"] },
  {
    label: "Transações",
    path: "/movimentacoes/transacoes",
    roles: ["USER"],
  },
  {
    label: "Pagar e Receber",
    path: "/movimentacoes/pagar-e-receber",
    roles: ["USER"],
  },
  { label: "Perfil", path: "/perfil", roles: ["USER", "SUPERADMIN"] },
  { label: "Pessoas", path: "/cadastros/pessoas", roles: ["USER", "SUPERADMIN"] },
  { label: "Categorias", path: "/cadastros/categorias", roles: ["USER", "SUPERADMIN"] },
  {
    label: "Contas financeiras",
    path: "/contas/contas-financeiras",
    roles: ["USER", "SUPERADMIN"],
  },
  {
    label: "Contas a pagar",
    path: "/contas/contas-pagar",
    roles: ["USER", "SUPERADMIN"],
  },
  {
    label: "Contas a receber",
    path: "/contas/contas-receber",
    roles: ["USER", "SUPERADMIN"],
  },
  {
    label: "Notificações",
    path: "/cadastros/notificacoes",
    roles: ["USER", "SUPERADMIN"],
  },
  { label: "Usuários", path: "/admin/usuarios", roles: ["SUPERADMIN"] },
  { label: "Logs de login", path: "/admin/logs-login", roles: ["SUPERADMIN"] },
];

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

function getPageResults(term, role) {
  const normalizedTerm = normalizeSearchText(term);
  return PAGE_RESULTS.filter(
    (page) =>
      page.roles.includes(role) &&
      normalizeSearchText(page.label).includes(normalizedTerm),
  ).map((page) => ({
    ...page,
    type: "Página",
    detail: "Abrir tela",
    key: `page-${page.path}`,
  }));
}

function getItems(response) {
  return Array.isArray(response) ? response : response?.content || [];
}

function mergePages(...pages) {
  const content = new Map();
  pages.forEach((page) =>
    getItems(page).forEach((item) => content.set(item.id, item)),
  );
  return { content: [...content.values()] };
}

function toSearchResults(response, { type, path, getLabel, getDetail }, term) {
  const normalizedTerm = normalizeSearchText(term);
  return getItems(response)
    .filter((item) => item.id && getLabel(item))
    .map((item) => ({
      key: `${type}-${item.id}`,
      id: item.id,
      type,
      path,
      label: getLabel(item),
      detail: getDetail(item),
    }))
    .filter(
      (result) =>
        normalizeSearchText(`${result.label} ${result.detail}`).includes(
          normalizedTerm,
        ),
    );
}

const searchSources = [
  {
    type: "Transação",
    path: "/movimentacoes/transacoes",
    search: (term) =>
      lancamentoFinanceiroService.listarLancamentos({
        page: 0,
        size: 4,
        descricao: term,
      }),
    getLabel: (item) => item.descricao,
    getDetail: (item) =>
      [item.categoriaNome, item.contaFinanceiraNome]
        .filter(Boolean)
        .join(" · ") || "Lançamento financeiro",
    roles: ["USER"],
  },
  {
    type: "Pessoa",
    path: "/cadastros/pessoas",
    search: async (term) => {
      const searches = [
        pessoaService.listarPessoas({ page: 0, size: 4, nome: term }),
      ];
      const documentTerm = term.replace(/\D/g, "");
      if (documentTerm.length >= 2) {
        searches.push(
          pessoaService.listarPessoas({
            page: 0,
            size: 4,
            documento: documentTerm,
          }),
        );
      }
      return mergePages(...(await Promise.all(searches)));
    },
    getLabel: (item) => item.nome,
    getDetail: (item) => item.documento || "Cadastro de pessoa",
    roles: ["USER", "SUPERADMIN"],
  },
  {
    type: "Categoria",
    path: "/cadastros/categorias",
    search: (term) => categoriaService.listar({ page: 0, size: 4, nome: term }),
    getLabel: (item) => item.nome,
    getDetail: (item) => item.descricao || "Categoria",
    roles: ["USER", "SUPERADMIN"],
  },
  {
    type: "Conta financeira",
    path: "/contas/contas-financeiras",
    search: (term) =>
      contaFinanceiraService.listar({ page: 0, size: 4, nome: term }),
    getLabel: (item) => item.nome,
    getDetail: (item) => item.tipo || "Conta financeira",
    roles: ["USER", "SUPERADMIN"],
  },
  {
    type: "Conta a pagar",
    path: "/contas/contas-pagar",
    search: (term) =>
      contasPagarReceberService.listar("pagar", {
        page: 0,
        size: 4,
        descricao: term,
      }),
    getLabel: (item) => item.descricao,
    getDetail: (item) => item.pessoaNome || "Conta a pagar",
    roles: ["USER", "SUPERADMIN"],
  },
  {
    type: "Conta a receber",
    path: "/contas/contas-receber",
    search: (term) =>
      contasPagarReceberService.listar("receber", {
        page: 0,
        size: 4,
        descricao: term,
      }),
    getLabel: (item) => item.descricao,
    getDetail: (item) => item.pessoaNome || "Conta a receber",
    roles: ["USER", "SUPERADMIN"],
  },
  {
    type: "Usuário",
    path: "/admin/usuarios",
    search: async (term) => {
      const [byName, byEmail] = await Promise.all([
        usuarioService.listarUsuarios({ page: 0, size: 4, nome: term }),
        usuarioService.listarUsuarios({ page: 0, size: 4, email: term }),
      ]);
      return mergePages(byName, byEmail);
    },
    getLabel: (item) => item.nome,
    getDetail: (item) => item.email,
    roles: ["SUPERADMIN"],
  },
  {
    type: "Log de login",
    path: "/admin/logs-login",
    search: (term) =>
      loginLogService.listarLogs({ page: 0, size: 4, email: term }),
    getLabel: (item) => item.email,
    getDetail: (item) =>
      [item.usuarioNome, item.sucesso ? "Sucesso" : "Falha"]
        .filter(Boolean)
        .join(" · "),
    roles: ["SUPERADMIN"],
  },
];

const globalSearchService = {
  async buscar(term, role) {
    const normalizedTerm = term.trim();
    if (normalizedTerm.length < 2) {
      return { results: [], failedSources: [] };
    }

    const sources = searchSources.filter((source) => source.roles.includes(role));
    const responses = await Promise.allSettled(
      sources.map((source) => source.search(normalizedTerm)),
    );
    const results = getPageResults(normalizedTerm, role);
    const failedSources = [];

    responses.forEach((response, index) => {
      if (response.status === "rejected") {
        console.error(`Erro na busca global (${sources[index].type}):`, response.reason);
        failedSources.push(sources[index].type);
        return;
      }

      results.push(
        ...toSearchResults(response.value, sources[index], normalizedTerm),
      );
    });

    return { results: results.slice(0, 12), failedSources };
  },
};

export default globalSearchService;
