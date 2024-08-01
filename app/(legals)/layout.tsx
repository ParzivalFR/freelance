import { SiteFooter } from "@/components/site-footer";
import SiteNav from "@/components/site-nav";

interface LegalsProps {
  children: React.ReactNode;
}

const Legals = ({ children }: LegalsProps) => {
  return (
    <>
      <SiteNav />
      <main className="mx-auto flex-1 overflow-hidden">{children}</main>
      <SiteFooter />
    </>
  );
};

export default Legals;
