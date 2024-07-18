import Link from "next/link";
import Blob from "./Blob";

export default function Logo({ size }: { size: number }) {
  return (
    <Link href="/" className={`w-${size} h-${size}`}>
      <Blob className="size-full" />
    </Link>
  );
}
