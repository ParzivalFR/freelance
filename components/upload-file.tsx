import { X } from "lucide-react"; // Assurez-vous d'avoir installé lucide-react
import React, { ChangeEvent, useState } from "react";

interface FileUploadProps {
  multiple?: boolean;
  onChange: (files: File[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  multiple = false,
  onChange,
}) => {
  const [fileNames, setFileNames] = useState<string[]>([]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFileNames(files.map((file) => file.name));
    onChange(files);
  };

  const removeFile = (index: number) => {
    setFileNames((prev) => prev.filter((_, i) => i !== index));
    onChange([]); // Vous pouvez ajuster ceci si vous voulez conserver les autres fichiers
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <label className="flex flex-col items-center px-4 py-6 bg-foreground/5 text-primary rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue hover:text-white">
        <svg
          className="w-8 h-8"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
        </svg>
        <span className="mt-2 text-base leading-normal">
          {multiple ? "Sélectionnez des fichiers" : "Sélectionnez un fichier"}
        </span>
        <input
          type="file"
          className="hidden"
          onChange={handleFileChange}
          multiple={multiple}
        />
      </label>
      {fileNames.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-900">
            Fichiers sélectionnés :
          </p>
          <ul className="mt-1 border border-gray-200 rounded-md divide-y divide-gray-200">
            {fileNames.map((name, index) => (
              <li
                key={index}
                className="pl-3 pr-4 py-3 flex items-center justify-between text-sm"
              >
                <div className="w-0 flex-1 flex items-center">
                  <span className="ml-2 flex-1 w-0 truncate">{name}</span>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <button
                    onClick={() => removeFile(index)}
                    className="font-medium text-red-600 hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
