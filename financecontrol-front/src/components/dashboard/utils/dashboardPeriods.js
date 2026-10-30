export const dashboardMonthLabels = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
];

export function getCurrentMonthKey(date = new Date()) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${date.getFullYear()}-${month}`;
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

const MAX_CUSTOM_PERIOD_MONTHS = 24;

export function getCustomPeriodError(startDate = "", endDate = "") {
    if (!startDate || !endDate || startDate > endDate) {
        return "A data inicial deve ser anterior à data final.";
    }

    const [startYear, startMonth] = startDate.split("-").map(Number);
    const [endYear, endMonth] = endDate.split("-").map(Number);
    const months = (endYear - startYear) * 12 + endMonth - startMonth + 1;

    return months > MAX_CUSTOM_PERIOD_MONTHS
        ? `O período máximo é de ${MAX_CUSTOM_PERIOD_MONTHS} meses.`
        : "";
}

export function getDashboardPeriodRange(
    period,
    startDate = "",
    endDate = "",
    date = new Date(),
) {
    if (period === "custom") {
        if (getCustomPeriodError(startDate, endDate)) return null;
        return { dataInicio: startDate, dataFim: endDate };
    }

    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth();
    let start = new Date(currentYear, currentMonth, 1);
    let end = new Date(currentYear, currentMonth + 1, 0);

    if (period === "previousMonth") {
        start = new Date(currentYear, currentMonth - 1, 1);
        end = new Date(currentYear, currentMonth, 0);
    } else if (["3", "6", "12"].includes(period)) {
        start = new Date(currentYear, currentMonth - Number(period) + 1, 1);
    } else if (period === "year") {
        start = new Date(currentYear, 0, 1);
        end = new Date(currentYear, 11, 31);
    } else if (period === "previousYear") {
        start = new Date(currentYear - 1, 0, 1);
        end = new Date(currentYear - 1, 11, 31);
    }

    return { dataInicio: formatDate(start), dataFim: formatDate(end) };
}
