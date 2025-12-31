import { MobileSidebar } from "@/components/AppSidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function Header() {
    return (
        <div className="flex items-center p-4 border-b">
            <MobileSidebar />
            <div className="flex w-full justify-end">
                <div className="flex items-center gap-x-4">
                    <span className="text-sm text-gray-500 font-medium">Olá, Doutora</span>
                    <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </div>
    );
}
