
'use client';

import { useState } from "react";
import { generateRiskReportAction } from "@/actions/reports";
import { Loader2, FileDown, AlertCircle } from "lucide-react";

export default function ReportGeneratorPanel() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await generateRiskReportAction(2.75); // Default threshold

            if (!result.success || !result.data) {
                throw new Error(result.error || "Unknown error occurred");
            }

            // Convert Base64 to Blob and Download
            // 1. Decode Base64
            const byteCharacters = atob(result.data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: "application/pdf" });

            // 2. Trigger Download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = result.filename || "report.pdf";
            document.body.appendChild(a);
            a.click();

            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileDown className="w-5 h-5 text-teal-400" />
                    Generator Laporan
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                    Unduh laporan resmi mahasiswa beresiko dengan Tanda Tangan Digital (QR).
                </p>
            </div>

            {error && (
                <div className="p-3 bg-red-900/40 border border-red-500/50 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-200">{error}</p>
                </div>
            )}

            <div className="flex flex-wrap gap-3">
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <FileDown className="w-4 h-4" />
                            Download PDF (Rawan)
                        </>
                    )}
                </button>

                {/* Placeholder for Excel Export */}
                <button
                    disabled
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-500 font-medium rounded-lg cursor-not-allowed"
                >
                    Export Excel (Soon)
                </button>
            </div>
        </div>
    );
}
