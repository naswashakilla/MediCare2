"use client";

import type { ChangeEvent } from "react";

type AutoSearchInputProps = {
  name: string;
  defaultValue: string;
  "aria-label": string;
  placeholder: string;
  className: string;
};

export function AutoSearchInput({
  name,
  defaultValue,
  "aria-label": ariaLabel,
  placeholder,
  className,
}: AutoSearchInputProps) {
  function searchAsYouType(event: ChangeEvent<HTMLInputElement>) {
    const form = event.currentTarget.form;
    if (!form) return;

    form.requestSubmit();
  }

  return (
    <input
      name={name}
      type="search"
      defaultValue={defaultValue}
      aria-label={ariaLabel}
      placeholder={placeholder}
      className={className}
      onChange={searchAsYouType}
    />
  );
}
