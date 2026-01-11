import ImportHistoryTable from '@/components/upload/ImportHistoryTable';
import UploadDropzone from '@/components/upload/UploadDropzone';
import { Suspense } from 'react';

export default function UploadPage() {
    return (
        <div className="flex flex-col flex-1 w-full p-8 pb-48 gap-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500">
                    Upload Transcripts
                </h1>
                <p className="text-gray-400 mt-2">
                    Upload academic records to update the database. Existing records will be updated safely.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Upload Area */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gray-900/50 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
                        <h2 className="text-lg font-semibold mb-4 text-white">New Import</h2>
                        <UploadDropzone />
                    </div>

                    <div className="bg-blue-900/10 border border-blue-500/20 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-blue-400 mb-2">Instructions</h4>
                        <ul className="text-xs text-gray-400 space-y-1 list-disc pl-4">
                            <li>File must be .xlsx or .csv</li>
                            <li>Required columns: No, NIM, Nama, Kode MK, Mata Kuliah, SKS, Nilai Angka/Huruf.</li>
                            <li>System handles duplicates automatically.</li>
                        </ul>
                    </div>
                </div>

                {/* Right Column: History */}
                <div className="lg:col-span-2">
                    <Suspense fallback={<div className="text-gray-500">Loading history...</div>}>
                        <ImportHistoryTable />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
