"use client";

import { cn } from "@/lib/utils";
import { UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

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
  const [imageErrors, setImageErrors] = useState<{[key: number]: boolean}>({});

  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  // Limiter à 5 avatars maximum
  const maxAvatars = 5;
  const displayedAvatars = avatarUrls.slice(0, maxAvatars);
  const remainingCount = Math.max(0, (numPeople || avatarUrls.length) - maxAvatars);

  return (
    <div className={cn("z-10 flex -space-x-4 rtl:space-x-reverse", className)}>
      {displayedAvatars.map((url, index) =>
        url && !imageErrors[index] ? (
          url.includes('dicebear.com') ? (
            <Image
              key={index}
              className="size-10 rounded-full border-2 border-white dark:border-gray-800"
              src={url}
              width={40}
              height={40}
              alt={`Avatar ${index + 1}`}
              onError={() => handleImageError(index)}
            />
          ) : (
            <Image
              key={index}
              className="size-10 rounded-full border-2 border-white dark:border-gray-800"
              src={url}
              width={40}
              height={40}
              alt={`Avatar ${index + 1}`}
              onError={() => handleImageError(index)}
            />
          )
        ) : (
          <div
            key={index}
            className="flex size-10 items-center justify-center rounded-full border-2 border-white bg-primary dark:border-gray-800"
          >
            <UserIcon className="size-6 text-background" />
          </div>
        )
      )}
      {remainingCount > 0 && (
        <div className="flex size-10 items-center justify-center rounded-full border-2 border-primary bg-secondary text-center text-xs font-medium text-primary">
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export default AvatarCircles;
