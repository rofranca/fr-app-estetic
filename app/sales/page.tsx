import { getSaleData } from "@/app/actions/sales-actions";
import SalesPageClient from "@/components/SalesPageClient";

export default async function SalesPage() {
    const data = await getSaleData();

    return (
        <div className="h-full">
            <SalesPageClient {...data} />
        </div>
    );
}
