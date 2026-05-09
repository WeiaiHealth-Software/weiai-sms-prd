import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { followups, patients, type Followup as FollowupItem } from "./mockData";

function normalizeForSearch(value: string) {
  return value.replaceAll(/\s+/g, "").toLowerCase();
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getPageItems(totalPages: number, currentPage: number) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, idx) => idx + 1);
  const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const clipped = Array.from(pages).filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const out: Array<number | "ellipsis"> = [];
  for (let i = 0; i < clipped.length; i++) {
    const prev = clipped[i - 1];
    const cur = clipped[i];
    if (i > 0 && prev != null && cur - prev > 1) out.push("ellipsis");
    out.push(cur);
  }
  return out;
}

function statusClass(status: FollowupItem["status"]) {
  if (status === "已联系") return "border-emerald-100 bg-emerald-50 text-emerald-700";
  if (status === "待到店") return "border-sky-100 bg-sky-50 text-sky-700";
  if (status === "已逾期") return "border-orange-100 bg-orange-50 text-orange-700";
  if (status === "待跟进") return "border-rose-100 bg-rose-50 text-rose-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

type QuickKey = "today" | "overdue" | "contacted" | "toStore";

export default function Followup() {
  const navigate = useNavigate();
  const [quick, setQuick] = useState<QuickKey>("today");
  const [keyword, setKeyword] = useState("");
  const [date, setDate] = useState("");
  const [store, setStore] = useState("全部门店");
  const [owner, setOwner] = useState("全部责任人");
  const [status, setStatus] = useState("全部任务状态");
  const [page, setPage] = useState(1);
  const [applied, setApplied] = useState({
    keyword: "",
    date: "",
    store: "全部门店",
    owner: "全部责任人",
    status: "全部任务状态",
  });

  const patientByName = useMemo(() => new Map(patients.map((p) => [p.name, p])), []);

  const storeOptions = useMemo(() => {
    const values = Array.from(
      new Set(
        followups
          .map((f) => patientByName.get(f.patient)?.store)
          .filter((x): x is string => Boolean(x))
      )
    ).sort();
    return ["全部门店", ...values];
  }, [patientByName]);

  const ownerOptions = useMemo(() => {
    const values = Array.from(new Set(followups.map((f) => f.owner).filter(Boolean))).sort();
    return ["全部责任人", ...values];
  }, []);

  const statusOptions = useMemo(() => {
    const values = Array.from(new Set(followups.map((f) => f.status).filter(Boolean))).sort();
    return ["全部任务状态", ...values];
  }, []);

  const quickStatusAllow = useMemo(() => {
    if (quick === "today") return new Set(["待跟进"]);
    if (quick === "overdue") return new Set(["已逾期"]);
    if (quick === "contacted") return new Set(["已联系"]);
    return new Set(["待到店"]);
  }, [quick]);

  const filtered = useMemo(() => {
    const query = normalizeForSearch(applied.keyword);
    return followups.filter((f) => {
      if (!quickStatusAllow.has(f.status)) return false;

      if (query) {
        const patient = patientByName.get(f.patient);
        const haystack = normalizeForSearch(`${f.patient}${patient?.mobile ?? ""}${patient?.no ?? ""}`);
        if (!haystack.includes(query)) return false;
      }

      if (applied.date && f.reviewDate !== applied.date) return false;

      if (applied.store !== "全部门店") {
        const patientStore = patientByName.get(f.patient)?.store ?? "";
        if (patientStore !== applied.store) return false;
      }

      if (applied.owner !== "全部责任人" && f.owner !== applied.owner) return false;
      if (applied.status !== "全部任务状态" && f.status !== applied.status) return false;

      return true;
    });
  }, [applied, patientByName, quickStatusAllow]);

  const total = filtered.length;
  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = clamp(page, 1, totalPages);
  const pageStartIdx = (currentPage - 1) * pageSize;
  const pageEndIdx = Math.min(pageStartIdx + pageSize, total);
  const paged = filtered.slice(pageStartIdx, pageEndIdx);
  const pageItems = getPageItems(totalPages, currentPage);

  const stats = useMemo(() => {
    const pending = followups.filter((f) => f.status === "待跟进").length;
    const overdue = followups.filter((f) => f.status === "已逾期").length;
    const toStore = followups.filter((f) => f.status === "待到店").length;
    return { pending, overdue, toStore };
  }, []);

  return (
    <div className="min-h-full flex flex-col gap-6">
      <div className="bg-white rounded-2xl card-shadow border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="text-lg font-bold text-gray-900">复查回访任务视图</div>
              <div className="mt-1 text-sm text-gray-500">
                统一展示患者、最近就诊、诊断、主要治疗手段、应复查日期、跟进结果、责任人和任务状态。
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className={
                  quick === "today"
                    ? "rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white"
                    : "rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 active:bg-gray-300"
                }
                onClick={() => {
                  setQuick("today");
                  setPage(1);
                }}
              >
                今日待回访
              </button>
              <button
                className={
                  quick === "overdue"
                    ? "rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white"
                    : "rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 active:bg-gray-300"
                }
                onClick={() => {
                  setQuick("overdue");
                  setPage(1);
                }}
              >
                已逾期
              </button>
              <button
                className={
                  quick === "contacted"
                    ? "rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white"
                    : "rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 active:bg-gray-300"
                }
                onClick={() => {
                  setQuick("contacted");
                  setPage(1);
                }}
              >
                已联系
              </button>
              <button
                className={
                  quick === "toStore"
                    ? "rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white"
                    : "rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 active:bg-gray-300"
                }
                onClick={() => {
                  setQuick("toStore");
                  setPage(1);
                }}
              >
                待复查到店
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-gray-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
              placeholder="搜索姓名 / 手机号"
            />
            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              type="date"
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
            />
            <select
              value={store}
              onChange={(e) => setStore(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
            >
              {storeOptions.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
            <select
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
            >
              {ownerOptions.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
            >
              {statusOptions.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
            <button
              className="rounded-xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-600 active:bg-primary-700"
              onClick={() => {
                setApplied({ keyword, date, store, owner, status });
                setPage(1);
              }}
            >
              筛选任务
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">今日优先 {stats.pending} 条</span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">逾期 {stats.overdue} 条</span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">待到店 {stats.toStore} 条</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase tracking-[0.18em] text-gray-400">
              <tr>
                <th className="px-5 py-4 font-semibold">患者</th>
                <th className="px-5 py-4 font-semibold">最近就诊</th>
                <th className="px-5 py-4 font-semibold">诊断 / 治疗</th>
                <th className="px-5 py-4 font-semibold">应复查日期</th>
                <th className="px-5 py-4 font-semibold">联系结果</th>
                <th className="px-5 py-4 font-semibold">责任人</th>
                <th className="px-5 py-4 font-semibold">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {paged.map((item) => {
                const patient = patientByName.get(item.patient);
                const patientId = patient?.id ?? "";
                const canNavigate = Boolean(patientId);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-900">{item.patient}</div>
                      <div className="mt-1 text-xs text-gray-500">联系方式已绑定小程序</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-700">{item.latestVisit}</div>
                      <div className="mt-1 text-xs text-gray-500">最近就诊时间</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-700">{item.diagnosis}</div>
                      <div className="mt-1 text-xs text-gray-500">{item.treatment}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-900">{item.reviewDate}</div>
                      <span className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-700">{item.result}</div>
                      <div className="mt-1 text-xs text-gray-500">{item.status === "已逾期" ? "需升级联系策略" : "保留本次沟通摘要"}</div>
                    </td>
                    <td className="px-5 py-4 text-gray-700">{item.owner}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100 active:bg-rose-200 disabled:opacity-50"
                          disabled={!canNavigate}
                          onClick={() => {
                            if (!patientId) return;
                            navigate(`/crm/client/${patientId}/followup/new`);
                          }}
                        >
                          发起回访
                        </button>
                        <button className="rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 active:bg-gray-300">
                          记录结果
                        </button>
                        <button
                          className="rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50"
                          disabled={!canNavigate}
                          onClick={() => {
                            if (!patientId) return;
                            navigate(`/crm/client/${patientId}`);
                          }}
                        >
                          查看患者
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-500">
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-gray-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-sm text-gray-500">
            共 <span className="font-bold text-gray-900">{total}</span> 条回访任务，当前显示{" "}
            <span className="font-bold text-gray-900">{total ? pageStartIdx + 1 : 0}</span> -{" "}
            <span className="font-bold text-gray-900">{pageEndIdx}</span> 条
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setPage((p) => clamp(p - 1, 1, totalPages))}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50"
              disabled={currentPage === 1}
            >
              上一页
            </button>
            {pageItems.map((item, idx) =>
              item === "ellipsis" ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-sm text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => setPage(item)}
                  className={
                    item === currentPage
                      ? "rounded-lg bg-primary-500 px-3 py-2 text-sm font-semibold text-white"
                      : "rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                  }
                >
                  {item}
                </button>
              )
            )}
            <button
              onClick={() => setPage((p) => clamp(p + 1, 1, totalPages))}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50"
              disabled={currentPage === totalPages}
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

