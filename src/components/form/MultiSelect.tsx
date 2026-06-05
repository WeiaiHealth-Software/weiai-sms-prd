import { CaretDown, Check, X } from "@phosphor-icons/react";
import clsx from "clsx";
import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import type { SelectOption } from "./Select";

export type MultiSelectProps = {
  value: string[];
  onChange?: (value: string[]) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  dropdownClassName?: string;
};

export default function MultiSelect({
  value,
  onChange,
  options,
  placeholder = "请选择",
  disabled,
  className,
  triggerClassName,
  dropdownClassName,
}: MultiSelectProps) {
  const triggerId = useId();
  const listboxId = useMemo(() => `${triggerId}-listbox`, [triggerId]);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedOptions = useMemo(() => options.filter((option) => value.includes(option.value)), [options, value]);
  const enabledOptions = useMemo(() => options.filter((option) => !option.disabled), [options]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (wrapperRef.current && !wrapperRef.current.contains(target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(0);
    requestAnimationFrame(() => {
      optionRefs.current[0]?.focus();
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    optionRefs.current[activeIndex]?.focus();
  }, [activeIndex, open]);

  const toggleValue = (nextValue: string) => {
    const next = value.includes(nextValue) ? value.filter((item) => item !== nextValue) : [...value, nextValue];
    onChange?.(next);
  };

  const removeValue = (nextValue: string) => {
    if (!value.includes(nextValue)) return;
    onChange?.(value.filter((item) => item !== nextValue));
  };

  const onTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen((prev) => !prev);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
    }
  };

  const onListKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (enabledOptions.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, enabledOptions.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(enabledOptions.length - 1);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const next = enabledOptions[activeIndex];
      if (next) toggleValue(next.value);
    }
  };

  const visibleTags = selectedOptions.slice(0, 3);
  const restCount = Math.max(0, selectedOptions.length - visibleTags.length);

  return (
    <div ref={wrapperRef} className={clsx("relative", className)}>
      <button
        type="button"
        id={triggerId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        onKeyDown={onTriggerKeyDown}
        className={clsx(
          "w-full min-h-11 rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white text-left flex items-center justify-between gap-3",
          "outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500",
          disabled ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "hover:bg-slate-50 text-slate-700",
          triggerClassName
        )}
      >
        <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
          {selectedOptions.length === 0 && <span className="text-slate-400 truncate">{placeholder}</span>}
          {visibleTags.map((selected) => (
            <span
              key={selected.value}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border bg-primary-50 text-primary-600 border-primary-200 max-w-full"
              onClick={(event) => event.stopPropagation()}
            >
              <span className="truncate">{selected.label}</span>
              {!disabled && (
                <button
                  type="button"
                  className="text-primary-500 hover:text-primary-700"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeValue(selected.value);
                  }}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
          {restCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border bg-slate-50 text-slate-600 border-slate-200">
              +{restCount}
            </span>
          )}
        </div>
        <CaretDown className={clsx("h-4 w-4 shrink-0 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="listbox"
          id={listboxId}
          tabIndex={-1}
          onKeyDown={onListKeyDown}
          className={clsx(
            "absolute z-50 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden",
            dropdownClassName
          )}
        >
          <div className="max-h-64 overflow-auto p-1">
            {enabledOptions.map((option, index) => {
              const checked = value.includes(option.value);
              const activeNow = index === activeIndex;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={checked}
                  ref={(element) => {
                    optionRefs.current[index] = element;
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => toggleValue(option.value)}
                  className={clsx(
                    "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors",
                    activeNow ? "bg-primary-50 text-primary-700" : "text-slate-700 hover:bg-slate-50",
                    checked && "font-bold"
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {checked ? <Check className="w-4 h-4 text-primary-600" /> : <span className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
