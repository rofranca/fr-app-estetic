import { getPaymentMethods } from "@/app/actions/financial-actions";
import PaymentMethodsPageClient from "@/components/PaymentMethodsPageClient";

export default async function PaymentMethodsPage() {
    const methods = await getPaymentMethods();

    return (
        <div className="h-full">
            <PaymentMethodsPageClient initialMethods={methods} />
        </div>
    );
}
