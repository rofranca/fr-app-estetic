import { getAllBudgets } from "@/app/actions/budget-actions";
import { getServices } from "@/app/actions/service-actions";
import { getTeam } from "@/app/actions/team-actions";
import { getClientsList } from "@/app/actions/client-actions";
import BudgetsPageClient from "@/components/BudgetsPageClient";

export default async function BudgetsPage() {
    const [budgets, services, team, clients] = await Promise.all([
        getAllBudgets(),
        getServices(),
        getTeam(),
        getClientsList()
    ]);

    return (
        <BudgetsPageClient
            initialBudgets={budgets}
            services={services}
            team={team}
            clients={clients}
        />
    );
}
