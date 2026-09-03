import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, X, Check } from 'lucide-react';

export interface FileUploaderProps {
  label?: string;
  sublabel?: string;
  accept?: string;
  onFileSelected: (file: { name: string; type: string; base64: string; text?: string; size: number }) => void;
  onClear?: () => void;
  selectedFile?: { name: string; type: string; base64?: string; size?: number } | null;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  label = "Upload handwritten notes or study documents",
  sublabel = "Supports PNG, JPG, PDF, or TXT up to 10MB",
  accept = "image/*,.pdf,.txt",
  onFileSelected,
  onClear,
  selectedFile,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (file.type.startsWith('text/')) {
        const textReader = new FileReader();
        textReader.onload = (te) => {
          onFileSelected({
            name: file.name,
            type: file.type,
            base64,
            text: te.target?.result as string,
            size: file.size,
          });
        };
        textReader.readAsText(file);
      } else {
        onFileSelected({
          name: file.name,
          type: file.type,
          base64,
          size: file.size,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      {selectedFile ? (
        <div className="flex items-center justify-between p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-[#16835B] shrink-0">
              {selectedFile.type?.startsWith('image/') ? (
                <ImageIcon className="w-5 h-5" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#171A18] truncate">{selectedFile.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-[#5F6762]">
                  {selectedFile.size ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Ready'}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#16835B]">
                  <Check className="w-3 h-3" /> Attached
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (inputRef.current) inputRef.current.value = '';
              onClear?.();
            }}
            className="p-2 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center rounded-lg text-[#89918C] hover:text-rose-600 hover:bg-rose-50 transition-colors ml-2 cursor-pointer"
            title="Remove file"
            aria-label="Remove uploaded file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-4 sm:p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all active:scale-[0.99] ${
            isDragging
              ? 'border-[#16835B] bg-emerald-50/50 scale-[0.99]'
              : 'border-[#E1E5E1] bg-[#F8F9F6]/80 hover:bg-white hover:border-[#16835B]/40'
          }`}
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white border border-[#E1E5E1] flex items-center justify-center text-[#16835B] shadow-sm mb-2">
            <UploadCloud className="w-5 h-5" />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-[#171A18] text-center">
            {label}
          </p>
          <p className="text-[11px] sm:text-xs text-[#89918C] text-center mt-0.5 sm:mt-1">
            {sublabel}
          </p>
          <span className="mt-2 text-[11px] font-medium text-[#16835B] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            Tap to browse or take photo
          </span>
        </div>
      )}
    </div>
  );
};
