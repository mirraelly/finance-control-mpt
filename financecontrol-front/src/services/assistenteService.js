import axios from "axios";

const API_URL = "http://localhost:8080";

function getAuthConfig() {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
}

const relatorios = {
    VENCIMENTOS: { caminho: "vencimentos", arquivo: "relatorio-vencimentos.pdf" },
    LANCAMENTOS: { caminho: "lancamentos", arquivo: "relatorio-lancamentos.pdf" },
    SALDOS: { caminho: "saldos", arquivo: "relatorio-saldos.pdf" },
};

const assistenteService = {
    perguntar: async (mensagem, historico) => {
        const response = await axios.post(
            `${API_URL}/assistente/perguntar`,
            { mensagem, historico },
            getAuthConfig(),
        );
        return response.data;
    },

    executarAcao: async (acao) => {
        const { dados } = acao;

        if (acao.tipo === "CRIAR_LANCAMENTO") {
            const response = await axios.post(`${API_URL}/lancamentos`, dados.corpo, getAuthConfig());
            return response.data;
        }

        if (acao.tipo === "BAIXAR_PARCELA") {
            const operacao = dados.tipoConta === "pagar" ? "pagar" : "receber";
            const response = await axios.patch(
                `${API_URL}/contas-${dados.tipoConta}/parcelas/${dados.parcelaId}/${operacao}`,
                dados.corpo,
                getAuthConfig(),
            );
            return response.data;
        }

        if (acao.tipo === "CRIAR_CONTA") {
            const response = await axios.post(
                `${API_URL}/contas-${dados.tipoConta}`,
                dados.corpo,
                getAuthConfig(),
            );
            return response.data;
        }

        if (acao.tipo === "CRIAR_TRANSFERENCIA") {
            const response = await axios.post(`${API_URL}/transferencias`, dados.corpo, getAuthConfig());
            return response.data;
        }

        const cadastros = {
            CRIAR_CONTA_FINANCEIRA: "contas-financeiras",
            CRIAR_FORMA_PAGAMENTO: "formas-pagamento",
            CRIAR_CATEGORIA: "categorias",
        };

        if (cadastros[acao.tipo]) {
            const response = await axios.post(`${API_URL}/${cadastros[acao.tipo]}`, dados.corpo, getAuthConfig());
            return response.data;
        }

        throw new Error("Ação não suportada pelo assistente.");
    },

    baixarRelatorio: async (dados) => {
        const relatorio = relatorios[dados.relatorio];
        const params = Object.fromEntries(
            ["tipo", "dataInicio", "dataFim"]
                .filter((campo) => dados[campo])
                .map((campo) => [campo, dados[campo]]),
        );

        const response = await axios.get(`${API_URL}/relatorios/${relatorio.caminho}`, {
            ...getAuthConfig(),
            params,
            responseType: "blob",
        });

        const url = URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = url;
        link.download = relatorio.arquivo;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    },
};

export default assistenteService;
