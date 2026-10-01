import { SiteFooter } from "@/components/site-footer";
import SiteNav from "@/components/site-nav";

interface LegalsProps {
  children: React.ReactNode;
}

const Legals = ({ children }: LegalsProps) => {
  return (
    <div className="landing flex min-h-dvh w-full flex-col">
      <SiteNav />
      <main className="mx-auto w-full flex-1 overflow-hidden">{children}</main>
      <SiteFooter />
    </div>
  );
};

export default Legals;
