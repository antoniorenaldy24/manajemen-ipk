import UploadDropzone from "@/components/upload/UploadDropzone";

export default function UploadPage() {
    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Upload Data</h1>
                <p className="text-slate-500 mt-2">
                    Unggah transkrip nilai mahasiswa untuk memperbarui database.
                </p>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-8">
                    <UploadDropzone />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4">Panduan Upload</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-600">
                    <li>Pastikan file transkrip resmi (.xlsx atau .csv).</li>
                    <li>Sistem akan otomatis mengekstrak NIM dan Mata Kuliah.</li>
                    <li>Data mahasiswa yang sudah ada akan diperbarui jika ada perubahan nilai.</li>
                </ul>
            </div>
        </div>
    );
}
