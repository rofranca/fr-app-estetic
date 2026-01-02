import { getSaleData, getSalesToday } from "@/app/actions/sales-actions";
import SalesPageClient from "@/components/SalesPageClient";
import { getOrganization } from "@/app/actions/settings-actions";

export default async function SalesPage() {
    const data = await getSaleData();
    const todayData = await getSalesToday();
    const { organization } = await getOrganization();

    return <SalesPageClient
        {...data}
        todaySales={todayData.sales}
        todaySummary={todayData.summary}
        organization={organization}
    />;
}
