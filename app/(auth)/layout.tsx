import { SiteFooter } from "@/components/site-footer";
import SiteNav from "@/components/site-nav";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteNav />
      <main className="flex flex-1 items-center justify-center">{children}</main>
      <SiteFooter />
    </>
  );
}
