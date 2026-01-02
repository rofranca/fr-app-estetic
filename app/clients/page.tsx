import ClientsPageClient from "@/components/ClientsPageClient";
import { getClientsList } from "../actions/client-actions";
import { getServices } from "../actions/service-actions";

export default async function ClientsPage() {
    const [clients, services] = await Promise.all([
        getClientsList(),
        getServices()
    ]);
    return <ClientsPageClient clients={clients} services={services} />;
}
