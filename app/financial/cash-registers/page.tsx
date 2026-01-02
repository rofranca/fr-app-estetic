import { getOpenCashRegister, getCashRegisterHistory } from "@/app/actions/financial-actions";
import CashRegistersPageClient from "@/components/CashRegistersPageClient";

export default async function CashRegistersPage() {
    const openRegister = await getOpenCashRegister();
    const history = await getCashRegisterHistory();

    return (
        <div className="h-full">
            <CashRegistersPageClient initialOpenRegister={openRegister} history={history} />
        </div>
    );
}
