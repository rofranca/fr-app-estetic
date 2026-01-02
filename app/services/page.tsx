import { getServices } from "@/app/actions/service-actions";
import ServicesPageClient from "@/components/ServicesPageClient";

export default async function ServicesPage() {
    const services = await getServices();

    return <ServicesPageClient initialServices={services} />;
}
