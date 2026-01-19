
'use client';

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, X } from "lucide-react";

export function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-border z-40 flex items-center px-4 justify-between shadow-sm">
                <span className="font-bold text-lg text-slate-900">Monitoring IPK</span>
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Drawer */}
            <div className={`
                fixed top-0 bottom-0 left-0 w-72 bg-white z-[60] transform transition-transform duration-300 ease-out shadow-2xl lg:hidden
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
                <div className="absolute top-4 right-4">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 text-slate-400 hover:text-slate-900"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <Sidebar className="border-none" />
            </div>
        </>
    );
}
