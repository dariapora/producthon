import { CheckCircle2, ClipboardPlus, Send } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { School } from "@/lib/model";

const NEED_CATEGORIES = [
  "Infrastructură",
  "Digitalizare",
  "Materiale educaționale",
  "Siguranță",
  "Incluziune",
  "Activități pentru elevi",
] as const;

export function HartaEduReportDialog({ school }: { school: School }) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) setSubmitted(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // În produs, payload-ul acestui formular este trimis prin integrarea HartaEdu.
    setSubmitted(true);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex min-h-12 items-center gap-2 rounded-md bg-brand px-5 py-3 font-semibold text-card"
        >
          <ClipboardPlus size={20} aria-hidden /> Raportează o nevoie
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[92vh] max-w-[620px] overflow-y-auto rounded-md border-2 border-line bg-card p-5 sm:p-7">
        {submitted ? (
          <div className="py-5 text-center" aria-live="polite">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-risk-grn-bg text-risk-grn">
              <CheckCircle2 size={34} aria-hidden />
            </span>
            <DialogTitle className="mt-5 text-[26px] leading-tight">
              Nevoia a fost trimisă către HartaEdu
            </DialogTitle>
            <DialogDescription className="mx-auto mt-3 max-w-[46ch] text-base leading-relaxed text-sub">
              Raportarea pentru {school.schoolName} a intrat în procesul de verificare. Vei primi o
              notificare când devine publică.
            </DialogDescription>
            <DialogClose asChild>
              <button
                type="button"
                className="mt-6 min-h-12 rounded-md bg-brand px-6 py-3 font-semibold text-card"
              >
                Am înțeles
              </button>
            </DialogClose>
          </div>
        ) : (
          <>
            <DialogHeader className="pr-8 text-left">
              <DialogTitle className="text-[26px] leading-tight">
                Raportează o nevoie concretă
              </DialogTitle>
              <DialogDescription className="text-base leading-relaxed text-sub">
                HartaEdu va verifica raportarea înainte de publicare.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-md bg-paper px-4 py-3">
              <p className="font-semibold">{school.schoolName}</p>
              <p className="text-sm text-sub">
                {school.locality ? `${school.locality}, ` : ""}județul {school.county}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Categoria nevoii" htmlFor="hartaedu-category">
                  <select
                    id="hartaedu-category"
                    name="category"
                    required
                    defaultValue=""
                    className="min-h-12 w-full rounded-md border-2 border-line bg-card px-3 py-2 outline-none focus:border-brand"
                  >
                    <option value="" disabled>
                      Alege categoria
                    </option>
                    {NEED_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Urgență" htmlFor="hartaedu-urgency">
                  <select
                    id="hartaedu-urgency"
                    name="urgency"
                    required
                    defaultValue=""
                    className="min-h-12 w-full rounded-md border-2 border-line bg-card px-3 py-2 outline-none focus:border-brand"
                  >
                    <option value="" disabled>
                      Alege urgența
                    </option>
                    <option value="scazuta">Scăzută</option>
                    <option value="medie">Medie</option>
                    <option value="urgenta">Urgentă</option>
                    <option value="foarte-urgenta">Foarte urgentă</option>
                  </select>
                </FormField>
              </div>

              <FormField label="Număr estimat de elevi afectați" htmlFor="hartaedu-students">
                <input
                  id="hartaedu-students"
                  name="impactedStudents"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  required
                  placeholder="Exemplu: 120"
                  className="min-h-12 w-full rounded-md border-2 border-line bg-card px-3 py-2 outline-none placeholder:text-sub focus:border-brand"
                />
              </FormField>

              <FormField label="Descrie nevoia" htmlFor="hartaedu-description">
                <textarea
                  id="hartaedu-description"
                  name="description"
                  required
                  minLength={20}
                  rows={4}
                  placeholder="Ce lipsește, cine este afectat și ce fel de ajutor ar rezolva problema?"
                  className="w-full resize-y rounded-md border-2 border-line bg-card px-3 py-3 outline-none placeholder:text-sub focus:border-brand"
                />
              </FormField>

              <label className="flex items-start gap-3 rounded-md bg-paper px-4 py-3 text-sm text-sub">
                <input type="checkbox" required className="mt-0.5 size-5 shrink-0 accent-brand" />
                <span>
                  Confirm că informațiile sunt corecte și pot fi verificate de echipa HartaEdu.
                </span>
              </label>

              <DialogFooter className="mt-1 gap-2 sm:space-x-0">
                <DialogClose asChild>
                  <button
                    type="button"
                    className="min-h-12 rounded-md border-2 border-line px-5 py-3 font-semibold"
                  >
                    Renunță
                  </button>
                </DialogClose>
                <button
                  type="submit"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-brand px-5 py-3 font-semibold text-card"
                >
                  <Send size={18} aria-hidden /> Trimite către HartaEdu
                </button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function FormField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-semibold">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
