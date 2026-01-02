import ClientsPageClient from "@/components/ClientsPageClient";
import { getClientsList } from "../actions/client-actions";
import { getServices } from "../actions/service-actions";
import { getTeam } from "../actions/team-actions";

export default async function ClientsPage() {
    const [clients, services, team] = await Promise.all([
        getClientsList(),
        getServices(),
        getTeam()
    ]);
    return <ClientsPageClient clients={clients} services={services} team={team} />;
}
