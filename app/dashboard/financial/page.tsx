'use server';

import { getFinancialSummary, getDailyCashFlow } from "@/app/actions/report-actions";
import FinancialDashboardClient from "@/components/FinancialDashboardClient";

export default async function FinancialDashboardPage() {
    const [summary, dailyFlow] = await Promise.all([
        getFinancialSummary(),
        getDailyCashFlow()
    ]);

    return (
        <FinancialDashboardClient
            summary={summary}
            dailyFlow={dailyFlow}
        />
    );
}
