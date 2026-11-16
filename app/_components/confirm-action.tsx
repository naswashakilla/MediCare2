"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

type ConfirmActionProps = {
  action: (formData: FormData) => void | Promise<void>;
  id: number;
  question: string;
  triggerLabel: string;
  confirmLabel: string;
  triggerClassName: string;
  disabled?: boolean;
  disabledTitle?: string;
};

function ConfirmSubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Memproses..." : label}
    </button>
  );
}

export function ConfirmAction({
  action,
  id,
  question,
  triggerLabel,
  confirmLabel,
  triggerClassName,
  disabled = false,
  disabledTitle,
}: ConfirmActionProps) {
  const [open, setOpen] = useState(false);
  const dialogId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  function closeDialog() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        title={disabled ? disabledTitle : undefined}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        onClick={() => setOpen(true)}
        className={triggerClassName}
      >
        {triggerLabel}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDialog();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") closeDialog();
          }}
        >
          <div
            id={dialogId}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={`${dialogId}-title`}
            aria-describedby={`${dialogId}-description`}
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
          >
            <h2 id={`${dialogId}-title`} className="text-base font-semibold text-slate-900">
              Konfirmasi tindakan
            </h2>
            <p id={`${dialogId}-description`} className="mt-2 text-sm leading-6 text-slate-600">
              {question}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                ref={cancelRef}
                type="button"
                onClick={closeDialog}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Batal
              </button>
              <ConfirmSubmitButton label={confirmLabel} />
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
