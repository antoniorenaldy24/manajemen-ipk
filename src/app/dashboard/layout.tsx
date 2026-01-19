
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block fixed inset-y-0 left-0 w-64 z-30">
                <Sidebar />
            </div>

            {/* Mobile Nav */}
            <MobileNav />

            {/* Main Content */}
            <main className="lg:pl-64 min-h-screen transition-all">
                <div className="container mx-auto p-4 lg:p-8 pt-20 lg:pt-8 max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
