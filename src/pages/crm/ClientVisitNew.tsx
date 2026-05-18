import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, FloppyDisk } from "@phosphor-icons/react";
import {
  archiveGenderOptions,
  archiveMemberOptions,
  archivePaymentStatusOptions,
  archiveSourceOptions,
  historyVisits,
  patients,
  visitDetailRecords,
  type ArchiveModuleKey,
} from "./mockData";

function formatDateOnly(value?: string) {
  if (!value) return "-";
  return String(value).split(" ")[0];
}

function inferBirthday(age: number) {
  return `${new Date().getFullYear() - age}-01-01`;
}

function ModuleStatusBadge({ status }: { status: string }) {
  const className =
    status === "已录入"
      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
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
  const patient = useMemo(() => patients.find((p) => p.id === id) ?? patients[0], [id]);
  const seed = useMemo(() => {
    const latest = historyVisits[0]?.id ?? "v1";
    return visitDetailRecords[latest] ?? visitDetailRecords.v1;
  }, []);

  const moduleMeta: Array<{ key: ArchiveModuleKey; label: string; desc: string }> = [
    { key: "clinic", label: "就诊档案", desc: "检查 / 诊断 / 处理 / 复查建议" },
    { key: "training", label: "视光训练", desc: "视训项目与训练数据" },
    { key: "fitting", label: "配镜记录", desc: "处方与配镜参数" },
    { key: "billing", label: "收费详情", desc: "收费单与支付状态" },
  ];

  const [basicForm, setBasicForm] = useState({
    name: patient.name,
    mobile: patient.mobile.replace(/\s+/g, ""),
    gender: patient.gender,
    birthday: inferBirthday(patient.age),
    source: patient.profile?.source ?? "自然",
    memberLevel: patient.profile?.memberLevel ?? "普通用户",
  });
  const [selectedModules, setSelectedModules] = useState<Record<ArchiveModuleKey, boolean>>({
    clinic: true,
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
    doctor: seed.basicInfo.doctor,
    optometrist: seed.basicInfo.optometrist,
    eye: seed.chiefHistory.eye,
    symptom: seed.chiefHistory.symptom,
    duration: seed.chiefHistory.duration,
    durationUnit: seed.chiefHistory.durationUnit,
    description: seed.chiefHistory.description,
    diagnosis: seed.diagnosis,
    advice: seed.treatment.advice,
    followupCycle: seed.treatment.followupCycle,
    estimatedDate: seed.treatment.estimatedDate,
    reminderDate: seed.treatment.reminderDate,
  });
  const [trainingForm, setTrainingForm] = useState({
    trainingTime: `${formatDateOnly(patient.latestVisit)} 11:20`,
    trainer: patient.owner ?? "苏雨晴",
    store: patient.store ?? "惟爱 · 上海海华医院",
    project: "调节灵敏度训练",
    duration: "20",
    completion: "90",
    note: "本次训练配合度良好，可继续当前计划。",
  });
  const [fittingForm, setFittingForm] = useState({
    prescriptionType: "离焦框架镜",
    productInfo: "1.56 离焦镜片 + 轻量镜架",
    fittingNote: "沿用上次配镜方案，微调镜片参数。",
  });
  const [billingForm, setBillingForm] = useState({
    item: "复查套餐",
    amount: "320",
    paymentStatus: "待支付",
    note: "支持与本次服务单一并收款。",
  });
  const [savedMessage, setSavedMessage] = useState("");

  function markModuleDraft(module: ArchiveModuleKey) {
    setModuleStatus((prev) => ({
      ...prev,
      [module]: prev[module] === "已录入" ? "已录入" : "草稿",
    }));
  }

  function toggleModule(module: ArchiveModuleKey) {
    setSelectedModules((prev) => {
      const nextSelected = !prev[module];
      setModuleStatus((statusPrev) => ({
        ...statusPrev,
        [module]: nextSelected ? (statusPrev[module] === "已录入" ? "已录入" : "草稿") : "未录入",
      }));
      return { ...prev, [module]: nextSelected };
    });
  }

  function handleSelectAll() {
    setSelectedModules({ clinic: true, training: true, fitting: true, billing: true });
    setModuleStatus((prev) => ({
      clinic: prev.clinic === "已录入" ? "已录入" : "草稿",
      training: prev.training === "已录入" ? "已录入" : "草稿",
      fitting: prev.fitting === "已录入" ? "已录入" : "草稿",
      billing: prev.billing === "已录入" ? "已录入" : "草稿",
    }));
    setSavedMessage("");
  }

  function handleProfileOnly() {
    setSelectedModules({ clinic: false, training: false, fitting: false, billing: false });
    setModuleStatus({
      clinic: "未录入",
      training: "未录入",
      fitting: "未录入",
      billing: "未录入",
    });
    setSavedMessage("");
  }

  function handleSaveDraft() {
    setSavedMessage("草稿已保存（本地 mock）");
    setModuleStatus((prev) => ({
      clinic: selectedModules.clinic ? "草稿" : prev.clinic,
      training: selectedModules.training ? "草稿" : prev.training,
      fitting: selectedModules.fitting ? "草稿" : prev.fitting,
      billing: selectedModules.billing ? "草稿" : prev.billing,
    }));
  }

  function handleFinish() {
    setSavedMessage("新增档案已完成，正在返回客户详情...");
    setModuleStatus((prev) => ({
      clinic: selectedModules.clinic ? "已录入" : prev.clinic,
      training: selectedModules.training ? "已录入" : prev.training,
      fitting: selectedModules.fitting ? "已录入" : prev.fitting,
      billing: selectedModules.billing ? "已录入" : prev.billing,
    }));
    window.setTimeout(() => navigate(`/crm/client/${patient.id}`), 600);
  }

  const hasSelectedModule = Object.values(selectedModules).some(Boolean);

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="bg-white rounded-2xl card-shadow border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                onClick={() => navigate(`/crm/client/${patient.id}`)}
              >
                <ArrowLeft weight="bold" className="h-4 w-4" />
                返回详情
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
              <button
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                onClick={() => navigate("/crm/client-list")}
              >
                返回档案列表
              </button>
            </div>
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
                <select
                  value={basicForm.gender}
                  onChange={(e) => setBasicForm((prev) => ({ ...prev, gender: e.target.value as "男" | "女" }))}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                >
                  {archiveGenderOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
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
                <div className="text-sm text-gray-500">客户来源</div>
                <select
                  value={basicForm.source}
                  onChange={(e) => setBasicForm((prev) => ({ ...prev, source: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                >
                  {archiveSourceOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="text-sm text-gray-500">会员类型</div>
                <select
                  value={basicForm.memberLevel}
                  onChange={(e) => setBasicForm((prev) => ({ ...prev, memberLevel: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                >
                  {archiveMemberOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>
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
            <div className="mt-4 space-y-4">
              {moduleMeta.map((module) => (
                <button
                  key={module.key}
                  className={
                    selectedModules[module.key]
                      ? "flex w-full items-center justify-between rounded-2xl border border-primary-100 bg-primary-50 px-4 py-4 text-left"
                      : "flex w-full items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4 text-left hover:bg-white"
                  }
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
              <div className="flex items-center justify-between gap-3">
                <SectionHint title="就诊档案" desc="检查 / 诊断 / 处理 / 复查建议" />
                <ModuleStatusBadge status={moduleStatus.clinic} />
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div>
                  <div className="text-sm text-gray-500">医生</div>
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
                <div>
                  <div className="text-sm text-gray-500">眼别</div>
                  <select
                    value={clinicForm.eye}
                    onChange={(e) => {
                      setClinicForm((prev) => ({ ...prev, eye: e.target.value }));
                      markModuleDraft("clinic");
                    }}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  >
                    <option value="双眼">双眼</option>
                    <option value="右眼">右眼（OD）</option>
                    <option value="左眼">左眼（OS）</option>
                  </select>
                </div>
                <div>
                  <div className="text-sm text-gray-500">症状</div>
                  <input
                    value={clinicForm.symptom}
                    onChange={(e) => {
                      setClinicForm((prev) => ({ ...prev, symptom: e.target.value }));
                      markModuleDraft("clinic");
                    }}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div>
                  <div className="text-sm text-gray-500">病程</div>
                  <div className="mt-2 grid grid-cols-[1fr_120px] gap-3">
                    <input
                      value={clinicForm.duration}
                      onChange={(e) => {
                        setClinicForm((prev) => ({ ...prev, duration: e.target.value }));
                        markModuleDraft("clinic");
                      }}
                      className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                    />
                    <select
                      value={clinicForm.durationUnit}
                      onChange={(e) => {
                        setClinicForm((prev) => ({ ...prev, durationUnit: e.target.value }));
                        markModuleDraft("clinic");
                      }}
                      className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                    >
                      <option value="日">日</option>
                      <option value="周">周</option>
                      <option value="月">月</option>
                      <option value="年">年</option>
                    </select>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">复查周期</div>
                  <input
                    value={clinicForm.followupCycle}
                    onChange={(e) => {
                      setClinicForm((prev) => ({ ...prev, followupCycle: e.target.value }));
                      markModuleDraft("clinic");
                    }}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm text-gray-500">描述</div>
                <textarea
                  value={clinicForm.description}
                  onChange={(e) => {
                    setClinicForm((prev) => ({ ...prev, description: e.target.value }));
                    markModuleDraft("clinic");
                  }}
                  className="mt-2 w-full min-h-[120px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
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
                  <div className="text-sm text-gray-500">处理意见</div>
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
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div>
                  <div className="text-sm text-gray-500">预计复查日期</div>
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
            </section>
          )}

          {selectedModules.training && (
            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <SectionHint title="视光训练" desc="视训项目与训练数据" />
                <ModuleStatusBadge status={moduleStatus.training} />
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div>
                  <div className="text-sm text-gray-500">视训时间</div>
                  <input
                    value={trainingForm.trainingTime}
                    onChange={(e) => {
                      setTrainingForm((prev) => ({ ...prev, trainingTime: e.target.value }));
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
            </section>
          )}

          {selectedModules.fitting && (
            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <SectionHint title="配镜记录" desc="处方与配镜参数" />
                <ModuleStatusBadge status={moduleStatus.fitting} />
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <div>
                  <div className="text-sm text-gray-500">处方类型</div>
                  <input
                    value={fittingForm.prescriptionType}
                    onChange={(e) => {
                      setFittingForm((prev) => ({ ...prev, prescriptionType: e.target.value }));
                      markModuleDraft("fitting");
                    }}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div className="lg:col-span-2">
                  <div className="text-sm text-gray-500">镜片 / 镜架信息</div>
                  <input
                    value={fittingForm.productInfo}
                    onChange={(e) => {
                      setFittingForm((prev) => ({ ...prev, productInfo: e.target.value }));
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
            </section>
          )}

          {selectedModules.billing && (
            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <SectionHint title="收费详情" desc="收费单与支付状态" />
                <ModuleStatusBadge status={moduleStatus.billing} />
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-3">
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
                  <select
                    value={billingForm.paymentStatus}
                    onChange={(e) => {
                      setBillingForm((prev) => ({ ...prev, paymentStatus: e.target.value }));
                      markModuleDraft("billing");
                    }}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  >
                    {archivePaymentStatusOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
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
                当前客户：<span className="font-semibold text-gray-700">{patient.name}</span>
                <span className="mx-2 text-gray-300">|</span>
                最近就诊：<span className="font-semibold text-gray-700">{formatDateOnly(patient.latestVisit)}</span>
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
