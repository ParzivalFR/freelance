import { SiteFooter } from "@/components/site-footer";
import SiteNav from "@/components/site-nav";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default async function MarketingLayout({
  children,
}: MarketingLayoutProps) {
  return (
    <>
      {/* <SiteBanner /> */}
      {/* <SiteHeader /> */}
      <SiteNav />
      <main className="mx-auto flex-1 overflow-hidden">{children}</main>
      <SiteFooter />
    </>
  );
}
