'use server';

import { getFinancialSummary, getMonthlyRevenueChart, getUpcomingBirthdays } from "../actions/report-actions";
import ReportsDashboardClient from "@/components/ReportsDashboardClient";

export default async function ReportsPage() {
    const [summary, chartData, birthdays] = await Promise.all([
        getFinancialSummary(),
        getMonthlyRevenueChart(),
        getUpcomingBirthdays()
    ]);

    return (
        <ReportsDashboardClient
            summary={summary}
            chartData={chartData}
            birthdays={birthdays}
        />
    );
}
