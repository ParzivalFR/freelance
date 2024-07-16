import { firaCode } from "@/fonts/FiraCode";

export default function Logo({ size }: { size: string }) {
  return (
    <div
      className={`pl-2 py-1 bg-primary/20 text-foreground rounded-md text-${size} font-extrabold ${firaCode.className}`}
    >
      <p>
        OASIS<span className="text-purple-700">.</span>
      </p>
    </div>
  );
}
