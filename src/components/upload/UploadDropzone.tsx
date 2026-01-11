'use client';

import { uploadTranscript, UploadState } from '@/actions/upload';
import { Loader2, UploadCloud, FileSpreadsheet } from 'lucide-react';
import { useActionState, useState, useEffect } from 'react';

const initialState: UploadState = {
    success: false,
    message: '',
};

export default function UploadDropzone() {
    // React 19 useActionState (or useFormState in older next/react)
    // Assuming Next.js 15+ / React 19 based on prompt context (Next 16 mentioned)
    // If useActionState is not available, we fallback to a wrapper or useFormState
    const [state, formAction, isPending] = useActionState(uploadTranscript, initialState);

    // Local state for drag/drop visual
    const [isDragOver, setIsDragOver] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.csv'))) {
            setFile(droppedFile);
        } else {
            alert('Only .xlsx or .csv files are allowed');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    // Reset file on success
    useEffect(() => {
        if (state.success) {
            setFile(null);
            // Optionally auto-refresh is handled by server action revalidatePath
        }
    }, [state.success]);

    return (
        <div className="w-full">
            <form action={formAction} className="w-full">
                <div
                    className={`
                        relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
                        ${isDragOver ? 'border-blue-400 bg-blue-400/10' : 'border-gray-600 hover:border-gray-400 bg-gray-900/50'}
                        ${file ? 'border-green-500/50 bg-green-500/5' : ''}
                    `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        name="file"
                        accept=".xlsx,.csv"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isPending}
                    />

                    <div className="flex flex-col items-center justify-center space-y-4">
                        {file ? (
                            <>
                                <div className="p-4 bg-green-500/20 rounded-full animate-bounce-short">
                                    <FileSpreadsheet className="w-8 h-8 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-lg font-medium text-white">{file.name}</p>
                                    <p className="text-sm text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="p-4 bg-gray-700/50 rounded-full">
                                    <UploadCloud className="w-8 h-8 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-lg font-medium text-white">Click or Drag Transcript File</p>
                                    <p className="text-sm text-gray-400">Support .xlsx or .csv</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Status Message */}
                {state.message && (
                    <div className={`mt-4 p-3 rounded-lg text-sm text-center ${state.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {state.message}
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={!file || isPending}
                    className={`
                        mt-6 w-full py-3 px-4 rounded-xl flex items-center justify-center font-medium transition-all
                        ${!file || isPending
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/25'}
                    `}
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Uploading & Queuing...
                        </>
                    ) : (
                        'Process Transcript'
                    )}
                </button>
            </form>
        </div>
    );
}
