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

export const dashboardMonthlyData = [
    { key: "2025-01", revenue: 4200, expenses: 2800 },
    { key: "2025-02", revenue: 4400, expenses: 2900 },
    { key: "2025-03", revenue: 4100, expenses: 3000 },
    { key: "2025-04", revenue: 4600, expenses: 3100 },
    { key: "2025-05", revenue: 4700, expenses: 3200 },
    { key: "2025-06", revenue: 4500, expenses: 3050 },
    { key: "2025-07", revenue: 4800, expenses: 3300 },
    { key: "2025-08", revenue: 4900, expenses: 3250 },
    { key: "2025-09", revenue: 4600, expenses: 3150 },
    { key: "2025-10", revenue: 4500, expenses: 3000 },
    { key: "2025-11", revenue: 4300, expenses: 3300 },
    { key: "2025-12", revenue: 4700, expenses: 3400 },
    { key: "2026-01", revenue: 5100, expenses: 3200 },
    { key: "2026-02", revenue: 4900, expenses: 3700 },
    { key: "2026-03", revenue: 5000, expenses: 3600 },
    { key: "2026-04", revenue: 4800, expenses: 3200 },
    { key: "2026-05", revenue: 5200, expenses: 3500 },
    { key: "2026-06", revenue: 4600, expenses: 3100 },
    { key: "2026-07", revenue: 6100, expenses: 3900 },
    { key: "2026-08", revenue: 5400, expenses: 3600 },
    { key: "2026-09", revenue: 5800, expenses: 3420 },
];

export function getCurrentMonthKey(date = new Date()) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${date.getFullYear()}-${month}`;
}

function getMonthIndex(monthKey) {
    const [year, month] = monthKey.split("-").map(Number);
    return year * 12 + month - 1;
}

export function filterDashboardMonths(
    rows,
    period,
    startDate = "",
    endDate = "",
    date = new Date(),
) {
    const currentIndex = getMonthIndex(getCurrentMonthKey(date));
    let startIndex = currentIndex;
    let endIndex = currentIndex;

    if (period === "previousMonth") {
        startIndex -= 1;
        endIndex -= 1;
    } else if (["3", "6", "12"].includes(period)) {
        startIndex -= Number(period) - 1;
    } else if (period === "year") {
        startIndex = Math.floor(currentIndex / 12) * 12;
    } else if (period === "previousYear") {
        startIndex = Math.floor(currentIndex / 12) * 12 - 12;
        endIndex = startIndex + 11;
    } else if (period === "custom") {
        if (!startDate || !endDate || startDate > endDate) return [];
        startIndex = getMonthIndex(startDate.slice(0, 7));
        endIndex = getMonthIndex(endDate.slice(0, 7));
    }

    return rows.filter((row) => {
        const monthIndex = getMonthIndex(row.key);
        return monthIndex >= startIndex && monthIndex <= endIndex;
    });
}