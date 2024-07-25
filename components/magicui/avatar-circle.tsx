"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { UserIcon } from "lucide-react";
import Image from "next/image";

interface AvatarCirclesProps {
  className?: string;
  numPeople?: number;
  avatarUrls: (string | null)[];
}

const AvatarCircles = ({
  numPeople,
  className,
  avatarUrls,
}: AvatarCirclesProps) => {
  return (
    <div className={cn("z-10 flex -space-x-4 rtl:space-x-reverse", className)}>
      {avatarUrls.map((url, index) =>
        url ? (
          <Image
            key={index}
            className="h-10 w-10 rounded-full border-2 border-white dark:border-gray-800"
            src={url}
            width={40}
            height={40}
            alt={`Avatar ${index + 1}`}
          />
        ) : (
          <div
            key={index}
            className="h-10 w-10 rounded-full border-2 border-white dark:border-gray-800 bg-primary flex items-center justify-center"
          >
            <UserIcon className="h-6 w-6 text-background" />
          </div>
        )
      )}
      <Link
        className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-secondary text-center text-xs font-medium text-primary hover:bg-primary hover:text-background hover:border-background transition-colors duration-300 ease-in-out"
        href="#"
      >
        +{numPeople}
      </Link>
    </div>
  );
};

export default AvatarCircles;
