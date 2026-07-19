import { notFound } from "next/navigation";
import { getAuditById } from "@/lib/audit/get-audit";
import { ReportView } from "@/components/report/ReportView";

export default async function AuditReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const audit = await getAuditById(id);

  if (!audit) notFound();

  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/audit/${audit.id}`;

  return <ReportView report={audit.report} shareUrl={shareUrl} />;
}
