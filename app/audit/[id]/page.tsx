import { notFound } from "next/navigation";
import { getAuditById } from "@/lib/audit/get-audit";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { ReportView } from "@/components/report/ReportView";

export default async function AuditReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [audit, user] = await Promise.all([getAuditById(id), getCurrentUser()]);

  if (!audit) notFound();

  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/audit/${audit.id}`;

  return <ReportView report={audit.report} shareUrl={shareUrl} plan={user?.plan ?? "free"} />;
}
