import { PageHeader, StatCard } from "@/components/dashboard/cyber-ui";
import { prisma } from "@/lib/prisma";
import { getPlausibleStats } from "@/lib/plausible";
import { Bot, FileText, FolderOpen, LayoutDashboard, MessageSquare, RefreshCcw, Users } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const [projectsCount, clientsCount, testimonialsCount, recentClients, plausibleStats, botsOnline, pendingRefunds, pendingDevis] = await Promise.all([
    prisma.project.count(),
    prisma.client.count(),
    prisma.testimonial.count(),
    prisma.client.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    getPlausibleStats("30d"),
    prisma.discordBot.count({ where: { status: "ONLINE" } }),
    prisma.refundRequest.count({ where: { status: "PENDING" } }).catch(() => 0),
    prisma.devis.count({ where: { status: "sent" } }).catch(() => 0),
  ]);

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const recentClientsCount = recentClients.filter(
    (client: { createdAt: Date }) => new Date(client.createdAt) > oneWeekAgo
  ).length;

  const contactsCount = await prisma.client.count({
    where: { createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) } },
  });
  const conversionRate =
    plausibleStats && plausibleStats.visitors.value > 0
      ? ((contactsCount / plausibleStats.visitors.value) * 100).toFixed(1)
      : "0";

  const quickLinks = [
    { href: "/admin/projects", icon: <FolderOpen className="size-3.5" />, label: "Projets", sub: `${projectsCount} projet${projectsCount > 1 ? "s" : ""} en ligne` },
    { href: "/admin/clients", icon: <Users className="size-3.5" />, label: "Clients", sub: `${clientsCount} enregistré${clientsCount > 1 ? "s" : ""} · +${recentClientsCount} cette semaine` },
    { href: "/admin/testimonials", icon: <MessageSquare className="size-3.5" />, label: "Témoignages", sub: `${testimonialsCount} publié${testimonialsCount > 1 ? "s" : ""}` },
    { href: "/admin/bots", icon: <Bot className="size-3.5" />, label: "Bots Discord", sub: `${botsOnline} bot${botsOnline > 1 ? "s" : ""} en ligne` },
    { href: "/admin/devis/list", icon: <FileText className="size-3.5" />, label: "Devis", sub: pendingDevis > 0 ? `${pendingDevis} en attente` : "Aucun en attente" },
    { href: "/admin/refunds", icon: <RefreshCcw className="size-3.5" />, label: "Remboursements", sub: pendingRefunds > 0 ? `${pendingRefunds} à traiter` : "Rien à traiter" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<LayoutDashboard className="size-4" />}
        title="Dashboard Admin"
        subtitle="Vue d'ensemble de l'activité"
        status="ONLINE"
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="visiteurs_30j"
          value={plausibleStats ? String(plausibleStats.visitors.value) : "—"}
          sub="Trafic sur le site (Plausible)"
          accent={!!plausibleStats && plausibleStats.visitors.value > 0}
        />
        <StatCard
          label="contacts_30j"
          value={String(contactsCount)}
          sub={`Taux de conversion : ${conversionRate}%`}
          accent={contactsCount > 0}
        />
        <StatCard
          label="bots_en_ligne"
          value={String(botsOnline)}
          sub="Bots hébergés actifs"
          accent={botsOnline > 0}
          pulse
        />
        <StatCard
          label="a_traiter"
          value={String(pendingRefunds + pendingDevis)}
          sub={`${pendingDevis} devis · ${pendingRefunds} remboursement${pendingRefunds > 1 ? "s" : ""}`}
          accent={pendingRefunds + pendingDevis > 0}
        />
      </div>

      <div className="space-y-3">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
          — accès rapide —
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center gap-3 rounded-xl border border-dashed bg-card p-3.5 transition hover:border-blue-500/30 hover:bg-blue-500/5"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition group-hover:bg-blue-500/15 group-hover:text-blue-500">
                {link.icon}
              </div>
              <div className="min-w-0">
                <p className="font-mono text-xs font-semibold text-foreground">{link.label}</p>
                <p className="truncate font-mono text-[10px] text-muted-foreground">{link.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
