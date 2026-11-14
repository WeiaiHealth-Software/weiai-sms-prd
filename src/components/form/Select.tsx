import { CaretDown, Check } from "@phosphor-icons/react";
import clsx from "clsx";
import { createPortal } from "react-dom";
import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type RenderState = {
  selected: boolean;
  active: boolean;
};

export type SelectProps = {
  value?: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  dropdownClassName?: string;
  renderValue?: (option: SelectOption | undefined, placeholder: string) => React.ReactNode;
  renderOption?: (option: SelectOption, state: RenderState) => React.ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (keyword: string) => void;
  /** 下拉面板底部插槽，用于放「新建」等引导操作 */
  footer?: React.ReactNode;
};

export default function Select({
  value,
  onChange,
  options,
  placeholder = "请选择",
  disabled,
  className,
  triggerClassName,
  dropdownClassName,
  renderValue,
  renderOption,
  searchable,
  searchPlaceholder,
  onSearch,
  footer,
}: SelectProps) {
  const triggerId = useId();
  const listboxId = useMemo(() => `${triggerId}-listbox`, [triggerId]);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; flipUp: boolean } | null>(null);

  const selected = useMemo(() => (value ? options.find((option) => option.value === value) : undefined), [options, value]);

  const filteredOptions = useMemo(() => {
    if (!searchable) return options;
    if (onSearch) return options;
    const keyword = searchValue.trim().toLowerCase();
    if (!keyword) return options;
    return options.filter((option) => option.label.toLowerCase().includes(keyword));
  }, [onSearch, options, searchValue, searchable]);

  const enabledOptions = useMemo(() => filteredOptions.filter((option) => !option.disabled), [filteredOptions]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const inWrapper = wrapperRef.current?.contains(target);
      const inDropdown = dropdownRef.current?.contains(target);
      if (!inWrapper && !inDropdown) {
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

    const selectedIndex = value ? enabledOptions.findIndex((option) => option.value === value) : -1;
    const nextIndex = selectedIndex >= 0 ? selectedIndex : 0;
    setActiveIndex(nextIndex);

    requestAnimationFrame(() => {
      if (searchable) {
        searchInputRef.current?.focus();
        return;
      }
      optionRefs.current[nextIndex]?.focus();
    });
  }, [enabledOptions, open, searchable, value]);

  useEffect(() => {
    if (!open) return;
    if (searchable) return;
    optionRefs.current[activeIndex]?.focus();
  }, [activeIndex, open, searchable]);

  useEffect(() => {
    if (!open) return;
    if (!searchable) return;
    setActiveIndex(0);
  }, [open, searchable, searchValue]);

  useEffect(() => {
    if (!searchable) return;
    if (open) return;
    if (!searchValue) return;
    setSearchValue("");
    onSearch?.("");
  }, [onSearch, open, searchValue, searchable]);

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
      if (next) {
        onChange?.(next.value);
        setOpen(false);
      }
    }
  };

  const updateCoords = useCallback(() => {
    const trigger = triggerRef.current;
    const dropdown = dropdownRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const vh = window.innerHeight;
    const gap = 8;
    const dropdownHeight = dropdown?.offsetHeight ?? 280;
    const spaceBelow = vh - rect.bottom - gap;
    const spaceAbove = rect.top - gap;
    const flipUp = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
    setCoords({
      top: flipUp ? rect.top - gap : rect.bottom + gap,
      left: rect.left,
      width: rect.width,
      flipUp,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 下拉关闭时清除定位坐标
      setCoords(null);
      return;
    }
    updateCoords();
    const onScrollResize = () => updateCoords();
    window.addEventListener("scroll", onScrollResize, true);
    window.addEventListener("resize", onScrollResize);
    return () => {
      window.removeEventListener("scroll", onScrollResize, true);
      window.removeEventListener("resize", onScrollResize);
    };
  }, [open, updateCoords]);

  // 下拉内容尺寸变化（搜索过滤、选项增减）时重新定位，避免翻转方向不准
  useLayoutEffect(() => {
    if (open) updateCoords();
  }, [open, filteredOptions.length, footer, searchable, updateCoords]);

  return (
    <>
      <div ref={wrapperRef} className={clsx("relative", className)}>
        <button
          type="button"
          id={triggerId}
          ref={triggerRef}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          disabled={disabled}
          onClick={() => !disabled && setOpen((prev) => !prev)}
          onKeyDown={onTriggerKeyDown}
          className={clsx(
            "flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 text-left text-sm",
            "outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500",
            disabled ? "cursor-not-allowed bg-slate-100 text-slate-400" : "text-slate-700 hover:bg-slate-50",
            triggerClassName
          )}
        >
          <span className={clsx("min-w-0 flex-1 truncate", selected ? "text-slate-700" : "text-slate-400")}>
            {renderValue ? renderValue(selected, placeholder) : selected ? selected.label : placeholder}
          </span>
          <CaretDown className={clsx("h-4 w-4 shrink-0 text-slate-400 transition-transform", open && "rotate-180")} />
        </button>
      </div>

      {open && coords && typeof document !== "undefined"
        ? createPortal(
          <div
            ref={dropdownRef}
            role="listbox"
            id={listboxId}
            tabIndex={-1}
            onKeyDown={onListKeyDown}
            style={{
              position: "fixed",
              top: coords.flipUp ? undefined : coords.top,
              bottom: coords.flipUp ? window.innerHeight - coords.top : undefined,
              left: coords.left,
              width: coords.width,
              zIndex: 140,
            }}
            className={clsx("overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg", dropdownClassName)}
          >
            {searchable ? (
              <div className="border-b border-slate-100 p-2">
                <input
                  ref={searchInputRef}
                  value={searchValue}
                  placeholder={searchPlaceholder ?? "搜索"}
                  onChange={(event) => {
                    const next = event.target.value;
                    setSearchValue(next);
                    onSearch?.(next);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      optionRefs.current[0]?.focus();
                    }
                  }}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>
            ) : null}
            <div className={clsx("max-h-64 overflow-auto p-1", searchable && "pt-2")}>
              {enabledOptions.map((option, index) => {
                const selectedNow = option.value === value;
                const activeNow = index === activeIndex;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={selectedNow}
                    ref={(element) => {
                      optionRefs.current[index] = element;
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => {
                      onChange?.(option.value);
                      setOpen(false);
                    }}
                    className={clsx(
                      "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      activeNow ? "bg-primary-50 text-primary-700" : "text-slate-700 hover:bg-slate-50",
                      selectedNow && "font-bold"
                    )}
                  >
                    {renderOption ? (
                      renderOption(option, { selected: selectedNow, active: activeNow })
                    ) : (
                      <>
                        <span className="truncate">{option.label}</span>
                        {selectedNow ? <Check className="h-4 w-4 text-primary-600" /> : null}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
            {footer ? <div className="border-t border-slate-100 p-1.5">{footer}</div> : null}
          </div>,
          document.body
        )
      : null}
    </>
  );
}
