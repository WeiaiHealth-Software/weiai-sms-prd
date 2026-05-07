import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Plus, Phone, UserCircle } from "@phosphor-icons/react";
import { appointments, followups, historyVisits, patients, profileTagStandard, visitDetailRecords, type VisitDetailRecord } from "./mockData";

function formatDateOnly(value?: string) {
  if (!value) return "-";
  return String(value).split(" ")[0];
}

function GenderIcon({ gender }: { gender: "男" | "女" }) {
  const isMale = gender === "男";
  const toneClass = isMale
    ? "bg-sky-50 text-sky-600 border-sky-100"
    : "bg-pink-50 text-pink-500 border-pink-100";
  return (
    <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full border ${toneClass}`}>
      <svg
        className="h-4 w-4"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {isMale ? (
          <>
            <circle cx="8" cy="12" r="4.2"></circle>
            <path d="M11.2 8.8L16 4"></path>
            <path d="M12.8 4H16v3.2"></path>
          </>
        ) : (
          <>
            <circle cx="10" cy="8" r="4"></circle>
            <path d="M10 12v4.5"></path>
            <path d="M7.5 14.6h5"></path>
          </>
        )}
      </svg>
    </span>
  );
}

function ProfileTags({ profile }: { profile?: Record<string, string> }) {
  if (!profile) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {profileTagStandard.map((group) => {
        const value = profile[group.key];
        if (!value) return null;
        const option = group.options.find((o) => o.value === value);
        const className = option?.className ?? "border-slate-200 bg-white text-slate-500";
        return (
          <span key={`${group.key}-${value}`} className={`rounded-full border px-2.5 py-1 text-[11px] ${className}`}>
            {value}
          </span>
        );
      })}
    </div>
  );
}

const tabs = [
  { key: "visits", label: "就诊记录" },
  { key: "appointments", label: "预约记录" },
  { key: "followup", label: "回访记录" },
  { key: "consumption", label: "消费记录" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export default function ClientDetail() {
  const navigate = useNavigate();
  const params = useParams();
  const id = String(params.id ?? "");
  const patient = useMemo(() => patients.find((p) => p.id === id) ?? patients[0], [id]);

  const [activeTab, setActiveTab] = useState<TabKey>("visits");
  const [selectedVisitId, setSelectedVisitId] = useState(historyVisits[0]?.id ?? "v1");
  const [visitEditMode, setVisitEditMode] = useState(false);
  const [visitOverrides, setVisitOverrides] = useState<Record<string, VisitDetailRecord>>({});
  const baseVisitDetail = useMemo(
    () => visitDetailRecords[selectedVisitId] ?? visitDetailRecords.v1,
    [selectedVisitId]
  );
  const effectiveVisitDetail = useMemo(
    () => visitOverrides[selectedVisitId] ?? baseVisitDetail,
    [baseVisitDetail, selectedVisitId, visitOverrides]
  );
  const [visitDraft, setVisitDraft] = useState<VisitDetailRecord>(effectiveVisitDetail);
  const [savedAt, setSavedAt] = useState(0);

  useEffect(() => {
    setVisitEditMode(false);
    setVisitDraft(effectiveVisitDetail);
  }, [effectiveVisitDetail, selectedVisitId]);

  const patientAppointments = useMemo(
    () => appointments.filter((a) => a.patient === patient.name),
    [patient.name]
  );
  const patientFollowups = useMemo(
    () => followups.filter((f) => f.patient === patient.name),
    [patient.name]
  );
  const selectedVisit = useMemo(
    () => historyVisits.find((v) => v.id === selectedVisitId) ?? historyVisits[0],
    [selectedVisitId]
  );

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="bg-white rounded-2xl card-shadow border border-gray-100 p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100"
              onClick={() => navigate("/crm/client-list")}
            >
              <ArrowLeft weight="bold" className="h-4 w-4" />
              返回列表
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 active:bg-primary-700"
              onClick={() => navigate(`/crm/client/${patient.id}/visit/new`)}
            >
              <Plus weight="bold" className="h-4 w-4" />
              新增就诊记录
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100"
              onClick={() => navigate(`/crm/client/${patient.id}/followup/new`)}
            >
              发起回访
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white border border-gray-100 text-primary-600">
                <UserCircle weight="duotone" className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-gray-900">{patient.name}</span>
                  <span className="text-xs text-gray-400">{patient.age}岁</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span className="inline-flex items-center gap-2">
                    <GenderIcon gender={patient.gender} />
                    <span className="font-semibold text-gray-700">{patient.no}</span>
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Phone weight="bold" className="h-4 w-4 text-gray-400" />
                    <span className="font-semibold text-gray-700">{patient.mobile}</span>
                  </span>
                  <span className="text-gray-400">
                    最近就诊：<span className="font-semibold text-gray-700">{formatDateOnly(patient.latestVisit)}</span>
                  </span>
                  <span className="text-gray-400">
                    复查：<span className="font-semibold text-gray-700">{formatDateOnly(patient.nextReview)}</span>
                  </span>
                </div>
              </div>
            </div>
            <ProfileTags profile={patient.profile as any} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl card-shadow border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50 px-5 pt-4">
          <div className="flex flex-wrap items-end gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={
                  activeTab === t.key
                    ? "rounded-t-xl border border-gray-200 border-b-white bg-white px-5 py-2 text-sm font-semibold text-primary-600 -mb-px"
                    : "rounded-t-xl border border-gray-200 bg-gray-50 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-white -mb-px"
                }
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5">
          {activeTab === "visits" && (
            <div className="grid gap-5 xl:grid-cols-[320px_1fr_240px]">
              <aside className="rounded-2xl border border-gray-100 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-base font-bold text-gray-900">就诊时间轴</div>
                    <div className="mt-1 text-sm text-gray-500">默认定位到最新一次就诊记录</div>
                  </div>
                  <span className="rounded-xl bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                    共 {historyVisits.length} 次
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  {historyVisits.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVisitId(v.id)}
                      className={
                        v.id === selectedVisitId
                          ? "w-full rounded-xl border border-primary-100 bg-primary-50 p-3 text-left"
                          : "w-full rounded-xl border border-gray-100 bg-white p-3 text-left hover:bg-gray-50"
                      }
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-bold text-gray-900">{v.date}</div>
                        <span className="text-xs font-semibold text-gray-500">{v.title}</span>
                      </div>
                      <div className="mt-2 text-sm font-semibold text-gray-700 line-clamp-1">{v.diagnosis}</div>
                      <div className="mt-1 text-xs text-gray-500 line-clamp-1">{v.summary}</div>
                    </button>
                  ))}
                </div>
              </aside>

              <section className="rounded-2xl border border-gray-100 bg-white p-5">
                <div id="visit-overview" className="scroll-mt-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-lg font-bold text-gray-900">本次就诊详情</div>
                    <div className="mt-1 text-sm text-gray-500">
                      复查：{selectedVisit?.title} · 复查建议 {selectedVisit?.review}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <span className="rounded-xl bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700">
                      眼轴：{selectedVisit?.axial}
                    </span>
                    <span className="rounded-xl bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700">
                      视力：{selectedVisit?.va}
                    </span>
                    <span className="rounded-xl bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700">
                      复查：{selectedVisit?.review}
                    </span>
                    <span
                      className={
                        visitEditMode
                          ? "rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700"
                          : "rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                      }
                    >
                      {visitEditMode ? "编辑中" : "查看"}
                    </span>
                    {!visitEditMode ? (
                      <button
                        className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                        onClick={() => setVisitEditMode(true)}
                      >
                        编辑内容
                      </button>
                    ) : (
                      <>
                        <button
                          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                          onClick={() => {
                            setVisitEditMode(false);
                            setVisitDraft(effectiveVisitDetail);
                          }}
                        >
                          取消
                        </button>
                        <button
                          className="rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 active:bg-primary-700"
                          onClick={() => {
                            setVisitOverrides((prev) => ({ ...prev, [selectedVisitId]: visitDraft }));
                            setVisitEditMode(false);
                            setSavedAt(Date.now());
                          }}
                        >
                          保存
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {savedAt !== 0 && (
                  <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                    已保存（本地 mock）
                  </div>
                )}
                </div>

                <div id="visit-basic" className="scroll-mt-6 mt-5 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-gray-100 bg-white p-5">
                    <div className="text-sm font-bold text-gray-900">基本信息</div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-gray-50 p-4">
                        <div className="text-sm text-gray-500">接诊医生</div>
                        {visitEditMode ? (
                          <input
                            value={visitDraft.basicInfo.doctor}
                            onChange={(e) =>
                              setVisitDraft((prev) => ({
                                ...prev,
                                basicInfo: { ...prev.basicInfo, doctor: e.target.value },
                              }))
                            }
                            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                          />
                        ) : (
                          <div className="mt-2 font-semibold text-gray-900">{effectiveVisitDetail.basicInfo.doctor || "/"}</div>
                        )}
                      </div>
                      <div className="rounded-2xl bg-gray-50 p-4">
                        <div className="text-sm text-gray-500">验光师</div>
                        {visitEditMode ? (
                          <input
                            value={visitDraft.basicInfo.optometrist}
                            onChange={(e) =>
                              setVisitDraft((prev) => ({
                                ...prev,
                                basicInfo: { ...prev.basicInfo, optometrist: e.target.value },
                              }))
                            }
                            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                          />
                        ) : (
                          <div className="mt-2 font-semibold text-gray-900">{effectiveVisitDetail.basicInfo.optometrist || "/"}</div>
                        )}
                      </div>
                      <div className="rounded-2xl bg-gray-50 p-4">
                        <div className="text-sm text-gray-500">散瞳</div>
                        {visitEditMode ? (
                          <input
                            value={visitDraft.basicInfo.cycloplegia}
                            onChange={(e) =>
                              setVisitDraft((prev) => ({
                                ...prev,
                                basicInfo: { ...prev.basicInfo, cycloplegia: e.target.value },
                              }))
                            }
                            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                          />
                        ) : (
                          <div className="mt-2 font-semibold text-gray-900">{effectiveVisitDetail.basicInfo.cycloplegia || "/"}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-white p-5">
                    <div className="text-sm font-bold text-gray-900">诊断</div>
                    {visitEditMode ? (
                      <textarea
                        value={visitDraft.diagnosis}
                        onChange={(e) => setVisitDraft((prev) => ({ ...prev, diagnosis: e.target.value }))}
                        className="mt-4 w-full min-h-[120px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                      />
                    ) : (
                      <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-sm font-semibold text-gray-700 leading-7">
                        {effectiveVisitDetail.diagnosis || "-"}
                      </div>
                    )}
                  </div>
                </div>

                <div id="visit-chief" className="scroll-mt-6 mt-5 rounded-2xl border border-gray-100 bg-white p-5">
                  <div className="text-sm font-bold text-gray-900">主诉与病史</div>
                  <div className="mt-4 grid gap-3 lg:grid-cols-4">
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <div className="text-sm text-gray-500">眼别</div>
                      {visitEditMode ? (
                        <select
                          value={visitDraft.chiefHistory.eye}
                          onChange={(e) =>
                            setVisitDraft((prev) => ({
                              ...prev,
                              chiefHistory: { ...prev.chiefHistory, eye: e.target.value },
                            }))
                          }
                          className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                        >
                          <option value="双眼">双眼</option>
                          <option value="右眼">右眼</option>
                          <option value="左眼">左眼</option>
                        </select>
                      ) : (
                        <div className="mt-2 font-semibold text-gray-900">{effectiveVisitDetail.chiefHistory.eye}</div>
                      )}
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <div className="text-sm text-gray-500">症状</div>
                      {visitEditMode ? (
                        <input
                          value={visitDraft.chiefHistory.symptom}
                          onChange={(e) =>
                            setVisitDraft((prev) => ({
                              ...prev,
                              chiefHistory: { ...prev.chiefHistory, symptom: e.target.value },
                            }))
                          }
                          className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                        />
                      ) : (
                        <div className="mt-2 font-semibold text-gray-900">{effectiveVisitDetail.chiefHistory.symptom}</div>
                      )}
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <div className="text-sm text-gray-500">持续时长</div>
                      {visitEditMode ? (
                        <input
                          value={visitDraft.chiefHistory.duration}
                          onChange={(e) =>
                            setVisitDraft((prev) => ({
                              ...prev,
                              chiefHistory: { ...prev.chiefHistory, duration: e.target.value },
                            }))
                          }
                          className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                        />
                      ) : (
                        <div className="mt-2 font-semibold text-gray-900">
                          {effectiveVisitDetail.chiefHistory.duration || "-"}
                        </div>
                      )}
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <div className="text-sm text-gray-500">单位</div>
                      {visitEditMode ? (
                        <select
                          value={visitDraft.chiefHistory.durationUnit}
                          onChange={(e) =>
                            setVisitDraft((prev) => ({
                              ...prev,
                              chiefHistory: { ...prev.chiefHistory, durationUnit: e.target.value },
                            }))
                          }
                          className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                        >
                          <option value="日">日</option>
                          <option value="周">周</option>
                          <option value="月">月</option>
                          <option value="年">年</option>
                        </select>
                      ) : (
                        <div className="mt-2 font-semibold text-gray-900">{effectiveVisitDetail.chiefHistory.durationUnit || "-"}</div>
                      )}
                    </div>
                  </div>
                  {visitEditMode ? (
                    <textarea
                      value={visitDraft.chiefHistory.description}
                      onChange={(e) =>
                        setVisitDraft((prev) => ({
                          ...prev,
                          chiefHistory: { ...prev.chiefHistory, description: e.target.value },
                        }))
                      }
                      className="mt-4 w-full min-h-[140px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                    />
                  ) : (
                    <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-sm leading-7 text-gray-700">
                      {effectiveVisitDetail.chiefHistory.description}
                    </div>
                  )}
                </div>

                <div id="visit-exams" className="scroll-mt-6 mt-5 space-y-4">
                  <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
                    <div className="border-b border-gray-100 bg-gray-50 px-5 py-4 text-sm font-bold text-gray-900">眼部检查</div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm">
                        <thead className="text-xs uppercase tracking-[0.18em] text-gray-400">
                          <tr>
                            <th className="px-5 py-4 font-semibold">检查项目</th>
                            <th className="px-5 py-4 font-semibold">右眼</th>
                            <th className="px-5 py-4 font-semibold">左眼</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {(visitEditMode ? visitDraft.eyeExam : effectiveVisitDetail.eyeExam).map((row, idx) => (
                            <tr key={`${row.label}-${idx}`} className="hover:bg-gray-50">
                              <td className="px-5 py-4 font-semibold text-gray-700 whitespace-nowrap">{row.label}</td>
                              <td className="px-5 py-4">
                                {visitEditMode ? (
                                  <input
                                    value={visitDraft.eyeExam[idx]?.right ?? ""}
                                    onChange={(e) =>
                                      setVisitDraft((prev) => ({
                                        ...prev,
                                        eyeExam: prev.eyeExam.map((r, i) => (i === idx ? { ...r, right: e.target.value } : r)),
                                      }))
                                    }
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                                  />
                                ) : (
                                  <div className="w-full rounded-xl bg-gray-50 px-4 py-2 font-semibold text-gray-900">
                                    {row.right || "-"}
                                  </div>
                                )}
                              </td>
                              <td className="px-5 py-4">
                                {visitEditMode ? (
                                  <input
                                    value={visitDraft.eyeExam[idx]?.left ?? ""}
                                    onChange={(e) =>
                                      setVisitDraft((prev) => ({
                                        ...prev,
                                        eyeExam: prev.eyeExam.map((r, i) => (i === idx ? { ...r, left: e.target.value } : r)),
                                      }))
                                    }
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                                  />
                                ) : (
                                  <div className="w-full rounded-xl bg-gray-50 px-4 py-2 font-semibold text-gray-900">
                                    {row.left || "-"}
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
                    <div className="border-b border-gray-100 bg-gray-50 px-5 py-4 text-sm font-bold text-gray-900">辅助检查</div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm">
                        <thead className="text-xs uppercase tracking-[0.18em] text-gray-400">
                          <tr>
                            <th className="px-5 py-4 font-semibold">检查项目</th>
                            <th className="px-5 py-4 font-semibold">右眼</th>
                            <th className="px-5 py-4 font-semibold">左眼</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {(visitEditMode ? visitDraft.auxExam : effectiveVisitDetail.auxExam).map((row, idx) => (
                            <tr key={`${row.label}-${idx}`} className="hover:bg-gray-50">
                              <td className="px-5 py-4 font-semibold text-gray-700 whitespace-nowrap">{row.label}</td>
                              <td className="px-5 py-4">
                                {visitEditMode ? (
                                  <input
                                    value={visitDraft.auxExam[idx]?.right ?? ""}
                                    onChange={(e) =>
                                      setVisitDraft((prev) => ({
                                        ...prev,
                                        auxExam: prev.auxExam.map((r, i) => (i === idx ? { ...r, right: e.target.value } : r)),
                                      }))
                                    }
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                                  />
                                ) : (
                                  <div className="w-full rounded-xl bg-gray-50 px-4 py-2 font-semibold text-gray-900">
                                    {row.right || "-"}
                                  </div>
                                )}
                              </td>
                              <td className="px-5 py-4">
                                {visitEditMode ? (
                                  <input
                                    value={visitDraft.auxExam[idx]?.left ?? ""}
                                    onChange={(e) =>
                                      setVisitDraft((prev) => ({
                                        ...prev,
                                        auxExam: prev.auxExam.map((r, i) => (i === idx ? { ...r, left: e.target.value } : r)),
                                      }))
                                    }
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                                  />
                                ) : (
                                  <div className="w-full rounded-xl bg-gray-50 px-4 py-2 font-semibold text-gray-900">
                                    {row.left || "-"}
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div id="visit-treatment" className="scroll-mt-6 mt-5 space-y-4">
                  <div className="rounded-2xl border border-gray-100 bg-white p-5">
                    <div className="text-sm font-bold text-gray-900">处理</div>
                    <div className="mt-4 space-y-4">
                      <div className="rounded-2xl bg-gray-50 p-5">
                        <div className="text-sm font-bold text-gray-900">检查</div>
                        <div className="mt-4 grid grid-cols-4 gap-3 text-xs font-semibold text-gray-400">
                          <div>项目</div>
                          <div>数量</div>
                          <div>单位</div>
                          <div>单价</div>
                        </div>
                        <div className="mt-2 grid grid-cols-4 gap-3 text-sm font-semibold text-gray-900">
                          <div>{effectiveVisitDetail.treatment.inspection.item || "无数据"}</div>
                          <div>{effectiveVisitDetail.treatment.inspection.quantity || "0"}</div>
                          <div>{effectiveVisitDetail.treatment.inspection.unit || "无数据"}</div>
                          <div>{effectiveVisitDetail.treatment.inspection.price || "0 元"}</div>
                        </div>
                        <div className="mt-4 text-sm text-gray-500">
                          总价：<span className="font-semibold text-gray-900">{effectiveVisitDetail.treatment.inspection.total || "0 元"}</span>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-gray-50 p-5">
                        <div className="text-sm font-bold text-gray-900">处方</div>
                        <div className="mt-4 grid gap-4 sm:grid-cols-4">
                          {[
                            { key: "drug", label: "药品名" },
                            { key: "quantity", label: "数量" },
                            { key: "spec", label: "规格" },
                            { key: "unit", label: "单位" },
                          ].map((f) => (
                            <div key={f.key}>
                              <div className="text-xs font-semibold text-gray-400">{f.label}</div>
                              <div className="mt-2 text-sm font-semibold text-gray-900">
                                {(effectiveVisitDetail.treatment.prescription as any)[f.key] || (f.key === "quantity" ? "0" : "无数据")}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 grid gap-4 sm:grid-cols-3">
                          {[
                            { key: "price", label: "单价" },
                            { key: "eye", label: "眼别" },
                            { key: "usage", label: "用法" },
                          ].map((f) => (
                            <div key={f.key}>
                              <div className="text-xs font-semibold text-gray-400">{f.label}</div>
                              <div className="mt-2 text-sm font-semibold text-gray-900">
                                {(effectiveVisitDetail.treatment.prescription as any)[f.key] || "无数据"}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 text-sm text-gray-500">
                          总价：<span className="font-semibold text-gray-900">{effectiveVisitDetail.treatment.prescription.total || "0 元"}</span>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-gray-50 p-5">
                        <div className="text-sm font-bold text-gray-900">治疗</div>
                        <div className="mt-4 grid grid-cols-4 gap-3 text-xs font-semibold text-gray-400">
                          <div>项目名</div>
                          <div>数量</div>
                          <div>单位</div>
                          <div>单价</div>
                        </div>
                        <div className="mt-2 grid grid-cols-4 gap-3 text-sm font-semibold text-gray-900">
                          <div>{effectiveVisitDetail.treatment.therapy.item || "无数据"}</div>
                          <div>{effectiveVisitDetail.treatment.therapy.quantity || "0"}</div>
                          <div>{effectiveVisitDetail.treatment.therapy.unit || "无数据"}</div>
                          <div>{effectiveVisitDetail.treatment.therapy.price || "0 元"}</div>
                        </div>
                        <div className="mt-4 text-sm text-gray-500">
                          总价：<span className="font-semibold text-gray-900">{effectiveVisitDetail.treatment.therapy.total || "0 元"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                      <div className="text-sm font-bold text-emerald-900">医生建议</div>
                      {visitEditMode ? (
                        <textarea
                          value={visitDraft.treatment.advice}
                          onChange={(e) =>
                            setVisitDraft((prev) => ({
                              ...prev,
                              treatment: { ...prev.treatment, advice: e.target.value },
                            }))
                          }
                          className="mt-4 w-full min-h-[140px] rounded-2xl border border-emerald-100 bg-white/70 px-4 py-3 text-sm text-gray-800 outline-none focus:border-emerald-200 focus:ring-2 focus:ring-emerald-100"
                        />
                      ) : (
                        <div className="mt-4 text-sm leading-7 text-emerald-900 whitespace-pre-wrap">
                          {effectiveVisitDetail.treatment.advice || "-"}
                        </div>
                      )}
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-5">
                      <div className="text-sm font-bold text-gray-900">门诊随访</div>
                      <div className="mt-4 space-y-5">
                        <div>
                          <div className="text-sm text-gray-500">复诊周期</div>
                          {visitEditMode ? (
                            <input
                              value={visitDraft.treatment.followupCycle}
                              onChange={(e) =>
                                setVisitDraft((prev) => ({
                                  ...prev,
                                  treatment: { ...prev.treatment, followupCycle: e.target.value },
                                }))
                              }
                              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                            />
                          ) : (
                            <div className="mt-2 font-semibold text-gray-900">{effectiveVisitDetail.treatment.followupCycle || "-"}</div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">预计复诊日期</div>
                          {visitEditMode ? (
                            <input
                              value={visitDraft.treatment.estimatedDate}
                              onChange={(e) =>
                                setVisitDraft((prev) => ({
                                  ...prev,
                                  treatment: { ...prev.treatment, estimatedDate: e.target.value },
                                }))
                              }
                              type="date"
                              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                            />
                          ) : (
                            <div className="mt-2 font-semibold text-gray-900">{effectiveVisitDetail.treatment.estimatedDate || "-"}</div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">复诊提醒发出日期</div>
                          {visitEditMode ? (
                            <input
                              value={visitDraft.treatment.reminderDate}
                              onChange={(e) =>
                                setVisitDraft((prev) => ({
                                  ...prev,
                                  treatment: { ...prev.treatment, reminderDate: e.target.value },
                                }))
                              }
                              type="date"
                              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                            />
                          ) : (
                            <div className="mt-2 font-semibold text-gray-900">{effectiveVisitDetail.treatment.reminderDate || "-"}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <aside className="hidden xl:block">
                <div className="sticky top-4">
                  <div className="rounded-2xl border border-gray-100 bg-white p-4">
                    <div className="text-sm font-bold text-gray-900">目录</div>
                    <div className="mt-3 space-y-2 text-sm">
                      {[
                        { id: "visit-overview", label: "本次就诊详情" },
                        { id: "visit-basic", label: "基本信息 / 诊断" },
                        { id: "visit-chief", label: "主诉与病史" },
                        { id: "visit-exams", label: "检查" },
                        { id: "visit-treatment", label: "处理" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          className="block w-full rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-left font-semibold text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                          onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          )}

          {activeTab === "appointments" && (
            <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
              <div className="border-b border-gray-100 p-4">
                <div className="text-base font-bold text-gray-900">预约记录</div>
                <div className="mt-1 text-sm text-gray-500">按原型示例数据展示该客户相关预约。</div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-50 text-xs uppercase tracking-[0.18em] text-gray-400">
                    <tr>
                      <th className="px-4 py-3 font-semibold">日期</th>
                      <th className="px-4 py-3 font-semibold">时间</th>
                      <th className="px-4 py-3 font-semibold">门店</th>
                      <th className="px-4 py-3 font-semibold">诊室</th>
                      <th className="px-4 py-3 font-semibold">来源</th>
                      <th className="px-4 py-3 font-semibold">状态</th>
                      <th className="px-4 py-3 font-semibold">备注</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {patientAppointments.map((a) => (
                      <tr key={a.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-gray-900">{a.date}</td>
                        <td className="px-4 py-3 font-semibold text-gray-700">{a.time}</td>
                        <td className="px-4 py-3 text-gray-700">{a.store}</td>
                        <td className="px-4 py-3 text-gray-700">{a.room}</td>
                        <td className="px-4 py-3 text-gray-700">{a.source}</td>
                        <td className="px-4 py-3 text-gray-700">{a.status}</td>
                        <td className="px-4 py-3 text-gray-500">{a.note}</td>
                      </tr>
                    ))}
                    {patientAppointments.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500">
                          暂无数据
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "followup" && (
            <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
              <div className="border-b border-gray-100 p-4 flex items-center justify-between">
                <div>
                  <div className="text-base font-bold text-gray-900">回访记录</div>
                  <div className="mt-1 text-sm text-gray-500">按原型示例数据展示该客户相关回访。</div>
                </div>
                <button
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 active:bg-primary-700"
                  onClick={() => navigate(`/crm/client/${patient.id}/followup/new`)}
                >
                  发起回访
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-50 text-xs uppercase tracking-[0.18em] text-gray-400">
                    <tr>
                      <th className="px-4 py-3 font-semibold">最近就诊</th>
                      <th className="px-4 py-3 font-semibold">诊断</th>
                      <th className="px-4 py-3 font-semibold">项目</th>
                      <th className="px-4 py-3 font-semibold">复查日期</th>
                      <th className="px-4 py-3 font-semibold">状态</th>
                      <th className="px-4 py-3 font-semibold">结果</th>
                      <th className="px-4 py-3 font-semibold">负责人</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {patientFollowups.map((f) => (
                      <tr key={f.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-gray-900">{f.latestVisit}</td>
                        <td className="px-4 py-3 text-gray-700">{f.diagnosis}</td>
                        <td className="px-4 py-3 text-gray-700">{f.treatment}</td>
                        <td className="px-4 py-3 text-gray-700">{f.reviewDate}</td>
                        <td className="px-4 py-3 text-gray-700">{f.status}</td>
                        <td className="px-4 py-3 text-gray-500">{f.result}</td>
                        <td className="px-4 py-3 text-gray-700">{f.owner}</td>
                      </tr>
                    ))}
                    {patientFollowups.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500">
                          暂无数据
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "consumption" && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6">
              <div className="text-base font-bold text-gray-900">消费记录</div>
              <div className="mt-2 text-sm text-gray-500">该模块后续按原型与接口清单补齐，这里先占位。</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

