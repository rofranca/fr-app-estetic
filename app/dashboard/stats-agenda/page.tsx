'use server';

import { getServiceDistribution, getSalesDistribution } from "@/app/actions/report-actions";
import StatsAgendaClient from "@/components/StatsAgendaClient";

export default async function StatsAgendaPage() {
    const [serviceData, salesData] = await Promise.all([
        getServiceDistribution(),
        getSalesDistribution()
    ]);

    return (
        <StatsAgendaClient
            serviceData={serviceData}
            salesData={salesData}
        />
    );
}
