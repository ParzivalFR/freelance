import { PageHeader, SectionTitle } from "@/components/admin/page-header";
import { prisma } from "@/lib/prisma";
import { getPlausibleStats } from "@/lib/plausible";
import { Bot, FileText, FolderOpen, MessageSquare, RefreshCcw, TrendingUp, Users } from "lucide-react";
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

  const stats = [
    {
      label: "Visiteurs (30j)",
      value: plausibleStats ? String(plausibleStats.visitors.value) : "—",
      sub: "Trafic sur le site",
      icon: TrendingUp,
    },
    {
      label: "Contacts (30j)",
      value: String(contactsCount),
      sub: `${conversionRate}% de conversion`,
      icon: Users,
    },
    {
      label: "Bots en ligne",
      value: String(botsOnline),
      sub: "Bots hébergés actifs",
      icon: Bot,
    },
    {
      label: "À traiter",
      value: String(pendingRefunds + pendingDevis),
      sub: `${pendingDevis} devis · ${pendingRefunds} remboursement${pendingRefunds > 1 ? "s" : ""}`,
      icon: RefreshCcw,
      highlight: pendingRefunds + pendingDevis > 0,
    },
  ];

  const quickLinks = [
    { href: "/admin/projects", icon: FolderOpen, label: "Projets", sub: `${projectsCount} projet${projectsCount > 1 ? "s" : ""} en ligne` },
    { href: "/admin/clients", icon: Users, label: "Clients", sub: `${clientsCount} enregistré${clientsCount > 1 ? "s" : ""} · +${recentClientsCount} cette semaine` },
    { href: "/admin/testimonials", icon: MessageSquare, label: "Témoignages", sub: `${testimonialsCount} publié${testimonialsCount > 1 ? "s" : ""}` },
    { href: "/admin/bots", icon: Bot, label: "Bots Discord", sub: `${botsOnline} bot${botsOnline > 1 ? "s" : ""} en ligne` },
    { href: "/admin/devis/list", icon: FileText, label: "Devis", sub: pendingDevis > 0 ? `${pendingDevis} en attente de réponse` : "Aucun en attente" },
    { href: "/admin/refunds", icon: RefreshCcw, label: "Remboursements", sub: pendingRefunds > 0 ? `${pendingRefunds} à traiter` : "Rien à traiter" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <PageHeader eyebrow="Bienvenue Gael" title="Vue d'" titleAccent="ensemble" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-2xl border bg-card p-5 ${
              stat.highlight ? "border-[#7158ff]/40 ring-4 ring-[#7158ff]/10" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <div className={`rounded-lg p-2 ${stat.highlight ? "bg-[#7158ff]/10 text-[#7158ff]" : "bg-muted/60 text-muted-foreground"}`}>
                <stat.icon className="size-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <SectionTitle>Accès rapide</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center gap-4 rounded-2xl border bg-card p-4 transition-colors hover:border-[#7158ff]/40 hover:bg-[#7158ff]/[0.03]"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground transition-colors group-hover:bg-[#7158ff]/10 group-hover:text-[#7158ff]">
                <link.icon className="size-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{link.label}</p>
                <p className="truncate text-xs text-muted-foreground">{link.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
