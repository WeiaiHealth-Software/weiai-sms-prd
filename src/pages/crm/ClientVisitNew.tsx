/* eslint-disable no-empty */
/* eslint-disable react-hooks/set-state-in-effect */
import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Cake, CaretDown, Check, CreditCard, FloppyDisk, Money, Phone, PencilSimple, Wallet, WechatLogo } from "@phosphor-icons/react";
import Select, { type SelectOption } from "../../components/form/Select";
import {
  archiveGenderOptions,
  archiveMemberOptions,
  archivePaymentStatusOptions,
  archiveSourceOptions,
  historyVisits,
  patients,
  visitDetailRecords,
  type ArchiveModuleKey,
  type Followup,
  type Visit,
  type VisitDetailRecord,
  type VisitExamRow,
} from "./mockData";

const archiveEyeOptions: SelectOption[] = [
  { value: "双眼", label: "双眼" },
  { value: "右眼", label: "右眼（OD）" },
  { value: "左眼", label: "左眼（OS）" },
];

const archiveDurationUnitOptions: SelectOption[] = [
  { value: "日", label: "日" },
  { value: "周", label: "周" },
  { value: "月", label: "月" },
  { value: "年", label: "年" },
];

const clinicVisitTypeOptions: SelectOption[] = [
  { value: "初诊", label: "初诊" },
  { value: "复查", label: "复查" },
  { value: "视训", label: "视训" },
  { value: "配镜", label: "配镜" },
  { value: "角膜塑形镜", label: "角膜塑形镜" },
  { value: "离焦框架镜", label: "离焦框架镜" },
  { value: "离焦软镜", label: "离焦软镜" },
  { value: "哺光仪", label: "哺光仪" },
  { value: "视训", label: "视训" },
  { value: "用药", label: "用药" },
  { value: "定期复查", label: "定期复查" },
];

const fittingPrescriptionTypeOptions: SelectOption[] = [
  { value: "近视镜", label: "近视镜" },
  { value: "OK镜", label: "OK镜" },
  { value: "离焦镜", label: "离焦镜" },
  { value: "离焦框架镜", label: "离焦框架镜" },
  { value: "离焦软镜", label: "离焦软镜" },
  { value: "RGP硬镜", label: "RGP硬镜" },
  { value: "软性隐形眼镜", label: "软性隐形眼镜" },
  { value: "渐进多焦点镜", label: "渐进多焦点镜" },
  { value: "防蓝光镜", label: "防蓝光镜" },
  { value: "太阳镜", label: "太阳镜" },
  { value: "其他", label: "其他" },
];

const paymentSourceOptions: SelectOption[] = [
  { value: "现金", label: "现金" },
  { value: "支付宝", label: "支付宝" },
  { value: "微信", label: "微信" },
  { value: "银行卡", label: "银行卡" },
];

function PaymentSourceIcon({ value }: { value: string }) {
  const baseClassName = "h-4 w-4 shrink-0";
  switch (value) {
    case "现金":
      return <Money weight="fill" className={`${baseClassName} text-emerald-500`} />;
    case "支付宝":
      return <Wallet weight="fill" className={`${baseClassName} text-sky-500`} />;
    case "微信":
      return <WechatLogo weight="fill" className={`${baseClassName} text-emerald-600`} />;
    case "银行卡":
      return <CreditCard weight="fill" className={`${baseClassName} text-slate-500`} />;
    default:
      return <Wallet weight="fill" className={`${baseClassName} text-slate-400`} />;
  }
}

function formatDateOnly(value?: string) {
  if (!value) return "-";
  return String(value).split(" ")[0];
}

function formatTodayISO() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function inferBirthday(age: number) {
  return `${new Date().getFullYear() - age}-01-01`;
}

function calculateAge(birthday: string) {
  if (!birthday) return null;
  const normalized = birthday.includes("/") ? birthday.replaceAll("/", "-") : birthday;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - parsed.getFullYear();
  const monthDelta = today.getMonth() - parsed.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < parsed.getDate())) {
    age -= 1;
  }
  return age < 0 ? null : age;
}

type FollowupCycleValue = {
  unit: "日" | "周" | "月" | "年";
  count: string;
};

function parseFollowupCycle(value?: string): FollowupCycleValue {
  const fallback: FollowupCycleValue = { unit: "月", count: "1" };
  if (!value) return fallback;
  const cleaned = value.replaceAll(" ", "").replaceAll("次", "");
  const normalized = cleaned.includes("/") ? cleaned : cleaned.replaceAll("每", "").replaceAll("·", "/");
  const parts = normalized.split("/");
  if (parts.length !== 2) return fallback;
  const count = parts[0] || fallback.count;
  const unit = parts[1] as FollowupCycleValue["unit"];
  if (!["日", "周", "月", "年"].includes(unit)) return fallback;
  if (!/^\d+$/.test(count)) return fallback;
  return { unit, count: String(Math.max(1, Math.min(10, Number(count)))) };
}

function FollowupCycleCascader({
  value,
  onChange,
}: {
  value: FollowupCycleValue;
  onChange: (value: FollowupCycleValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [activeUnit, setActiveUnit] = useState<FollowupCycleValue["unit"]>(value.unit);

  useEffect(() => {
    setActiveUnit(value.unit);
  }, [value.unit]);

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
  }, [open, wrapperRef]);

  const unitOptions: Array<FollowupCycleValue["unit"]> = ["日", "周", "月", "年"];
  const countOptions = Array.from({ length: 10 }, (_, index) => String(index + 1));
  const label = `${value.count}/${value.unit}`;

  return (
    <div
      ref={(el) => {
        wrapperRef.current = el;
      }}
      className="relative"
    >
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={clsx(
          "flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 text-left text-sm text-gray-800",
          "outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
        )}
      >
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <span className={clsx("text-gray-400 transition-transform", open && "rotate-180")}>▾</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="grid grid-cols-2">
            <div className="max-h-64 overflow-auto p-1 border-r border-gray-100">
              {unitOptions.map((unit) => {
                const active = unit === activeUnit;
                return (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => setActiveUnit(unit)}
                    className={clsx(
                      "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      active ? "bg-primary-50 text-primary-700 font-semibold" : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    {unit}
                  </button>
                );
              })}
            </div>
            <div className="max-h-64 overflow-auto p-1">
              {countOptions.map((count) => {
                const selected = value.unit === activeUnit && value.count === count;
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => {
                      onChange({ unit: activeUnit, count });
                      setOpen(false);
                    }}
                    className={clsx(
                      "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors flex items-center justify-between",
                      selected ? "bg-primary-50 text-primary-700 font-semibold" : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <span>{count}</span>
                    <span className="text-gray-300">›</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Switch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        checked ? "bg-primary-500" : "bg-gray-200"
      )}
    >
      <span
        className={clsx(
          "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-5" : "translate-x-1"
        )}
      />
    </button>
  );
}

function ExamTable({
  title,
  rows,
  onChange,
}: {
  title: string;
  rows: VisitExamRow[];
  onChange: (rows: VisitExamRow[]) => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
      <div className="border-b border-gray-100 bg-gray-50 px-5 py-4 text-sm font-bold text-gray-900">{title}</div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.18em] text-gray-400">
            <tr>
              <th className="px-5 py-4 font-semibold">检查项目</th>
              <th className="px-5 py-4 font-semibold">右眼（OD）</th>
              <th className="px-5 py-4 font-semibold">左眼（OS）</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row, idx) => {
              const rightNow = row.right ?? "";
              const leftNow = row.left ?? "";
              const isBoolean = row.type === "boolean";
              const rightChecked = rightNow === "阳性";
              const leftChecked = leftNow === "阳性";
              return (
                <tr key={`${row.label}-${idx}`} className="hover:bg-gray-50">
                  <td className="px-5 py-4 font-semibold text-gray-700 whitespace-nowrap">{row.label}</td>
                  <td className="px-5 py-4">
                    {isBoolean ? (
                      <div className="flex items-center gap-2">
                        <span className={clsx("text-sm font-semibold", !rightChecked ? "text-primary-600" : "text-gray-400")}>
                          阴性
                        </span>
                        <Switch
                          checked={rightChecked}
                          onChange={(checked) => {
                            onChange(rows.map((r, i) => (i === idx ? { ...r, right: checked ? "阳性" : "阴性" } : r)));
                          }}
                        />
                        <span className={clsx("text-sm font-semibold", rightChecked ? "text-primary-600" : "text-gray-400")}>
                          阳性
                        </span>
                      </div>
                    ) : (
                      <input
                        value={rightNow}
                        onChange={(e) => {
                          onChange(rows.map((r, i) => (i === idx ? { ...r, right: e.target.value } : r)));
                        }}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                      />
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {isBoolean ? (
                      <div className="flex items-center gap-2">
                        <span className={clsx("text-sm font-semibold", !leftChecked ? "text-primary-600" : "text-gray-400")}>
                          阴性
                        </span>
                        <Switch
                          checked={leftChecked}
                          onChange={(checked) => {
                            onChange(rows.map((r, i) => (i === idx ? { ...r, left: checked ? "阳性" : "阴性" } : r)));
                          }}
                        />
                        <span className={clsx("text-sm font-semibold", leftChecked ? "text-primary-600" : "text-gray-400")}>
                          阳性
                        </span>
                      </div>
                    ) : (
                      <input
                        value={leftNow}
                        onChange={(e) => {
                          onChange(rows.map((r, i) => (i === idx ? { ...r, left: e.target.value } : r)));
                        }}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getMemberTagClass(value: string) {
  if (value === "VIP") return "border-violet-100 bg-violet-50 text-violet-700";
  if (value === "SVIP") return "border-fuchsia-100 bg-fuchsia-50 text-fuchsia-700";
  return "border-slate-200 bg-slate-100 text-slate-600";
}

function getSourceTagClass(value: string) {
  if (value === "自然") return "border-emerald-100 bg-emerald-50 text-emerald-700";
  if (value === "美团") return "border-amber-100 bg-amber-50 text-amber-700";
  if (value === "小红书") return "border-rose-100 bg-rose-50 text-rose-700";
  if (value === "海华") return "border-teal-100 bg-teal-50 text-teal-700";
  return "border-slate-200 bg-slate-100 text-slate-600";
}

function ModuleStatusBadge({ status }: { status: string }) {
  const className =
    status === "已录入"
      ? "border-green-100 bg-green-50 text-green-700"
      : status === "已保存"
        ? "border-indigo-100 bg-indigo-50 text-indigo-700"
      : status === "草稿"
        ? "border-amber-100 bg-amber-50 text-amber-700"
        : "border-slate-200 bg-slate-100 text-slate-600";

  return <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}>{status}</span>;
}

function SectionHint({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <div className="text-lg font-bold text-gray-900">{title}</div>
      <div className="mt-1 text-sm text-gray-500">{desc}</div>
    </div>
  );
}

export default function ClientVisitNew() {
  const navigate = useNavigate();
  const params = useParams();
  const id = String(params.id ?? "");
  const isNewClient = id === "new";
  const patient = useMemo(() => {
    if (isNewClient) return null;
    return patients.find((p) => p.id === id) ?? patients[0] ?? null;
  }, [id, isNewClient]);
  const seed = useMemo(() => {
    if (isNewClient) {
      const template = visitDetailRecords.v1 ?? Object.values(visitDetailRecords)[0];
      return {
        basicInfo: { doctor: "", optometrist: "" },
        chiefHistory: {
          eye: "双眼",
          symptom: "",
          duration: "",
          durationUnit: "日",
          description: "",
        },
        eyeExam: (template?.eyeExam ?? []).map((row) => ({ ...row, right: "", left: "" })),
        auxExam: (template?.auxExam ?? []).map((row) => ({ ...row, right: "", left: "" })),
        diagnosis: "",
        treatment: {
          advice: "",
          followupCycle: "",
          estimatedDate: "",
          reminderDate: "",
        },
      };
    }
    const latest = historyVisits[0]?.id ?? "v1";
    return visitDetailRecords[latest] ?? visitDetailRecords.v1;
  }, [isNewClient]);
  const draftStorageKey = useMemo(
    () => `clientVisitDraft:${isNewClient ? "new" : patient?.id ?? id}`,
    [id, isNewClient, patient?.id]
  );

  const moduleMeta: Array<{ key: ArchiveModuleKey; label: string; desc: string }> = [
    { key: "clinic", label: "就诊档案", desc: "检查 / 诊断 / 处理 / 复查建议" },
    { key: "training", label: "视光训练", desc: "视训项目与训练数据" },
    { key: "fitting", label: "配镜记录", desc: "处方与配镜参数" },
    { key: "billing", label: "收费详情", desc: "收费单与支付状态" },
  ];

  const [isBasicEditing, setIsBasicEditing] = useState(false);
  const [basicForm, setBasicForm] = useState<{
    name: string;
    mobile: string;
    gender?: "男" | "女";
    birthday: string;
    source?: string;
    memberLevel?: string;
  }>({
    name: "",
    mobile: "",
    gender: undefined,
    birthday: "",
    source: undefined,
    memberLevel: undefined,
  });
  const [selectedModules, setSelectedModules] = useState<Record<ArchiveModuleKey, boolean>>({
    clinic: true,
    training: false,
    fitting: false,
    billing: false,
  });
  const [collapsedModules, setCollapsedModules] = useState<Record<ArchiveModuleKey, boolean>>({
    clinic: false,
    training: false,
    fitting: false,
    billing: false,
  });
  const [moduleStatus, setModuleStatus] = useState<Record<ArchiveModuleKey, string>>({
    clinic: "草稿",
    training: "未录入",
    fitting: "未录入",
    billing: "未录入",
  });
  const [clinicForm, setClinicForm] = useState({
    visitDate: formatTodayISO(),
    visitType: "",
    doctor: "",
    optometrist: "",
    eye: "双眼",
    symptom: "",
    duration: "",
    durationUnit: "日",
    description: "",
    eyeExam: [] as VisitExamRow[],
    auxExam: [] as VisitExamRow[],
    diagnosis: "",
    advice: "",
    followupUnit: "月" as FollowupCycleValue["unit"],
    followupCount: "1",
    enableReminder: false,
    estimatedDate: "",
    reminderDate: "",
  });
  const [trainingForm, setTrainingForm] = useState({
    trainingDate: formatTodayISO(),
    trainer: "",
    store: "",
    project: "",
    duration: "",
    completion: "",
    note: "",
  });
  const [fittingForm, setFittingForm] = useState({
    fittingDate: formatTodayISO(),
    prescriptionType: "",
    lensInfo: "",
    frameInfo: "",
    fittingNote: "",
  });
  const [billingForm, setBillingForm] = useState({
    billingDate: formatTodayISO(),
    item: "",
    amount: "",
    paymentStatus: "未收费",
    paymentSource: "",
    note: "",
  });
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    const rawDraft = window.localStorage.getItem(draftStorageKey);
    if (rawDraft) {
      try {
        const parsed = JSON.parse(rawDraft) as {
          version: number;
          isBasicEditing?: boolean;
          basicForm?: typeof basicForm;
          selectedModules?: typeof selectedModules;
          collapsedModules?: typeof collapsedModules;
          moduleStatus?: typeof moduleStatus;
          clinicForm?: typeof clinicForm;
          trainingForm?: typeof trainingForm;
          fittingForm?: typeof fittingForm;
          billingForm?: typeof billingForm;
        };
        if (parsed.version === 1) {
          setIsBasicEditing(parsed.isBasicEditing ?? (isNewClient || !patient));
          setBasicForm(
            parsed.basicForm ?? {
              name: "",
              mobile: "",
              gender: undefined,
              birthday: "",
              source: undefined,
              memberLevel: undefined,
            }
          );
          setSelectedModules(parsed.selectedModules ?? { clinic: true, training: false, fitting: false, billing: false });
          setCollapsedModules(parsed.collapsedModules ?? { clinic: false, training: false, fitting: false, billing: false });
          setModuleStatus(parsed.moduleStatus ?? { clinic: "草稿", training: "未录入", fitting: "未录入", billing: "未录入" });
          setClinicForm((prev) => ({
            ...prev,
            ...parsed.clinicForm,
            visitType:
              (parsed.clinicForm as unknown as { visitType?: string; visitTypes?: string[] } | undefined)?.visitType ??
              (parsed.clinicForm as unknown as { visitTypes?: string[] } | undefined)?.visitTypes?.[0] ??
              prev.visitType,
            eyeExam: parsed.clinicForm?.eyeExam ?? prev.eyeExam,
            auxExam: parsed.clinicForm?.auxExam ?? prev.auxExam,
          }));
          setTrainingForm((prev) => ({ ...prev, ...parsed.trainingForm }));
          setFittingForm((prev) => ({
            ...prev,
            ...parsed.fittingForm,
            lensInfo:
              (parsed.fittingForm as unknown as { lensInfo?: string; productInfo?: string } | undefined)?.lensInfo ??
              (parsed.fittingForm as unknown as { productInfo?: string } | undefined)?.productInfo ??
              prev.lensInfo,
            frameInfo: (parsed.fittingForm as unknown as { frameInfo?: string } | undefined)?.frameInfo ?? prev.frameInfo,
          }));
          setBillingForm((prev) => ({ ...prev, ...parsed.billingForm }));
          setSavedMessage("已恢复上次草稿");
          return;
        }
      } catch {}
    }

    if (isNewClient || !patient) {
      setIsBasicEditing(true);
      setBasicForm({
        name: "",
        mobile: "",
        gender: undefined,
        birthday: "",
        source: undefined,
        memberLevel: undefined,
      });
    } else {
      setIsBasicEditing(false);
      setBasicForm({
        name: patient.name,
        mobile: patient.mobile.replace(/\s+/g, ""),
        gender: patient.gender,
        birthday: inferBirthday(patient.age),
        source: patient.profile?.source ?? "自然",
        memberLevel: patient.profile?.memberLevel ?? "普通用户",
      });
    }

    setSelectedModules({ clinic: true, training: false, fitting: false, billing: false });
    setCollapsedModules({ clinic: false, training: false, fitting: false, billing: false });
    setModuleStatus({ clinic: "草稿", training: "未录入", fitting: "未录入", billing: "未录入" });
    const followup = parseFollowupCycle(seed.treatment.followupCycle);
    const enableReminder = Boolean(seed.treatment.estimatedDate || seed.treatment.reminderDate);
    setClinicForm({
      visitDate: formatTodayISO(),
      visitType: patient?.followupType ?? "",
      doctor: seed.basicInfo.doctor,
      optometrist: seed.basicInfo.optometrist,
      eye: seed.chiefHistory.eye,
      symptom: seed.chiefHistory.symptom,
      duration: seed.chiefHistory.duration,
      durationUnit: seed.chiefHistory.durationUnit,
      description: seed.chiefHistory.description,
      eyeExam: seed.eyeExam,
      auxExam: seed.auxExam,
      diagnosis: seed.diagnosis,
      advice: seed.treatment.advice,
      followupUnit: followup.unit,
      followupCount: followup.count,
      enableReminder,
      estimatedDate: enableReminder ? seed.treatment.estimatedDate || formatTodayISO() : seed.treatment.estimatedDate,
      reminderDate: enableReminder ? seed.treatment.reminderDate || formatTodayISO() : seed.treatment.reminderDate,
    });
    setTrainingForm({
      trainingDate: formatTodayISO(),
      trainer: patient?.owner ?? "",
      store: patient?.store ?? "",
      project: "",
      duration: "",
      completion: "",
      note: "",
    });
    setFittingForm({ fittingDate: formatTodayISO(), prescriptionType: "", lensInfo: "", frameInfo: "", fittingNote: "" });
    setBillingForm({ billingDate: formatTodayISO(), item: "", amount: "", paymentStatus: "未收费", paymentSource: "", note: "" });
    setSavedMessage("");
  }, [draftStorageKey, id, isNewClient, patient, seed]);

  function markModuleDraft(module: ArchiveModuleKey) {
    setSavedMessage("");
    setModuleStatus((prev) => ({
      ...prev,
      [module]: prev[module] === "已录入" ? "已录入" : "草稿",
    }));
  }

  function toggleModule(module: ArchiveModuleKey) {
    setSavedMessage("");
    setSelectedModules((prev) => {
      const nextSelected = !prev[module];
      if (nextSelected) {
        setCollapsedModules((collapsedPrev) => ({ ...collapsedPrev, [module]: false }));
      }
      setModuleStatus((statusPrev) => ({
        ...statusPrev,
        [module]: nextSelected
          ? statusPrev[module] === "未录入"
            ? "草稿"
            : statusPrev[module]
          : "未录入",
      }));
      return { ...prev, [module]: nextSelected };
    });
  }

  function handleSelectAll() {
    setSelectedModules({ clinic: true, training: true, fitting: true, billing: true });
    setCollapsedModules({ clinic: false, training: false, fitting: false, billing: false });
    setModuleStatus((prev) => ({
      clinic: prev.clinic === "未录入" ? "草稿" : prev.clinic,
      training: prev.training === "未录入" ? "草稿" : prev.training,
      fitting: prev.fitting === "未录入" ? "草稿" : prev.fitting,
      billing: prev.billing === "未录入" ? "草稿" : prev.billing,
    }));
    setSavedMessage("");
  }

  function handleProfileOnly() {
    setSelectedModules({ clinic: false, training: false, fitting: false, billing: false });
    setCollapsedModules({ clinic: false, training: false, fitting: false, billing: false });
    setModuleStatus({
      clinic: "未录入",
      training: "未录入",
      fitting: "未录入",
      billing: "未录入",
    });
    setSavedMessage("");
  }

  function handleSaveDraft() {
    const nextModuleStatus: Record<ArchiveModuleKey, string> = {
      clinic: selectedModules.clinic ? (moduleStatus.clinic === "已录入" ? "已录入" : "已保存") : moduleStatus.clinic,
      training: selectedModules.training
        ? moduleStatus.training === "已录入"
          ? "已录入"
          : "已保存"
        : moduleStatus.training,
      fitting: selectedModules.fitting ? (moduleStatus.fitting === "已录入" ? "已录入" : "已保存") : moduleStatus.fitting,
      billing: selectedModules.billing ? (moduleStatus.billing === "已录入" ? "已录入" : "已保存") : moduleStatus.billing,
    };
    window.localStorage.setItem(
      draftStorageKey,
      JSON.stringify({
        version: 1,
        isBasicEditing,
        basicForm,
        selectedModules,
        collapsedModules,
        moduleStatus: nextModuleStatus,
        clinicForm,
        trainingForm,
        fittingForm,
        billingForm,
      })
    );
    setModuleStatus(nextModuleStatus);
    setSavedMessage("草稿已保存");
  }

  function handleFinish() {
    setSavedMessage(isNewClient ? "新增档案已完成，正在返回档案列表..." : "新增档案已完成，正在返回客户详情...");
    setModuleStatus((prev) => ({
      clinic: selectedModules.clinic ? "已录入" : prev.clinic,
      training: selectedModules.training ? "已录入" : prev.training,
      fitting: selectedModules.fitting ? "已录入" : prev.fitting,
      billing: selectedModules.billing ? "已录入" : prev.billing,
    }));
    if (patient) {
      const visitId = `local-${Date.now()}`;
      const visitTypes: NonNullable<Visit["visitTypes"]> = [];
      if (selectedModules.clinic) visitTypes.push("就诊");
      if (selectedModules.training) visitTypes.push("视光训练");
      if (selectedModules.fitting) visitTypes.push("配镜");
      const visit: Visit = {
        id: visitId,
        date: clinicForm.visitDate || formatTodayISO(),
        personType: patient.latestVisit ? "复诊" : "初诊",
        store: patient.store ?? "",
        diagnosis: clinicForm.diagnosis || "-",
        treatment: clinicForm.advice || "-",
        axial: "-",
        va: "-",
        summary: clinicForm.description || "-",
        review: clinicForm.enableReminder ? clinicForm.estimatedDate || "-" : "-",
        visitTypes,
      };

      const detail: VisitDetailRecord = {
        basicInfo: { doctor: clinicForm.doctor, optometrist: clinicForm.optometrist },
        chiefHistory: {
          eye: clinicForm.eye,
          symptom: clinicForm.symptom,
          duration: clinicForm.duration,
          durationUnit: clinicForm.durationUnit,
          description: clinicForm.description,
        },
        eyeExam: clinicForm.eyeExam,
        auxExam: clinicForm.auxExam,
        diagnosis: clinicForm.diagnosis,
        treatment: {
          inspection: { item: "", quantity: "", unit: "", price: "", total: "" },
          prescription: { drug: "", quantity: "", spec: "", unit: "", price: "", eye: "", usage: "", total: "" },
          therapy: { item: "", quantity: "", unit: "", price: "", total: "" },
          advice: clinicForm.advice,
          followupCycle: `${clinicForm.followupCount}/${clinicForm.followupUnit}`,
          estimatedDate: clinicForm.enableReminder ? clinicForm.estimatedDate : "",
          reminderDate: clinicForm.enableReminder ? clinicForm.reminderDate : "",
        },
      };

      const visitsKey = `clientVisits:${patient.id}`;
      const detailsKey = `clientVisitDetails:${patient.id}`;
      const followupsKey = `clientFollowups:${patient.id}`;

      const prevVisits = (JSON.parse(window.localStorage.getItem(visitsKey) ?? "[]") as Visit[]).filter(Boolean);
      window.localStorage.setItem(visitsKey, JSON.stringify([visit, ...prevVisits]));

      const prevDetails = JSON.parse(window.localStorage.getItem(detailsKey) ?? "{}") as Record<string, VisitDetailRecord>;
      window.localStorage.setItem(detailsKey, JSON.stringify({ ...prevDetails, [visitId]: detail }));

      if (clinicForm.enableReminder && clinicForm.estimatedDate) {
        const followup: Followup = {
          id: `lf-${Date.now()}`,
          patient: patient.name,
          latestVisit: visit.date,
          diagnosis: clinicForm.diagnosis || "复查回访",
          treatment: clinicForm.advice || "-",
          reviewDate: clinicForm.estimatedDate,
          reminderDate: clinicForm.reminderDate || clinicForm.estimatedDate,
          status: "待跟进",
          result: "未联系",
          owner: patient.owner ?? "",
        };
        const prevFollowups = (JSON.parse(window.localStorage.getItem(followupsKey) ?? "[]") as Followup[]).filter(Boolean);
        window.localStorage.setItem(followupsKey, JSON.stringify([followup, ...prevFollowups]));
      }
    }
    window.localStorage.removeItem(draftStorageKey);
    window.setTimeout(() => {
      if (isNewClient) navigate("/crm/client-list");
      else if (patient) navigate(`/crm/client/${patient.id}`);
      else navigate("/crm/client-list");
    }, 600);
  }

  const hasSelectedModule = Object.values(selectedModules).some(Boolean);

  const genderOptions = useMemo<SelectOption[]>(
    () => archiveGenderOptions.map((item) => ({ value: item, label: item })),
    []
  );
  const sourceOptions = useMemo<SelectOption[]>(
    () => archiveSourceOptions.map((item) => ({ value: item, label: item })),
    []
  );
  const memberOptions = useMemo<SelectOption[]>(
    () => archiveMemberOptions.map((item) => ({ value: item, label: item })),
    []
  );
  const paymentStatusOptions = useMemo<SelectOption[]>(
    () => archivePaymentStatusOptions.map((item) => ({ value: item, label: item })),
    []
  );

  const basicAge = useMemo(() => {
    const derived = calculateAge(basicForm.birthday);
    if (derived != null) return String(derived);
    if (patient) return String(patient.age);
    return "";
  }, [basicForm.birthday, patient]);

  return (
    <div className="min-h-full flex flex-col gap-6">
      <div className="bg-white rounded-2xl card-shadow border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                onClick={() => {
                  if (isNewClient) navigate("/crm/client-list");
                  else if (patient) navigate(`/crm/client/${patient.id}`);
                  else navigate("/crm/client-list");
                }}
              >
                <ArrowLeft weight="bold" className="h-4 w-4" />
                {isNewClient ? "返回列表" : "返回详情"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                onClick={handleSaveDraft}
              >
                <FloppyDisk weight="bold" className="h-4 w-4" />
                保存草稿
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 active:bg-primary-700"
                onClick={handleFinish}
              >
                完成并返回
              </button>
            </div>
          </div>
          {savedMessage && (
            <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              {savedMessage}
            </div>
          )}
        </div>

        <div className="p-5 space-y-5">
          <section className="rounded-2xl border border-gray-100 bg-white p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <SectionHint title="档案基础信息" desc="先建档，再选择是否录入本次服务单，可选就诊 / 视训 / 配镜 / 收费。" />
              {isNewClient ? (
                <button
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  onClick={() => navigate("/crm/client-list")}
                >
                  返回档案列表
                </button>
              ) : (
                <button
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                  onClick={() => {
                    if (isBasicEditing) {
                      setIsBasicEditing(false);
                      if (patient) {
                        setBasicForm({
                          name: patient.name,
                          mobile: patient.mobile.replace(/\s+/g, ""),
                          gender: patient.gender,
                          birthday: inferBirthday(patient.age),
                          source: patient.profile?.source ?? "自然",
                          memberLevel: patient.profile?.memberLevel ?? "普通用户",
                        });
                      }
                      return;
                    }
                    setIsBasicEditing(true);
                  }}
                >
                  <PencilSimple weight="bold" className="h-4 w-4" />
                  {isBasicEditing ? "取消编辑" : "编辑信息"}
                </button>
              )}
            </div>
            {!isNewClient && patient && !isBasicEditing ? (
              <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={
                        basicForm.gender === "男"
                          ? "inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-700"
                          : "inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-700"
                      }
                    >
                      <span className="text-xl font-bold">{basicForm.gender === "男" ? "♂" : "♀"}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-gray-900 truncate">{basicForm.name || "-"}</span>
                        <span className="text-xs text-gray-400">{basicAge ? `${basicAge}岁` : "-"}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-2">
                          <Phone weight="bold" className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold text-gray-700">{basicForm.mobile || "-"}</span>
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Cake weight="bold" className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold text-gray-700">{basicForm.birthday || "-"}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {basicForm.memberLevel ? (
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getMemberTagClass(
                          basicForm.memberLevel
                        )}`}
                      >
                        {basicForm.memberLevel}
                      </span>
                    ) : null}
                    {basicForm.source ? (
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getSourceTagClass(
                          basicForm.source
                        )}`}
                      >
                        {basicForm.source}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <div>
                  <div className="text-sm text-gray-500">姓名</div>
                  <input
                    value={basicForm.name}
                    onChange={(e) => setBasicForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div>
                  <div className="text-sm text-gray-500">手机号</div>
                  <input
                    value={basicForm.mobile}
                    onChange={(e) => setBasicForm((prev) => ({ ...prev, mobile: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div>
                  <div className="text-sm text-gray-500">性别</div>
                  <Select
                    className="mt-2"
                    value={basicForm.gender}
                    onChange={(next) => setBasicForm((prev) => ({ ...prev, gender: next as "男" | "女" }))}
                    options={genderOptions}
                    triggerClassName="border-gray-200 bg-white px-4 text-gray-800 hover:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div>
                  <div className="text-sm text-gray-500">出生日期</div>
                  <input
                    type="date"
                    value={basicForm.birthday}
                    onChange={(e) => setBasicForm((prev) => ({ ...prev, birthday: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div>
                  <div className="text-sm text-gray-500">年龄</div>
                  <input
                    readOnly
                    value={basicAge}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none"
                  />
                </div>
                <div>
                  <div className="text-sm text-gray-500">客户来源</div>
                  <Select
                    className="mt-2"
                    value={basicForm.source}
                    onChange={(next) => setBasicForm((prev) => ({ ...prev, source: next }))}
                    options={sourceOptions}
                    triggerClassName="border-gray-200 bg-white px-4 text-gray-800 hover:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div>
                  <div className="text-sm text-gray-500">会员类型</div>
                  <Select
                    className="mt-2"
                    value={basicForm.memberLevel}
                    onChange={(next) => setBasicForm((prev) => ({ ...prev, memberLevel: next }))}
                    options={memberOptions}
                    triggerClassName="border-gray-200 bg-white px-4 text-gray-800 hover:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <SectionHint title="本次服务单（可选）" desc="支持单独录入一个模块，也支持一次录入多个模块。默认已勾选“就诊档案”。" />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  onClick={handleSelectAll}
                >
                  完整录入
                </button>
                <button
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  onClick={handleProfileOnly}
                >
                  只建档
                </button>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {moduleMeta.map((module) => (
                <button
                  key={module.key}
                  className={selectedModules[module.key]
                    ? "flex w-full items-start justify-between rounded-2xl border border-primary-100 bg-primary-50 px-4 py-4 text-left"
                    : "flex w-full items-start justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4 text-left hover:bg-white"}
                  onClick={() => toggleModule(module.key)}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={
                        selectedModules[module.key]
                          ? "mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-primary-200 bg-primary-500 text-xs text-white"
                          : "mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 bg-white text-xs text-gray-400"
                      }
                    >
                      {selectedModules[module.key] ? "✓" : ""}
                    </span>
                    <div>
                      <div className="text-base font-semibold text-gray-900">{module.label}</div>
                      <div className="mt-1 text-sm text-gray-500">{module.desc}</div>
                    </div>
                  </div>
                  <ModuleStatusBadge status={moduleStatus[module.key]} />
                </button>
              ))}
            </div>
          </section>

          {selectedModules.clinic && (
            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex w-full items-start justify-between gap-3 text-left">
                <SectionHint title="就诊档案" desc="检查 / 诊断 / 处理 / 复查建议" />
                <div className="flex items-center gap-2">
                  <ModuleStatusBadge status={moduleStatus.clinic} />
                  <button
                    type="button"
                    aria-label={collapsedModules.clinic ? "展开就诊档案" : "折叠就诊档案"}
                    className="inline-flex cursor-pointer items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-50"
                    onClick={() => setCollapsedModules((prev) => ({ ...prev, clinic: !prev.clinic }))}
                  >
                    <CaretDown
                      weight="bold"
                      className={clsx(
                        "h-4 w-4 text-gray-400 transition-transform",
                        collapsedModules.clinic ? "-rotate-90" : "rotate-0"
                      )}
                    />
                  </button>
                </div>
              </div>
              {!collapsedModules.clinic && <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-gray-100 bg-white">
                  <div className="border-b border-gray-100 bg-gray-50 px-5 py-4 text-sm font-bold text-gray-900">
                    就诊信息
                  </div>
                  <div className="p-5">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <div>
                        <div className="text-sm text-gray-500">就诊日期</div>
                        <input
                          type="date"
                          value={clinicForm.visitDate}
                          onChange={(e) => {
                            setClinicForm((prev) => ({ ...prev, visitDate: e.target.value }));
                            markModuleDraft("clinic");
                          }}
                          className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                        />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">就诊类型</div>
                        <Select
                          className="mt-2"
                          value={clinicForm.visitType}
                          onChange={(next) => {
                            setClinicForm((prev) => ({ ...prev, visitType: next }));
                            markModuleDraft("clinic");
                          }}
                          options={clinicVisitTypeOptions}
                          placeholder="请选择"
                          triggerClassName="border-gray-200 bg-white px-4 text-gray-800 hover:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                          dropdownClassName="border-gray-200"
                        />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">接诊医生</div>
                        <input
                          value={clinicForm.doctor}
                          onChange={(e) => {
                            setClinicForm((prev) => ({ ...prev, doctor: e.target.value }));
                            markModuleDraft("clinic");
                          }}
                          className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                        />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">验光师</div>
                        <input
                          value={clinicForm.optometrist}
                          onChange={(e) => {
                            setClinicForm((prev) => ({ ...prev, optometrist: e.target.value }));
                            markModuleDraft("clinic");
                          }}
                          className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white">
                  <div className="border-b border-gray-100 bg-gray-50 px-5 py-4 text-sm font-bold text-gray-900">
                    主诉与病史
                  </div>
                  <div className="p-5">
                    <div className="grid gap-4 md:grid-cols-12">
                      <div className="md:col-span-3">
                        <div className="text-sm text-gray-500">眼别</div>
                        <Select
                          className="mt-2"
                          value={clinicForm.eye}
                          onChange={(next) => {
                            setClinicForm((prev) => ({ ...prev, eye: next }));
                            markModuleDraft("clinic");
                          }}
                          options={archiveEyeOptions}
                          triggerClassName="border-gray-200 bg-white px-4 text-gray-800 hover:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                        />
                      </div>
                      <div className="md:col-span-6">
                        <div className="text-sm text-gray-500">主诉</div>
                        <input
                          value={clinicForm.symptom}
                          onChange={(e) => {
                            setClinicForm((prev) => ({ ...prev, symptom: e.target.value }));
                            markModuleDraft("clinic");
                          }}
                          className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <div className="text-sm text-gray-500">持续时长</div>
                        <div className="mt-2 grid grid-cols-[1fr_120px] gap-3">
                          <input
                            value={clinicForm.duration}
                            onChange={(e) => {
                              setClinicForm((prev) => ({ ...prev, duration: e.target.value }));
                              markModuleDraft("clinic");
                            }}
                            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                          />
                          <Select
                            value={clinicForm.durationUnit}
                            onChange={(next) => {
                              setClinicForm((prev) => ({ ...prev, durationUnit: next }));
                              markModuleDraft("clinic");
                            }}
                            options={archiveDurationUnitOptions}
                            triggerClassName="border-gray-200 bg-white px-4 text-gray-800 hover:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-sm text-gray-500">病史描述</div>
                      <textarea
                        value={clinicForm.description}
                        onChange={(e) => {
                          setClinicForm((prev) => ({ ...prev, description: e.target.value }));
                          markModuleDraft("clinic");
                        }}
                        className="mt-2 w-full min-h-[120px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                      />
                    </div>
                  </div>
                </div>

                <ExamTable
                  title="眼部检查"
                  rows={clinicForm.eyeExam}
                  onChange={(rows) => {
                    setClinicForm((prev) => ({ ...prev, eyeExam: rows }));
                    markModuleDraft("clinic");
                  }}
                />

                <ExamTable
                  title="辅助检查"
                  rows={clinicForm.auxExam}
                  onChange={(rows) => {
                    setClinicForm((prev) => ({ ...prev, auxExam: rows }));
                    markModuleDraft("clinic");
                  }}
                />

                <div className="rounded-2xl border border-gray-100 bg-white">
                  <div className="border-b border-gray-100 bg-gray-50 px-5 py-4 text-sm font-bold text-gray-900">
                    诊断与建议
                  </div>
                  <div className="p-5">
                    <div className="grid gap-4 xl:grid-cols-2">
                      <div>
                        <div className="text-sm text-gray-500">诊断</div>
                        <textarea
                          value={clinicForm.diagnosis}
                          onChange={(e) => {
                            setClinicForm((prev) => ({ ...prev, diagnosis: e.target.value }));
                            markModuleDraft("clinic");
                          }}
                          className="mt-2 w-full min-h-[120px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                        />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">医生建议</div>
                        <textarea
                          value={clinicForm.advice}
                          onChange={(e) => {
                            setClinicForm((prev) => ({ ...prev, advice: e.target.value }));
                            markModuleDraft("clinic");
                          }}
                          className="mt-2 w-full min-h-[120px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white">
                  <div className="border-b border-gray-100 bg-gray-50 px-5 py-4 flex items-center justify-between gap-4">
                    <div className="text-sm font-bold text-gray-900">随访与复查</div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-700">{clinicForm.enableReminder ? "已开启" : "未开启"}</span>
                      <Switch
                        checked={clinicForm.enableReminder}
                        onChange={(checked) => {
                          setClinicForm((prev) => ({
                            ...prev,
                            enableReminder: checked,
                            estimatedDate: checked ? prev.estimatedDate || formatTodayISO() : prev.estimatedDate,
                            reminderDate: checked ? prev.reminderDate || formatTodayISO() : prev.reminderDate,
                          }));
                          markModuleDraft("clinic");
                        }}
                      />
                    </div>
                  </div>
                  {clinicForm.enableReminder && (
                    <div className="p-5 space-y-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <div className="text-sm text-gray-500">随访周期</div>
                          <div className="mt-2">
                            <FollowupCycleCascader
                              value={{ unit: clinicForm.followupUnit, count: clinicForm.followupCount }}
                              onChange={(next) => {
                                setClinicForm((prev) => ({ ...prev, followupUnit: next.unit, followupCount: next.count }));
                                markModuleDraft("clinic");
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">复查日期</div>
                          <input
                            type="date"
                            value={clinicForm.estimatedDate}
                            onChange={(e) => {
                              setClinicForm((prev) => ({ ...prev, estimatedDate: e.target.value }));
                              markModuleDraft("clinic");
                            }}
                            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                          />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">提醒日期</div>
                          <input
                            type="date"
                            value={clinicForm.reminderDate}
                            onChange={(e) => {
                              setClinicForm((prev) => ({ ...prev, reminderDate: e.target.value }));
                              markModuleDraft("clinic");
                            }}
                            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>}
            </section>
          )}

          {selectedModules.training && (
            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex w-full items-start justify-between gap-3 text-left">
                <SectionHint title="视光训练" desc="视训项目与训练数据" />
                <div className="flex items-center gap-2">
                  <ModuleStatusBadge status={moduleStatus.training} />
                  <button
                    type="button"
                    aria-label={collapsedModules.training ? "展开视光训练" : "折叠视光训练"}
                    className="inline-flex items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-50"
                    onClick={() => setCollapsedModules((prev) => ({ ...prev, training: !prev.training }))}
                  >
                    <CaretDown
                      weight="bold"
                      className={clsx(
                        "h-4 w-4 text-gray-400 transition-transform",
                        collapsedModules.training ? "-rotate-90" : "rotate-0"
                      )}
                    />
                  </button>
                </div>
              </div>
              {!collapsedModules.training && <div className="mt-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div>
                  <div className="text-sm text-gray-500">视训日期</div>
                  <input
                    type="date"
                    value={trainingForm.trainingDate}
                    onChange={(e) => {
                      setTrainingForm((prev) => ({ ...prev, trainingDate: e.target.value }));
                      markModuleDraft("training");
                    }}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div>
                  <div className="text-sm text-gray-500">视训师</div>
                  <input
                    value={trainingForm.trainer}
                    onChange={(e) => {
                      setTrainingForm((prev) => ({ ...prev, trainer: e.target.value }));
                      markModuleDraft("training");
                    }}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div>
                  <div className="text-sm text-gray-500">门店</div>
                  <input
                    value={trainingForm.store}
                    onChange={(e) => {
                      setTrainingForm((prev) => ({ ...prev, store: e.target.value }));
                      markModuleDraft("training");
                    }}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div>
                  <div className="text-sm text-gray-500">训练项目</div>
                  <input
                    value={trainingForm.project}
                    onChange={(e) => {
                      setTrainingForm((prev) => ({ ...prev, project: e.target.value }));
                      markModuleDraft("training");
                    }}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div>
                  <div className="text-sm text-gray-500">训练时长（分钟）</div>
                  <input
                    value={trainingForm.duration}
                    onChange={(e) => {
                      setTrainingForm((prev) => ({ ...prev, duration: e.target.value }));
                      markModuleDraft("training");
                    }}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div>
                  <div className="text-sm text-gray-500">训练完成度（%）</div>
                  <input
                    value={trainingForm.completion}
                    onChange={(e) => {
                      setTrainingForm((prev) => ({ ...prev, completion: e.target.value }));
                      markModuleDraft("training");
                    }}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm text-gray-500">训练备注</div>
                <textarea
                  value={trainingForm.note}
                  onChange={(e) => {
                    setTrainingForm((prev) => ({ ...prev, note: e.target.value }));
                    markModuleDraft("training");
                  }}
                  className="mt-2 w-full min-h-[120px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                />
              </div>
              </div>}
            </section>
          )}

          {selectedModules.fitting && (
            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex w-full items-start justify-between gap-3 text-left">
                <SectionHint title="配镜记录" desc="处方与配镜参数" />
                <div className="flex items-center gap-2">
                  <ModuleStatusBadge status={moduleStatus.fitting} />
                  <button
                    type="button"
                    aria-label={collapsedModules.fitting ? "展开配镜记录" : "折叠配镜记录"}
                    className="inline-flex items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-50"
                    onClick={() => setCollapsedModules((prev) => ({ ...prev, fitting: !prev.fitting }))}
                  >
                    <CaretDown
                      weight="bold"
                      className={clsx(
                        "h-4 w-4 text-gray-400 transition-transform",
                        collapsedModules.fitting ? "-rotate-90" : "rotate-0"
                      )}
                    />
                  </button>
                </div>
              </div>
              {!collapsedModules.fitting && <div className="mt-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <div className="text-sm text-gray-500">配镜日期</div>
                  <input
                    type="date"
                    value={fittingForm.fittingDate}
                    onChange={(e) => {
                      setFittingForm((prev) => ({ ...prev, fittingDate: e.target.value }));
                      markModuleDraft("fitting");
                    }}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div>
                  <div className="text-sm text-gray-500">配镜类型</div>
                  <Select
                    className="mt-2"
                    value={fittingForm.prescriptionType}
                    onChange={(next) => {
                      setFittingForm((prev) => ({ ...prev, prescriptionType: next }));
                      markModuleDraft("fitting");
                    }}
                    options={fittingPrescriptionTypeOptions}
                    placeholder="请选择"
                    triggerClassName="border-gray-200 bg-white px-4 text-gray-800 hover:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div>
                  <div className="text-sm text-gray-500">镜片信息</div>
                  <input
                    value={fittingForm.lensInfo}
                    onChange={(e) => {
                      setFittingForm((prev) => ({ ...prev, lensInfo: e.target.value }));
                      markModuleDraft("fitting");
                    }}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div>
                  <div className="text-sm text-gray-500">镜架信息</div>
                  <input
                    value={fittingForm.frameInfo}
                    onChange={(e) => {
                      setFittingForm((prev) => ({ ...prev, frameInfo: e.target.value }));
                      markModuleDraft("fitting");
                    }}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm text-gray-500">配镜参数 / 备注</div>
                <textarea
                  value={fittingForm.fittingNote}
                  onChange={(e) => {
                    setFittingForm((prev) => ({ ...prev, fittingNote: e.target.value }));
                    markModuleDraft("fitting");
                  }}
                  className="mt-2 w-full min-h-[120px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                />
              </div>
              </div>}
            </section>
          )}

          {selectedModules.billing && (
            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex w-full items-start justify-between gap-3 text-left">
                <SectionHint title="收费详情" desc="收费单与支付状态" />
                <div className="flex items-center gap-2">
                  <ModuleStatusBadge status={moduleStatus.billing} />
                  <button
                    type="button"
                    aria-label={collapsedModules.billing ? "展开收费详情" : "折叠收费详情"}
                    className="inline-flex items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-50"
                    onClick={() => setCollapsedModules((prev) => ({ ...prev, billing: !prev.billing }))}
                  >
                    <CaretDown
                      weight="bold"
                      className={clsx(
                        "h-4 w-4 text-gray-400 transition-transform",
                        collapsedModules.billing ? "-rotate-90" : "rotate-0"
                      )}
                    />
                  </button>
                </div>
              </div>
              {!collapsedModules.billing && <div className="mt-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <div>
                  <div className="text-sm text-gray-500">收费日期</div>
                  <input
                    type="date"
                    value={billingForm.billingDate}
                    onChange={(e) => {
                      setBillingForm((prev) => ({ ...prev, billingDate: e.target.value }));
                      markModuleDraft("billing");
                    }}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div>
                  <div className="text-sm text-gray-500">收费项目</div>
                  <input
                    value={billingForm.item}
                    onChange={(e) => {
                      setBillingForm((prev) => ({ ...prev, item: e.target.value }));
                      markModuleDraft("billing");
                    }}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div>
                  <div className="text-sm text-gray-500">金额</div>
                  <input
                    value={billingForm.amount}
                    onChange={(e) => {
                      setBillingForm((prev) => ({ ...prev, amount: e.target.value }));
                      markModuleDraft("billing");
                    }}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div>
                  <div className="text-sm text-gray-500">支付状态</div>
                  <Select
                    className="mt-2"
                    value={billingForm.paymentStatus}
                    onChange={(next) => {
                      setBillingForm((prev) => ({ ...prev, paymentStatus: next }));
                      markModuleDraft("billing");
                    }}
                    options={paymentStatusOptions}
                    triggerClassName="border-gray-200 bg-white px-4 text-gray-800 hover:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div>
                  <div className="text-sm text-gray-500">支付来源</div>
                  <Select
                    className="mt-2"
                    value={billingForm.paymentSource || undefined}
                    onChange={(next) => {
                      setBillingForm((prev) => ({ ...prev, paymentSource: next }));
                      markModuleDraft("billing");
                    }}
                    options={paymentSourceOptions}
                    placeholder="请选择"
                    triggerClassName="border-gray-200 bg-white px-4 text-gray-800 hover:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                    renderValue={(option, placeholder) =>
                      option ? (
                        <span className="flex min-w-0 items-center gap-2">
                          <PaymentSourceIcon value={option.value} />
                          <span className="truncate">{option.label}</span>
                        </span>
                      ) : (
                        placeholder
                      )
                    }
                    renderOption={(option, state) => (
                      <div className="flex w-full items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <PaymentSourceIcon value={option.value} />
                          <span className="truncate">{option.label}</span>
                        </div>
                        {state.selected ? <Check className="h-4 w-4 text-primary-600" /> : <span className="h-4 w-4" />}
                      </div>
                    )}
                  />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm text-gray-500">收费备注</div>
                <textarea
                  value={billingForm.note}
                  onChange={(e) => {
                    setBillingForm((prev) => ({ ...prev, note: e.target.value }));
                    markModuleDraft("billing");
                  }}
                  className="mt-2 w-full min-h-[120px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                />
              </div>
              </div>}
            </section>
          )}

          {!hasSelectedModule && (
            <section className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-5 py-6 text-sm text-gray-500">
              当前未选择任何服务模块：将只创建档案，不生成本次服务单。
            </section>
          )}

          <section className="rounded-2xl border border-gray-100 bg-white px-5 py-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-gray-500">
                当前客户：<span className="font-semibold text-gray-700">{patient?.name || basicForm.name || "-"}</span>
                <span className="mx-2 text-gray-300">|</span>
                最近就诊：
                <span className="font-semibold text-gray-700">{formatDateOnly(patient?.latestVisit)}</span>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  onClick={handleSaveDraft}
                >
                  保存草稿
                </button>
                <button
                  className="rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600"
                  onClick={handleFinish}
                >
                  完成并返回
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
