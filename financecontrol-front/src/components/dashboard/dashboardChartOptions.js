export const dashboardChartBaseOptions = {
    chart: {
        backgroundColor: "transparent",
        height: 138,
        spacing: [8, 8, 18, 8],
        style: { fontFamily: "inherit" },
    },
    title: { text: null },
    credits: { enabled: false },
    xAxis: {
        lineWidth: 0,
        tickLength: 0,
        labels: {
            style: { color: "var(--text-secondary)", fontSize: "9px" },
        },
    },
    yAxis: {
        title: { text: null },
        gridLineColor: "rgba(148, 161, 180, 0.22)",
        labels: {
            style: { color: "var(--text-secondary)", fontSize: "9px" },
        },
    },
    legend: {
        verticalAlign: "bottom",
        y: 4,
        itemDistance: 12,
        itemStyle: {
            color: "var(--text-primary)",
            fontSize: "9px",
            fontWeight: "500",
        },
        symbolRadius: 4,
    },
    tooltip: {
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border)",
        borderRadius: 8,
        style: { color: "var(--text-primary)" },
    },
    plotOptions: {
        series: { animation: { duration: 350 } },
        column: { borderRadius: 4, groupPadding: 0.14, pointPadding: 0.08 },
    },
};

export const formatDashboardCurrency = (value) =>
    new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
    }).format(value);