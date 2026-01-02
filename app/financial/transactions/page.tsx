import {
    getTransactions,
    getCategories,
    getAccounts,
    getPaymentMethods,
    checkAndCreateRecurringTransactions
} from "@/app/actions/financial-actions";
import TransactionsPageClient from "@/components/TransactionsPageClient";

export default async function TransactionsPage() {
    // Run recurring checker to ensure everything is up to date
    await checkAndCreateRecurringTransactions();

    const transactions = await getTransactions();
    const categories = await getCategories();
    const accounts = await getAccounts();
    const paymentMethods = await getPaymentMethods();

    return (
        <div className="h-full">
            <TransactionsPageClient
                initialTransactions={transactions}
                categories={categories}
                accounts={accounts}
                paymentMethods={paymentMethods}
            />
        </div>
    );
}
