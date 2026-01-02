import { getCategories } from "@/app/actions/financial-actions";
import CategoriesPageClient from "@/components/CategoriesPageClient";

export default async function CategoriesPage() {
    const categories = await getCategories();

    return (
        <div className="h-full">
            <CategoriesPageClient initialCategories={categories} />
        </div>
    );
}
