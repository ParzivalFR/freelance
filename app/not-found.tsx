"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  const handleHome = () => {
    router.push("/");
  };

  return (
    <div className="grid h-screen place-content-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-9xl font-black text-primary/70">404</h1>

        <p className="text-2xl font-bold tracking-tight text-primary/30 sm:text-4xl">
          Uh-oh!
        </p>
        <p className="mt-4 text-primary/30">We can't find that page.</p>
        {/* <Link
          href="#"
          className="mt-6 inline-block rounded bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring"
        >
          Go Back Home
        </Link> */}
        <Button className="mt-6" onClick={handleHome}>
          Go Back Home
        </Button>
      </div>
    </div>
  );
}
