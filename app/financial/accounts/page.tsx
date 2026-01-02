import { getAccounts } from "@/app/actions/financial-actions";
import AccountsPageClient from "@/components/AccountsPageClient";

export default async function AccountsPage() {
    const accounts = await getAccounts();

    return (
        <div className="h-full">
            <AccountsPageClient initialAccounts={accounts} />
        </div>
    );
}
