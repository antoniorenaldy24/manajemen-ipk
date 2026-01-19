
'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface StatusCardProps {
    status: 'AMAN' | 'WASPADA' | 'KRITIS';
    ipk: number;
    name: string;
    nim: string;
}

const THEME = {
    AMAN: {
        bg: 'from-emerald-50 to-emerald-100',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
        badgeBg: 'bg-emerald-100',
        badgeBorder: 'border-emerald-200',
        badgeText: 'text-emerald-800'
    },
    WASPADA: {
        bg: 'from-amber-50 to-amber-100',
        border: 'border-amber-200',
        text: 'text-amber-700',
        badgeBg: 'bg-amber-100',
        badgeBorder: 'border-amber-200',
        badgeText: 'text-amber-800'
    },
    KRITIS: {
        bg: 'from-rose-50 to-rose-100',
        border: 'border-rose-200',
        text: 'text-rose-700',
        badgeBg: 'bg-rose-100',
        badgeBorder: 'border-rose-200',
        badgeText: 'text-rose-800'
    }
};

export default function StatusCard({ status, ipk, name, nim }: StatusCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const ipkRef = useRef<HTMLDivElement>(null);

    const theme = THEME[status];

    useEffect(() => {
        const ctx = gsap.context(() => {
            // 1. Card Entry
            gsap.from(cardRef.current, {
                y: 50,
                opacity: 0,
                duration: 1,
                ease: 'expo.out'
            });

            // 2. IPK Counter Animation
            gsap.from(ipkRef.current, {
                textContent: 0,
                duration: 1.5,
                ease: "power2.out",
                snap: { textContent: 0.01 },
                stagger: 1,
                // Custom plugin logic usually needed for text, 
                // but for simple cases we can just animate opacity or scale if textContent plugin missing.
                // Let's stick to Scale/Opacity to be safe without paid plugins.
                scale: 0.5,
                opacity: 0
            });

        }, cardRef);

        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={cardRef}
            className={`relative p-8 rounded-3xl border ${theme.border} bg-gradient-to-br ${theme.bg} overflow-hidden min-h-[300px] flex flex-col justify-between`}
        >
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/60 rounded-full blur-3xl mix-blend-overlay" />

            <div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${theme.badgeBg} ${theme.badgeBorder} border mb-6 ${theme.badgeText} shadow-sm`}>
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                    <span className="text-xs font-bold tracking-wider uppercase">{status} CHECK</span>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-1">{name}</h2>
                <p className="text-slate-500 font-mono text-sm tracking-wide">{nim}</p>
            </div>

            <div className="mt-8">
                <p className="text-sm text-slate-500 uppercase tracking-widest mb-1">Indeks Prestasi Kumulatif</p>
                <div className="flex items-baseline gap-2">
                    <span
                        ref={ipkRef}
                        className={`text-7xl font-bold tracking-tighter ${theme.text}`}
                    >
                        {ipk.toFixed(2)}
                    </span>
                    <span className="text-xl text-slate-400 font-medium">/ 4.00</span>
                </div>
            </div>
        </div>
    );
}
