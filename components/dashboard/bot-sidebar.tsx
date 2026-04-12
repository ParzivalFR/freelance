"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Activity,
  BarChart2,
  BookOpen,
  Bot,
  CreditCard,
  Crown,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  MoreVertical,
  Puzzle,
  Rocket,
  RotateCcw,
  ScrollText,
  Shield,
  Star,
  Ticket,
  Trash2,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FaDiscord } from "react-icons/fa";

function buildNav(botId: string) {
  return [
    {
      label: "Système",
      items: [
        {
          title: "Vue d'ensemble",
          url: `/dashboard/bot/${botId}`,
          icon: LayoutDashboard,
          exact: true,
        },
        {
          title: "Guide de configuration",
          url: `/dashboard/bot/${botId}/guide`,
          icon: BookOpen,
          exact: false,
        },
      ],
    },
    {
      label: "Configuration",
      items: [
        {
          title: "Identité & Token",
          url: `/dashboard/bot/${botId}/config`,
          icon: Bot,
          exact: false,
        },
        {
          title: "Modules",
          url: `/dashboard/bot/${botId}/modules`,
          icon: Puzzle,
          exact: false,
        },
        {
          title: "Déploiement",
          url: `/dashboard/bot/${botId}/deploy`,
          icon: Rocket,
          exact: false,
        },
      ],
    },
    {
      label: "Monitoring",
      items: [
        {
          title: "Activité",
          url: `/dashboard/bot/${botId}/activity`,
          icon: Activity,
          exact: false,
        },
      ],
    },
    {
      label: "Modules",
      items: [
        {
          title: "Monitor",
          url: `/dashboard/bot/${botId}/monitor`,
          icon: Activity,
          exact: false,
          pro: true,
        },
        {
          title: "Welcome",
          url: `/dashboard/bot/${botId}/welcome`,
          icon: MessageSquare,
          exact: false,
          pro: false,
        },
        {
          title: "Modération",
          url: `/dashboard/bot/${botId}/moderation`,
          icon: Shield,
          exact: false,
          pro: true,
        },
        {
          title: "Tickets",
          url: `/dashboard/bot/${botId}/tickets`,
          icon: Ticket,
          exact: false,
          pro: true,
        },
        {
          title: "Niveaux & XP",
          url: `/dashboard/bot/${botId}/levels`,
          icon: Star,
          exact: false,
          pro: true,
        },
        {
          title: "Logs",
          url: `/dashboard/bot/${botId}/logs`,
          icon: ScrollText,
          exact: false,
          pro: false,
        },
        {
          title: "Sondages",
          url: `/dashboard/bot/${botId}/polls`,
          icon: BarChart2,
          exact: false,
          pro: true,
        },
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
  const [refundError, setRefundError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

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
      const res = await fetch(`/api/bot/${botId}/customer-portal`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "Erreur",
          description: data.error,
          variant: "destructive",
        });
        return;
      }
      window.location.href = data.url;
    } finally {
      setPortalLoading(false);
    }
  };

  const submitRefund = async () => {
    if (!botId || refundReason.trim().length < 10) return;
    setRefundError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bot/${botId}/refund-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: refundReason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRefundError(data.error ?? "Une erreur est survenue.");
        return;
      }
      setRefundOpen(false);
      setRefundReason("");
      setRefundError(null);
      toast({
        title: "Demande envoyée",
        description: "Ta demande de remboursement a bien été transmise.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteAccount = async () => {
    setDeletingAccount(true);
    try {
      const res = await fetch("/api/user/account", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast({
          title: "Erreur",
          description: data.error,
          variant: "destructive",
        });
        return;
      }
      await signOut({ callbackUrl: "/signin" });
    } finally {
      setDeletingAccount(false);
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
                  <span className="font-mono text-sm font-bold">
                    ← Mes bots
                  </span>
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
                      : pathname === item.url ||
                        pathname.startsWith(item.url + "/");
                    const isLocked = "pro" in item && item.pro && !plan;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.title}
                          className={`font-mono text-xs data-[active=true]:border data-[active=true]:border-blue-500/30 data-[active=true]:bg-blue-500/10 data-[active=true]:text-blue-500 ${isLocked ? "opacity-50" : ""}`}
                        >
                          <Link href={item.url}>
                            <item.icon size={14} />
                            <span className="flex-1">{item.title}</span>
                            {isLocked && <Crown size={10} className="text-yellow-500/60" />}
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
                      <AvatarImage
                        src={session?.user?.image ?? ""}
                        alt="Avatar"
                      />
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
                  {(plan === "MANAGED" || plan === "PRO") && (
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
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setDeleteAccountOpen(true)}
                    className="gap-2 text-red-500 focus:text-red-500"
                  >
                    <Trash2 className="size-4" />
                    Supprimer mon compte
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/signin" })}
                    className="gap-2 text-red-500 focus:text-red-500"
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
              Explique-nous pourquoi tu souhaites être remboursé. Ta demande
              sera examinée et le remboursement du mois en cours sera effectué
              si elle est acceptée. Ton abonnement sera également annulé.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Raison de ta demande (min. 10 caractères)…"
            value={refundReason}
            onChange={(e) => {
              setRefundReason(e.target.value);
              setRefundError(null);
            }}
            rows={4}
            className="font-mono text-sm"
          />
          {refundError && <p className="text-sm text-red-500">{refundError}</p>}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRefundOpen(false)}
              disabled={submitting}
            >
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
      <AlertDialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer mon compte ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est{" "}
              <span className="font-semibold text-foreground">
                irréversible
              </span>
              . Tous tes bots, leur configuration, et toutes les données
              associées seront définitivement supprimés. Les abonnements actifs
              seront annulés automatiquement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingAccount}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteAccount}
              disabled={deletingAccount}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deletingAccount ? "Suppression…" : "Supprimer définitivement"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
