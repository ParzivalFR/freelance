"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Activity,
  BarChart2,
  Bot,
  BookOpen,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  MoreVertical,
  Puzzle,
  RotateCcw,
  Rocket,
  ScrollText,
  Shield,
  Star,
  Ticket,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { FaDiscord } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

function buildNav(botId: string) {
  return [
    {
      label: "Système",
      items: [
        { title: "Vue d'ensemble", url: `/dashboard/bot/${botId}`, icon: LayoutDashboard, exact: true },
        { title: "Guide de configuration", url: `/dashboard/bot/${botId}/guide`, icon: BookOpen, exact: false },
      ],
    },
    {
      label: "Configuration",
      items: [
        { title: "Identité & Token", url: `/dashboard/bot/${botId}/config`, icon: Bot, exact: false },
        { title: "Modules", url: `/dashboard/bot/${botId}/modules`, icon: Puzzle, exact: false },
        { title: "Déploiement", url: `/dashboard/bot/${botId}/deploy`, icon: Rocket, exact: false },
      ],
    },
    {
      label: "Monitoring",
      items: [
        { title: "Activité", url: `/dashboard/bot/${botId}/activity`, icon: Activity, exact: false },
      ],
    },
    {
      label: "Modules",
      items: [
        { title: "Monitor", url: `/dashboard/bot/${botId}/monitor`, icon: Activity, exact: false },
        { title: "Welcome", url: `/dashboard/bot/${botId}/welcome`, icon: MessageSquare, exact: false },
        { title: "Modération", url: `/dashboard/bot/${botId}/moderation`, icon: Shield, exact: false },
        { title: "Tickets", url: `/dashboard/bot/${botId}/tickets`, icon: Ticket, exact: false },
        { title: "Niveaux & XP", url: `/dashboard/bot/${botId}/levels`, icon: Star, exact: false },
        { title: "Logs", url: `/dashboard/bot/${botId}/logs`, icon: ScrollText, exact: false },
        { title: "Sondages", url: `/dashboard/bot/${botId}/polls`, icon: BarChart2, exact: false },
      ],
    },
  ];
}

export function BotSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const params = useParams();
  const botId = params?.botId as string | undefined;
  const { toast } = useToast();

  const [plan, setPlan] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const nav = botId ? buildNav(botId) : [];

  useEffect(() => {
    if (!botId) return;
    fetch(`/api/bot/config?botId=${botId}`)
      .then((r) => r.json())
      .then((data) => setPlan(data.plan ?? null))
      .catch(() => {});
  }, [botId]);

  const openCustomerPortal = async () => {
    if (!botId) return;
    setPortalLoading(true);
    try {
      const res = await fetch(`/api/bot/${botId}/customer-portal`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Erreur", description: data.error, variant: "destructive" });
        return;
      }
      window.location.href = data.url;
    } finally {
      setPortalLoading(false);
    }
  };

  const submitRefund = async () => {
    if (!botId || refundReason.trim().length < 10) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bot/${botId}/refund-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: refundReason }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Erreur", description: data.error, variant: "destructive" });
        return;
      }
      setRefundOpen(false);
      setRefundReason("");
      toast({
        title: "Demande envoyée",
        description: "Ta demande de remboursement a bien été transmise.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:p-1.5!"
              >
                <Link href="/dashboard/bot">
                  <div className="flex size-5 items-center justify-center rounded bg-blue-500/20 text-blue-400">
                    <FaDiscord className="size-3.5" />
                  </div>
                  <span className="font-mono text-sm font-bold">← Mes bots</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          {nav.map((section) => (
            <SidebarGroup key={section.label}>
              <SidebarGroupLabel className="font-mono text-[9px] uppercase tracking-widest text-sidebar-foreground/40">
                {section.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => {
                    const isActive = item.exact
                      ? pathname === item.url
                      : pathname === item.url || pathname.startsWith(item.url + "/");
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.title}
                          className="font-mono text-xs data-[active=true]:border data-[active=true]:border-blue-500/30 data-[active=true]:bg-blue-500/10 data-[active=true]:text-blue-500"
                        >
                          <Link href={item.url}>
                            <item.icon size={14} />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={session?.user?.image ?? ""} alt="Avatar" />
                      <AvatarFallback className="rounded-lg text-xs">
                        {session?.user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {session?.user?.name ?? "Utilisateur"}
                      </span>
                      <span className="truncate font-mono text-[10px] text-muted-foreground">
                        {session?.user?.email}
                      </span>
                    </div>
                    <MoreVertical className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                  side="top"
                  align="end"
                  sideOffset={4}
                >
                  {plan === "MANAGED" && (
                    <>
                      <DropdownMenuItem
                        onClick={openCustomerPortal}
                        disabled={portalLoading}
                        className="gap-2"
                      >
                        <CreditCard className="size-4" />
                        {portalLoading ? "Chargement…" : "Gérer mon abonnement"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setRefundOpen(true)}
                        className="gap-2 text-orange-500 focus:text-orange-500"
                      >
                        <RotateCcw className="size-4" />
                        Demander un remboursement
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/signin" })}
                    className="text-red-500 focus:text-red-500"
                  >
                    <LogOut className="size-4" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* Refund dialog — outside Sidebar to avoid z-index issues */}
      <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demande de remboursement</DialogTitle>
            <DialogDescription>
              Explique-nous pourquoi tu souhaites être remboursé. Ta demande sera examinée
              et le remboursement du mois en cours sera effectué si elle est acceptée.
              Ton abonnement sera également annulé.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Raison de ta demande (min. 10 caractères)…"
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            rows={4}
            className="font-mono text-sm"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundOpen(false)} disabled={submitting}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={submitRefund}
              disabled={submitting || refundReason.trim().length < 10}
            >
              {submitting ? "Envoi…" : "Envoyer la demande"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
