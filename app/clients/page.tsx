import ClientsPageClient from "@/components/ClientsPageClient";
import { getClientsList } from "../actions/client-actions";

export default async function ClientsPage() {
    const clients = await getClientsList();
    return <ClientsPageClient clients={clients} />;
}
