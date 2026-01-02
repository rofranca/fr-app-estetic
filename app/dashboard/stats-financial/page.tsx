'use server';

import { getFinancialSummary } from "@/app/actions/report-actions";
import StatsFinancialClient from "@/components/StatsFinancialClient";

export default async function StatsFinancialPage() {
    const summary = await getFinancialSummary();

    return (
        <StatsFinancialClient
            summary={summary}
        />
    );
}
