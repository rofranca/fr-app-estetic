import { SettingsForm } from "@/components/SettingsForm";
import { getOrganization } from "@/app/actions/settings-actions";

export default async function SettingsPage() {
    const { organization } = await getOrganization();

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Configurações</h1>
                <p className="text-sm text-slate-500 mt-1 font-medium">Gerencie os dados da sua empresa</p>
            </div>

            <div className="max-w-4xl">
                {organization && <SettingsForm organization={organization} />}
            </div>
        </div>
    );
}
