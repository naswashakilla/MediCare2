"use client";

import { useEffect } from "react";

function isFormControl(
  target: EventTarget | null
): target is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
  );
}

export function RequiredFieldValidation() {
  useEffect(() => {
    function showRequiredMessage(event: Event) {
      if (isFormControl(event.target) && event.target.required && event.target.validity.valueMissing) {
        event.target.setCustomValidity("Wajib diisi");
      }
    }

    function clearCustomMessage(event: Event) {
      if (isFormControl(event.target)) event.target.setCustomValidity("");
    }

    document.addEventListener("invalid", showRequiredMessage, true);
    document.addEventListener("input", clearCustomMessage, true);
    document.addEventListener("change", clearCustomMessage, true);

    return () => {
      document.removeEventListener("invalid", showRequiredMessage, true);
      document.removeEventListener("input", clearCustomMessage, true);
      document.removeEventListener("change", clearCustomMessage, true);
    };
  }, []);

  return null;
}
