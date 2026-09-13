import { Mail, Send } from "lucide-react";
import { useState } from "react";

import { Panel, PanelTitle } from "@/components/ui/Panel";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { NgoContactEnrichment } from "@/data/enrichment/ngoContactEnrichment";
import type { EmailDraft } from "@/lib/ngoEmail";

type NgoContactDialogProps = {
  contact: NgoContactEnrichment | null;
  emailDraft: EmailDraft | null;
  variant?: "panel" | "button";
};

export function NgoContactDialog({ contact, emailDraft, variant = "panel" }: NgoContactDialogProps) {
  const [open, setOpen] = useState(false);
  const canContact = emailDraft !== null;

  const trigger = (
    <button
      type="button"
      disabled={!canContact}
      onClick={() => setOpen(true)}
      className="inline-flex min-h-12 items-center gap-2 rounded-md bg-brand px-5 py-3 text-[15px] font-semibold text-card disabled:cursor-not-allowed disabled:bg-line disabled:text-sub"
    >
      <Send size={18} aria-hidden />
      {variant === "panel" ? "Contactează ONG-ul" : "Contactează"}
    </button>
  );

  const body =
    variant === "panel" ? (
      <Panel className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <PanelTitle>Contactează organizația</PanelTitle>
          <p className="mt-1 text-sm text-sub">Aplicația nu trimite emailuri</p>
          {contact ? (
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              {contact.email && <ContactField label="Email" value={contact.email} />}
              {contact.phone && <ContactField label="Telefon" value={contact.phone} />}
              {contact.contactName && (
                <ContactField label="Persoană de contact" value={contact.contactName} />
              )}
            </dl>
          ) : (
            <p className="mt-4 text-sub">Date de contact indisponibile pentru această organizație.</p>
          )}
        </div>
        <div className="flex flex-col items-start gap-2">
          {trigger}
          {contact && <p className="max-w-[24ch] text-xs text-sub">Sursa datelor de contact: {contact.source}</p>}
        </div>
      </Panel>
    ) : (
      trigger
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {body}

      {emailDraft && (
        <DialogContent className="max-h-[92vh] max-w-[560px] overflow-y-auto rounded-md border-2 border-line bg-card p-5 sm:p-7">
          <DialogHeader className="pr-8 text-left">
            <DialogTitle className="flex items-center gap-2 text-[24px] leading-tight">
              <Mail size={22} aria-hidden className="text-brand" /> Email pregătit
            </DialogTitle>
          </DialogHeader>

          <dl className="grid gap-3">
            <ContactField label="Către" value={emailDraft.to} />
            <ContactField label="Subiect" value={emailDraft.subject} />
          </dl>

          <div>
            <p className="text-sm font-semibold text-sub">Mesaj</p>
            <pre className="mt-2 max-h-[40vh] overflow-y-auto whitespace-pre-wrap rounded-md bg-paper px-4 py-3 font-sans text-sm leading-relaxed">
              {emailDraft.body}
            </pre>
          </div>

          <DialogFooter className="mt-1 flex-col items-stretch gap-3 sm:flex-col sm:space-x-0">
            <div className="flex flex-wrap gap-2">
              <DialogClose asChild>
                <button
                  type="button"
                  className="min-h-12 rounded-md border-2 border-line px-5 py-3 font-semibold"
                >
                  Anulează
                </button>
              </DialogClose>
              <a
                href={emailDraft.mailtoUrl}
                onClick={() => setOpen(false)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-brand px-5 py-3 font-semibold text-card"
              >
                <Send size={18} aria-hidden /> Deschide emailul
              </a>
            </div>
            <p className="text-xs text-sub">
              Emailul se deschide în aplicația dumneavoastră de email. Aplicația nu trimite mesaje.
            </p>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}

function ContactField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-paper px-4 py-3">
      <dt className="text-sm font-semibold text-sub">{label}</dt>
      <dd className="mt-1 text-pretty font-semibold">{value}</dd>
    </div>
  );
}
