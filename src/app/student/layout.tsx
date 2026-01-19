
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function StudentLayout({ children }: { children: ReactNode }) {
    const session = await auth();

    if (!session) redirect("/login");
    if (session.user.role !== "MAHASISWA") redirect("/"); // Redirect unauthorized roles

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500/30">
            {/* Simple Student Navbar */}
            <nav className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-white sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10v6" /><path d="M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
                    </div>
                    <span className="font-bold tracking-tight text-lg text-slate-900">Monitoring IPK</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500 hidden sm:block">Selamat Datang, <span className="font-semibold text-slate-900">{session.user.name}</span></span>
                    {/* Logout */}
                    <form action={async () => {
                        "use server";
                        const { signOut } = await import("@/auth");
                        await signOut();
                    }}>
                        <button className="text-sm font-medium hover:text-red-600 text-slate-500 transition-colors">
                            Keluar
                        </button>
                    </form>
                </div>
            </nav>

            <main className="p-6 md:p-12 max-w-7xl mx-auto">
                {children}
            </main>
        </div>
    );
}
