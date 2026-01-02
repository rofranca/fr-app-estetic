import { getSaleData, getSalesToday } from "@/app/actions/sales-actions";
import SalesPageClient from "@/components/SalesPageClient";

export default async function SalesPage() {
    const data = await getSaleData();
    const todayData = await getSalesToday();

    return (
        <div className="h-full">
            <SalesPageClient
                {...data}
                todaySales={todayData.sales}
                todaySummary={todayData.summary}
            />
        </div>
    );
}
