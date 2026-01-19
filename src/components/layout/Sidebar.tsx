
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FileText,
    UploadCloud,
    LogOut,
    GraduationCap
} from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
    { name: "Ringkasan", href: "/dashboard", icon: LayoutDashboard },
    { name: "Pusat Laporan", href: "/dashboard/reports", icon: FileText },
    { name: "Upload Data", href: "/dashboard/upload", icon: UploadCloud },
];

export function Sidebar({ className = "" }: { className?: string }) {
    const pathname = usePathname();

    const handleLogout = async () => {
        await signOut({ redirectTo: "/" });
    };

    return (
        <aside className={`flex flex-col h-full bg-white border-r border-border ${className}`}>
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                    <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="font-bold text-lg tracking-tight text-slate-900">Monitoring IPK</h1>
                    <p className="text-xs text-slate-500 font-medium tracking-wide">DASHBOARD UPM</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                                ${isActive
                                    ? "bg-indigo-50 text-indigo-700 font-semibold shadow-sm"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                }
                            `}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-border">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 group"
                >
                    <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
                    <span className="font-medium">Keluar</span>
                </button>
            </div>
        </aside>
    );
}
