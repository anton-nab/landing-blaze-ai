export const AUDIT_INPUT_ID = "audit-url-input";

export function focusAuditInput() {
  window.scrollTo({ top: 0, behavior: "smooth" });
  setTimeout(() => {
    const el = document.getElementById(AUDIT_INPUT_ID) as HTMLInputElement | null;
    el?.focus();
  }, 450);
}
