import { File, X } from "lucide-react";
import React, { useState } from "react";
import { Button } from "./ui/button";

export default function InputFile({
  onChange,
}: {
  onChange: (file: File | null) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onChange(file);
    } else {
      setPreview(null);
      onChange(null);
    }
  };

  const removePreview = () => {
    setPreview(null);
    onChange(null);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <label
        htmlFor="dropzone-file"
        className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-secondary/50 dark:hover:bg-gray-800 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
      >
        <div className="flex flex-col gap-1 items-center justify-center pt-4 pb-4">
          <File className="w-8 h-8 text-gray-500 dark:text-gray-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold">Choose a file</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            All image files accepted (MAX: 5MB)
          </p>
        </div>
        <input
          id="dropzone-file"
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
      {preview && (
        <div className="relative mt-4">
          <img
            src={preview}
            alt="Image Preview"
            className="w-auto h-32 object-cover rounded-lg"
          />
          <Button
            variant="destructive"
            onClick={removePreview}
            className="absolute top-2 right-2 p-2"
          >
            <X />
          </Button>
        </div>
      )}
    </div>
  );
}
