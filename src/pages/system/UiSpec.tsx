import {
  Bell,
  CaretDown,
  Check,
  Gear,
  House,
  LinkSimple,
  MagnifyingGlass,
  Plus,
  Trash,
  User,
  WarningCircle,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Select, { type SelectOption } from "../../components/form/Select";

type TabKey = "system" | "basics" | "table" | "form";
type RowStatus = "进行中" | "已结束";

type DemoRow = {
  id: number;
  code: string;
  name: string;
  status: RowStatus;
  owner: string;
  createdAt: string;
};

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "system", label: "系统 UI 规范" },
  { key: "basics", label: "系统基础组件" },
  { key: "table", label: "表格页" },
  { key: "form", label: "表单组件" },
];

const brandScale = [
  { key: 50, name: "primary-50", hex: "#eff6ff", bg: "bg-primary-50" },
  { key: 100, name: "primary-100", hex: "#dbeafe", bg: "bg-primary-100" },
  { key: 200, name: "primary-200", hex: "#bfdbfe", bg: "bg-primary-200" },
  { key: 300, name: "primary-300", hex: "#93c5fd", bg: "bg-primary-300" },
  { key: 400, name: "primary-400", hex: "#60a5fa", bg: "bg-primary-400" },
  { key: 500, name: "primary-500", hex: "#3b82f6", bg: "bg-primary-500" },
  { key: 600, name: "primary-600", hex: "#2563eb", bg: "bg-primary-600" },
  { key: 700, name: "primary-700", hex: "#1d4ed8", bg: "bg-primary-700" },
  { key: 800, name: "primary-800", hex: "#1e40af", bg: "bg-primary-800" },
  { key: 900, name: "primary-900", hex: "#1e3a8a", bg: "bg-primary-900" },
] as const;

const secondaryPalettes = [
  {
    key: "alert",
    label: "告警色（红）",
    name: "red",
    steps: [
      { step: 50, bg: "bg-red-50" },
      { step: 100, bg: "bg-red-100" },
      { step: 200, bg: "bg-red-200" },
      { step: 300, bg: "bg-red-300" },
      { step: 400, bg: "bg-red-400" },
      { step: 500, bg: "bg-red-500" },
      { step: 600, bg: "bg-red-600" },
      { step: 700, bg: "bg-red-700" },
      { step: 800, bg: "bg-red-800" },
      { step: 900, bg: "bg-red-900" },
    ],
  },
  {
    key: "warning",
    label: "警告色（橙）",
    name: "amber",
    steps: [
      { step: 50, bg: "bg-amber-50" },
      { step: 100, bg: "bg-amber-100" },
      { step: 200, bg: "bg-amber-200" },
      { step: 300, bg: "bg-amber-300" },
      { step: 400, bg: "bg-amber-400" },
      { step: 500, bg: "bg-amber-500" },
      { step: 600, bg: "bg-amber-600" },
      { step: 700, bg: "bg-amber-700" },
      { step: 800, bg: "bg-amber-800" },
      { step: 900, bg: "bg-amber-900" },
    ],
  },
  {
    key: "success",
    label: "成功色（绿）",
    name: "emerald",
    steps: [
      { step: 50, bg: "bg-emerald-50" },
      { step: 100, bg: "bg-emerald-100" },
      { step: 200, bg: "bg-emerald-200" },
      { step: 300, bg: "bg-emerald-300" },
      { step: 400, bg: "bg-emerald-400" },
      { step: 500, bg: "bg-emerald-500" },
      { step: 600, bg: "bg-emerald-600" },
      { step: 700, bg: "bg-emerald-700" },
      { step: 800, bg: "bg-emerald-800" },
      { step: 900, bg: "bg-emerald-900" },
    ],
  },
  {
    key: "gray",
    label: "灰色",
    name: "slate",
    steps: [
      { step: 50, bg: "bg-slate-50" },
      { step: 100, bg: "bg-slate-100" },
      { step: 200, bg: "bg-slate-200" },
      { step: 300, bg: "bg-slate-300" },
      { step: 400, bg: "bg-slate-400" },
      { step: 500, bg: "bg-slate-500" },
      { step: 600, bg: "bg-slate-600" },
      { step: 700, bg: "bg-slate-700" },
      { step: 800, bg: "bg-slate-800" },
      { step: 900, bg: "bg-slate-900" },
    ],
  },
] as const;

const demoRows: DemoRow[] = [
  { id: 1, code: "XW09", name: "光刻微结构近视管理项目", status: "进行中", owner: "徐雷", createdAt: "2025-12-25" },
  { id: 2, code: "CARDIO_01", name: "冠心病介入治疗术后心脏康复分级干预策略研究", status: "进行中", owner: "李主任", createdAt: "2024-06-30" },
  { id: 3, code: "GLAUCOMA_PH3", name: "新型降眼压滴眼液在原发性开角型青光眼患者中的 III 期临床试验", status: "已结束", owner: "赵医生", createdAt: "2023-11-15" },
];

const selectOptions: SelectOption[] = [
  { value: "beijing", label: "北京" },
  { value: "shanghai", label: "上海" },
  { value: "shenzhen", label: "深圳" },
  { value: "hangzhou", label: "杭州" },
  { value: "chengdu", label: "成都" },
];

function SectionIntro({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-primary-200/80 bg-primary-50/45 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
      <div className="inline-flex items-center rounded-full border border-primary-200 bg-white/80 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-primary-700">
        规范说明
      </div>
      <h3 className="mt-3 text-sm font-bold text-primary-700">{title}</h3>
      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-primary-700/90">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function DemoMultiSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  options: SelectOption[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const label = value.length
    ? options
        .filter((item) => value.includes(item.value))
        .map((item) => item.label)
        .join("、")
    : placeholder;

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex min-h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-left text-sm text-slate-700 outline-none transition hover:border-primary-200"
      >
        <span className={value.length ? "text-slate-700" : "text-slate-400"}>{label}</span>
        <CaretDown size={14} className="shrink-0 text-slate-400" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-10 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          {options.map((item) => {
            const checked = value.includes(item.value);
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  if (checked) {
                    onChange(value.filter((entry) => entry !== item.value));
                  } else {
                    onChange([...value, item.value]);
                  }
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                <span>{item.label}</span>
                <span
                  className={
                    checked
                      ? "flex h-4 w-4 items-center justify-center rounded border border-primary-600 bg-primary-600 text-white"
                      : "h-4 w-4 rounded border border-slate-300 bg-white"
                  }
                >
                  {checked ? <Check size={12} /> : null}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function UiSpec() {
  const [tab, setTab] = useState<TabKey>("system");
  const [rows, setRows] = useState<DemoRow[]>(demoRows);
  const [rowToDelete, setRowToDelete] = useState<DemoRow | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [tableSearchInput, setTableSearchInput] = useState("");
  const [tableSearchValue, setTableSearchValue] = useState("");
  const [inputSearchValue, setInputSearchValue] = useState("");
  const [radioValue, setRadioValue] = useState<"A" | "B" | "C">("A");
  const [radioButtonValue, setRadioButtonValue] = useState<"全部" | "进行中" | "已结束">("全部");
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [switchValue, setSwitchValue] = useState(true);
  const [selectValue, setSelectValue] = useState("");
  const [multiSelectValue, setMultiSelectValue] = useState<string[]>(["beijing", "shanghai"]);
  const [textareaValue, setTextareaValue] = useState("");

  const filteredRows = useMemo(() => {
    const rowsByStatus = radioButtonValue === "全部" ? rows : rows.filter((item) => item.status === radioButtonValue);

    if (!tableSearchValue.trim()) return rowsByStatus;
    const keyword = tableSearchValue.trim().toLowerCase();
    return rowsByStatus.filter((item) => item.name.toLowerCase().includes(keyword) || item.code.toLowerCase().includes(keyword));
  }, [radioButtonValue, rows, tableSearchValue]);

  function openDelete(row: DemoRow) {
    setRowToDelete(row);
  }

  function closeDelete() {
    setRowToDelete(null);
  }

  function confirmDelete() {
    if (!rowToDelete) return;
    setRows((prev) => prev.filter((item) => item.id !== rowToDelete.id));
    closeDelete();
  }

  const deleteModal =
    rowToDelete && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/35 px-4 py-8" onClick={closeDelete}>
            <div
              className="w-full max-w-md rounded-[28px] bg-white px-6 py-7 shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <WarningCircle size={24} weight="fill" />
              </div>
              <h3 className="mt-5 text-center text-xl font-bold text-slate-800">确认删除？</h3>
              <p className="mt-2 text-center text-sm leading-6 text-slate-500">
                将删除 <span className="font-semibold text-slate-700">“{rowToDelete?.name}”</span>，该操作仅用于演示交互。
              </p>
              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={closeDelete}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-600/30 hover:bg-red-700"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="space-y-5 pb-2">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-[28px] font-semibold tracking-tight text-slate-900">系统 UI 组件规范</div>
          <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">规范页</span>
        </div>
        <div className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">统一沉淀后台系统常用 UI 规范与基础组件示例；争议以本页示例为准，便于后续页面持续复用。</div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-[0_6px_20px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={
                tab === item.key
                  ? "rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(37,99,235,0.24)]"
                  : "rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "system" && (
        <div className="space-y-6">
          <SectionIntro
            title="系统 UI 规范"
            items={[
              "主题色与副色用于全系统：按钮、链接、选中态、徽标、状态等。",
              "布局采用左侧菜单、右侧 Header 与主内容区的经典后台结构。",
              "菜单选中态应与当前系统保持一致：一级菜单可高亮，二级菜单使用更强的选中背景。",
            ]}
          />

          <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-slate-800">主题色（primary）</h3>
                <div className="text-xs font-mono text-slate-500">来源：tailwind primary palette</div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 lg:grid-cols-10">
                {brandScale.map((item) => (
                  <div key={item.key} className="space-y-1">
                    <div className={`h-10 rounded-lg border border-slate-200 ${item.bg}`}></div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-600">
                      <span>{item.key}</span>
                      <span className="text-slate-400">{item.name}</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">{item.hex}</div>
                  </div>
                ))}
              </div>
              <div className="grid gap-3 lg:grid-cols-3">
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="text-xs font-bold text-slate-700">推荐默认</div>
                  <div className="mt-2 text-sm text-slate-600">
                    主按钮与高亮文字优先使用 <span className="font-mono">primary-600</span>，hover 使用 <span className="font-mono">primary-700</span>。
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="text-xs font-bold text-slate-700">浅底与描边</div>
                  <div className="mt-2 text-sm text-slate-600">
                    浅底建议使用 <span className="font-mono">primary-50</span>，描边使用 <span className="font-mono">primary-100/200</span>。
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="text-xs font-bold text-slate-700">链接与高亮</div>
                  <div className="mt-2 text-sm text-slate-600">
                    链接推荐使用 <span className="font-mono">text-primary-600</span>，避免滥用纯蓝下划线。
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800">副色</h3>
              <div className="grid gap-4 lg:grid-cols-2">
                {secondaryPalettes.map((palette) => (
                  <div key={palette.key} className="space-y-3 rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-bold text-slate-700">{palette.label}</div>
                      <div className="text-xs font-mono text-slate-500">
                        {palette.name}-50 ... {palette.name}-900
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {palette.steps.map((step: (typeof palette.steps)[number]) => (
                        <div key={step.step} className={`h-8 w-8 rounded-lg border border-slate-200 ${step.bg}`} title={`${palette.name}-${step.step}`} />
                      ))}
                    </div>
                    <div className="text-sm text-slate-600">
                      推荐：浅底 <span className="font-mono">{palette.name}-50</span>，文字 <span className="font-mono">{palette.name}-600</span>，强调使用 <span className="font-mono">{palette.name}-700</span>。
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800">布局结构</h3>
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="flex h-44">
                  <div className="flex w-48 flex-col border-r border-slate-200 bg-slate-50">
                    <div className="border-b border-slate-200 px-4 py-3 text-xs font-bold text-slate-600">菜单（左）</div>
                    <div className="space-y-2 p-4">
                      <div className="h-3 rounded bg-slate-200"></div>
                      <div className="h-3 w-4/5 rounded bg-slate-200"></div>
                      <div className="h-3 rounded bg-primary-200"></div>
                      <div className="h-3 w-3/4 rounded bg-slate-200"></div>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col bg-white">
                    <div className="flex h-12 items-center justify-between border-b border-slate-200 px-4">
                      <div className="text-xs font-bold text-slate-600">Header（右上）</div>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-slate-200"></div>
                        <div className="h-6 w-10 rounded border border-slate-200 bg-slate-100"></div>
                      </div>
                    </div>
                    <div className="flex-1 bg-slate-50/60 p-4">
                      <div className="text-xs font-bold text-slate-600">主体内容（右下）</div>
                      <div className="mt-3 grid grid-cols-3 gap-3">
                        <div className="h-14 rounded-xl border border-slate-200 bg-white"></div>
                        <div className="h-14 rounded-xl border border-slate-200 bg-white"></div>
                        <div className="h-14 rounded-xl border border-slate-200 bg-white"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="text-xs font-bold text-slate-700">左右布局</div>
                  <div className="mt-2 text-sm text-slate-600">左侧为菜单区，右侧为内容区，适合典型后台信息密度。</div>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="text-xs font-bold text-slate-700">右侧上下布局</div>
                  <div className="mt-2 text-sm text-slate-600">Header 固定在顶部，下面为卡片式主内容区。</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800">菜单样式</h3>
              <div className="rounded-xl border border-slate-200 p-4">
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
                  <li>一级菜单展示 icon 与文案；若存在二级菜单，右侧带折叠箭头。</li>
                  <li>二级菜单仅展示文案，使用缩进与浅色选中底增强层级感。</li>
                  <li>选中态联动时，二级菜单使用浅底背景；一级菜单根据是否有子菜单决定是否展示背景高亮。</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "basics" && (
        <div className="space-y-6">
          <SectionIntro title="系统基础组件" items={["本页聚焦最小基础组件集合，用于统一全系统的样式与交互。", "示例以静态展示为主，复用时优先保持类名规范与视觉层级。"]} />

          <div className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-slate-800">图标（Phosphor）</h3>
                <div className="text-xs font-mono text-slate-500">@phosphor-icons/react</div>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
                  <li>统一采用一套图标库，避免同页混用多套风格。</li>
                  <li>默认尺寸建议为 16、18、20；一级菜单 icon 建议 20。</li>
                  <li>默认颜色使用灰阶，激活态与强调态切换到品牌蓝。</li>
                </ul>
              </div>
              <div className="grid gap-3 lg:grid-cols-3">
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-3 text-xs font-bold text-slate-700">常用示例</div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <House size={20} />
                    <Gear size={20} />
                    <User size={20} />
                    <Bell size={20} />
                    <MagnifyingGlass size={20} />
                    <Plus size={20} />
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-3 text-xs font-bold text-slate-700">尺寸对比</div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <House size={16} />
                    <House size={18} />
                    <House size={20} />
                    <House size={24} />
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-3 text-xs font-bold text-slate-700">状态对比</div>
                  <div className="flex items-center gap-3">
                    <Gear size={20} className="text-slate-400" />
                    <Gear size={20} className="text-primary-600" />
                    <Gear size={20} className="text-slate-700" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800">按钮</h3>
              <div className="rounded-xl border border-slate-200 p-4">
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
                  <li>普通按钮：白底灰边框，hover 后轻微变灰。</li>
                  <li>主题按钮：主按钮使用主色背景，hover 使用更深一档主色。</li>
                  <li>带 icon 的按钮：保持 icon 在左、文案在右，间距使用 `gap-2`。</li>
                </ul>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
                  普通按钮
                </button>
                <button type="button" className="rounded-xl border border-primary-600 bg-white px-4 py-2 text-sm font-bold text-primary-600 hover:bg-primary-50">
                  Outlined 按钮
                </button>
                <button type="button" className="rounded-xl bg-primary-600 px-5 py-2 text-sm font-bold text-white hover:bg-primary-700">
                  主题色按钮
                </button>
                <button type="button" className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2 text-sm font-bold text-white hover:bg-primary-700">
                  <Plus size={16} />
                  带 icon 的按钮
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800">文本</h3>
              <div className="rounded-xl border border-slate-200 p-4">
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
                  <li>正文推荐使用 `text-sm text-slate-600`，适合描述和说明文字。</li>
                  <li>弱说明使用 `text-xs text-slate-500`，适合提示和补充信息。</li>
                  <li>区块标题推荐使用 `text-sm font-bold text-slate-800`。</li>
                </ul>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                <div className="space-y-2 rounded-xl border border-slate-200 p-4">
                  <div className="text-xl font-bold text-slate-800">大标题（text-xl）</div>
                  <div className="text-sm font-bold text-slate-800">区块标题（text-sm）</div>
                  <div className="text-sm text-slate-600">正文文本：用于大多数内容描述与表单说明。</div>
                  <div className="text-xs text-slate-500">弱说明：用于注释、占位或次要信息。</div>
                </div>
                <div className="space-y-2 rounded-xl border border-slate-200 p-4">
                  <div className="text-sm font-bold text-slate-800">强调正文</div>
                  <div className="text-sm font-bold text-slate-800">重点字段：徐雷 / 进行中</div>
                  <div className="text-sm text-slate-600">普通字段：项目编号、日期、描述内容等。</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800">链接</h3>
              <div className="rounded-xl border border-slate-200 p-4">
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
                  <li>链接文案推荐用主色，不强制使用下划线。</li>
                  <li>删除类动作保留危险语义，使用红色纯文字链接即可。</li>
                </ul>
              </div>
              <div className="flex flex-wrap items-center gap-6">
                <a
                  href="/#"
                  onClick={(event) => event.preventDefault()}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  <LinkSimple size={16} />
                  示例链接
                </a>
                <button type="button" className="inline-flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-600">
                  <Trash size={16} />
                  删除
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800">标签（Tag）</h3>
              <div className="rounded-xl border border-slate-200 p-4">
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
                  <li>标签统一为浅底、深字、细边框，形态简洁，适合状态和分类信息。</li>
                  <li>颜色建议与系统品牌色、辅助色体系保持一致，避免自行扩散。</li>
                </ul>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600">灰</span>
                <span className="inline-flex items-center rounded-md border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-bold text-primary-600">蓝</span>
                <span className="inline-flex items-center rounded-md border border-yellow-200 bg-yellow-50 px-2.5 py-1 text-xs font-bold text-yellow-700">黄</span>
                <span className="inline-flex items-center rounded-md border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700">橙</span>
                <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">绿</span>
                <span className="inline-flex items-center rounded-md border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">紫</span>
                <span className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">红</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "table" && (
        <div className="space-y-6">
          <SectionIntro
            title="表格页开发规范"
            items={[
              "页面标题放在 Header，不在表格卡片内部重复放一个大标题。",
              "表格页使用单独工具栏卡片：左侧放筛选与搜索，右侧放 Action。",
              "Action 区与左侧筛选区之间使用竖线分隔，帮助快速识别主操作区域。",
              "表格主体使用统一白卡片 + 浅边框 + 圆角，保证视觉一致。",
              "主操作优先按钮化，危险操作使用纯文本红色链接，并配合二次确认。",
            ]}
          />

          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
            <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Header</div>
                <div className="mt-2 text-[24px] font-semibold tracking-tight text-slate-900">项目列表</div>
                <div className="mt-1 text-sm text-slate-500">标题统一放在 Header，卡片内部只承载筛选、Action 与表格内容。</div>
              </div>
              <div className="flex items-center gap-2 self-start lg:self-auto">
                <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">面包屑 / CRM / 项目列表</span>
              </div>
            </div>

            <div className="border-b border-slate-200 bg-slate-50/70 p-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Toolbar Card</div>
                  <div className="text-xs text-slate-400">左筛选 / 右 Action / 中间竖线分区</div>
                </div>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="inline-flex w-fit max-w-full rounded-xl border border-slate-200/60 bg-slate-100/50 p-1">
                      {(["全部", "进行中", "已结束"] as const).map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setRadioButtonValue(item)}
                          className={
                            radioButtonValue === item
                              ? "flex-none whitespace-nowrap rounded-lg border border-slate-200/60 bg-white px-4 py-2 text-sm font-bold text-primary-600 shadow-sm"
                              : "flex-none whitespace-nowrap rounded-lg px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-200/50 hover:text-slate-700"
                          }
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                    <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto lg:flex-1">
                      <div className="relative flex-1 lg:max-w-[320px]">
                        <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={tableSearchInput}
                          onChange={(event) => setTableSearchInput(event.target.value)}
                          placeholder="搜索项目名称或编号..."
                          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-700 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setTableSearchValue(tableSearchInput)}
                        className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-700"
                      >
                        搜索
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTableSearchInput("");
                          setTableSearchValue("");
                        }}
                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                      >
                        重置
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 lg:ml-4 lg:border-l lg:border-slate-200 lg:pl-4">
                    <div className="text-xs font-medium text-slate-400 lg:hidden">Action</div>
                    <div className="flex flex-wrap items-center gap-3">
                      <button type="button" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                        批量导出
                      </button>
                      <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary-500/20 hover:bg-primary-700">
                        <Plus size={16} />
                        新增项目
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto bg-white">
              <table className="w-full border-collapse whitespace-nowrap text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4 font-semibold">编号</th>
                    <th className="px-6 py-4 font-semibold">名称</th>
                    <th className="px-6 py-4 font-semibold">状态</th>
                    <th className="px-6 py-4 font-semibold">负责人</th>
                    <th className="px-6 py-4 font-semibold">创建日期</th>
                    <th className="px-6 py-4 text-right font-semibold">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredRows.map((item) => (
                      <tr key={item.id} className="transition-colors hover:bg-slate-50/80">
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-md border border-primary-100 bg-primary-50 px-2.5 py-1 text-xs font-bold text-primary-600">{item.code}</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">{item.name}</td>
                        <td className="px-6 py-4">
                          <span
                            className={
                              item.status === "进行中"
                                ? "inline-flex items-center rounded-md border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600"
                                : "inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600"
                            }
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-700">{item.owner}</td>
                        <td className="px-6 py-4 font-mono text-slate-500">{item.createdAt}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-3">
                            <button type="button" className="rounded-md bg-primary-50 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-100 hover:text-primary-700">
                              查看详情
                            </button>
                            <button type="button" onClick={() => openDelete(item)} className="text-sm font-medium text-red-500 hover:text-red-600">
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "form" && (
        <div className="space-y-6">
          <SectionIntro
            title="表单组件"
            items={[
              "输入控件统一使用圆角、浅边框和主色 focus 态，保证跨页面一致性。",
              "Select 与 MultiSelect 推荐使用自定义下拉样式，而不是裸原生控件。",
              "分段按钮适合状态筛选和单选切换场景，可与表格页筛选保持一致。",
            ]}
          />

          <div className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800">1. Input / InputSearch</h3>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-xs text-slate-500">Input</div>
                  <input
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    placeholder="请输入内容..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                  <div className="text-xs font-mono text-slate-400">value: {inputValue || "-"}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-slate-500">InputSearch</div>
                  <div className="relative">
                    <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={inputSearchValue}
                      onChange={(event) => setInputSearchValue(event.target.value)}
                      placeholder="搜索关键字..."
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-700 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div className="text-xs font-mono text-slate-400">value: {inputSearchValue || "-"}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800">2. Radio / RadioButton</h3>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-xs text-slate-500">Radio</div>
                  <div className="flex flex-wrap items-center gap-4">
                    {(["A", "B", "C"] as const).map((item) => (
                      <label key={item} className="flex cursor-pointer items-center gap-2 select-none">
                        <input type="radio" checked={radioValue === item} onChange={() => setRadioValue(item)} className="sr-only peer" />
                        <span className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 peer-checked:border-primary-600">
                          <span className={radioValue === item ? "h-2 w-2 rounded-full bg-primary-600" : "h-2 w-2 rounded-full bg-transparent"}></span>
                        </span>
                        <span className="text-sm text-slate-700">选项 {item}</span>
                      </label>
                    ))}
                  </div>
                  <div className="text-xs font-mono text-slate-400">value: {radioValue}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-slate-500">RadioButton</div>
                  <div className="flex rounded-xl border border-slate-200/60 bg-slate-100/50 p-1">
                    {(["全部", "进行中", "已结束"] as const).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setRadioButtonValue(item)}
                        className={
                          radioButtonValue === item
                            ? "flex-1 rounded-lg border border-slate-200/60 bg-white px-4 py-2 text-sm font-bold text-primary-600 shadow-sm"
                            : "flex-1 rounded-lg px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-200/50 hover:text-slate-700"
                        }
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  <div className="text-xs font-mono text-slate-400">value: {radioButtonValue}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800">3. Checkbox / Switch</h3>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-xs text-slate-500">Checkbox</div>
                  <label className="inline-flex cursor-pointer items-center gap-2 select-none">
                    <input type="checkbox" checked={checkboxValue} onChange={(event) => setCheckboxValue(event.target.checked)} className="sr-only" />
                    <span
                      className={
                        checkboxValue
                          ? "flex h-5 w-5 items-center justify-center rounded-md border border-primary-600 bg-primary-600 text-white"
                          : "flex h-5 w-5 items-center justify-center rounded-md border border-slate-300 bg-white text-transparent"
                      }
                    >
                      <Check size={12} weight="bold" />
                    </span>
                    <span className="text-sm text-slate-700">我已阅读并同意</span>
                  </label>
                  <div className="text-xs font-mono text-slate-400">value: {checkboxValue ? "true" : "false"}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-slate-500">Switch</div>
                  <button
                    type="button"
                    aria-pressed={switchValue}
                    onClick={() => setSwitchValue((prev) => !prev)}
                    className={switchValue ? "relative h-6 w-11 rounded-full bg-primary-600 transition-colors" : "relative h-6 w-11 rounded-full bg-slate-200 transition-colors"}
                  >
                    <span className={switchValue ? "absolute left-0.5 top-0.5 h-5 w-5 translate-x-5 rounded-full bg-white shadow-sm transition-transform" : "absolute left-0.5 top-0.5 h-5 w-5 translate-x-0 rounded-full bg-white shadow-sm transition-transform"}></span>
                  </button>
                  <div className="text-xs font-mono text-slate-400">value: {switchValue ? "true" : "false"}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800">4. Select / MultiSelect</h3>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-xs text-slate-500">Select</div>
                  <Select
                    value={selectValue}
                    onChange={setSelectValue}
                    options={selectOptions}
                    placeholder="请选择城市"
                    triggerClassName="h-11 bg-slate-50"
                  />
                  <div className="text-xs font-mono text-slate-400">value: {selectValue || "-"}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-slate-500">MultiSelect</div>
                  <DemoMultiSelect value={multiSelectValue} onChange={setMultiSelectValue} options={selectOptions} placeholder="请选择多个城市" />
                  <div className="text-xs font-mono text-slate-400">value: {multiSelectValue.length ? multiSelectValue.join(", ") : "-"}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800">5. Textarea</h3>
              <div className="space-y-2">
                <textarea
                  value={textareaValue}
                  onChange={(event) => setTextareaValue(event.target.value)}
                  placeholder="请输入多行内容..."
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
                <div className="text-xs font-mono text-slate-400">len: {textareaValue.length}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteModal}
    </div>
  );
}
