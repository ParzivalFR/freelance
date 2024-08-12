import { File, X } from "lucide-react";
import React, { useState } from "react";
import { Button } from "./ui/button";
import Image from "next/image";

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
    <div className="flex w-full flex-col items-center justify-center">
      <label
        htmlFor="dropzone-file"
        className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-secondary/50 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-800"
      >
        <div className="flex flex-col items-center justify-center gap-1 py-4">
          <File className="size-8 text-gray-500 dark:text-gray-400" />
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
          <Image
            src={preview}
            width={128}
            height={128}
            alt="Image Preview"
            className="h-32 w-auto rounded-lg object-cover"
          />
          <Button
            variant="destructive"
            onClick={removePreview}
            className="absolute right-2 top-2 p-2"
          >
            <X />
          </Button>
        </div>
      )}
    </div>
  );
}
