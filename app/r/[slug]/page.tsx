import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAuditBySlug } from "@/lib/audit/get-audit";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { ReportView } from "@/components/report/ReportView";

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const audit = await getAuditBySlug(slug);
  if (!audit) return {};

  const title = `${hostnameOf(audit.url)} — Landing Score ${audit.report.score}/100 | LandingBlaze`;
  const description = audit.report.verdict;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SharedReportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [audit, user] = await Promise.all([getAuditBySlug(slug), getCurrentUser()]);

  if (!audit) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const resolvedSlug = audit.shareSlug ?? slug;
  const shareUrl = `${siteUrl}/r/${resolvedSlug}`;
  const ogImageUrl = `${siteUrl}/r/${resolvedSlug}/opengraph-image`;

  return (
    <ReportView
      report={audit.report}
      shareUrl={shareUrl}
      plan={user?.plan ?? "free"}
      auditId={audit.id}
      ogImageUrl={ogImageUrl}
    />
  );
}
