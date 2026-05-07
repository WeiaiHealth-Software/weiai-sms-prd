import { useMemo, useState } from "react";
import { DownloadSimple, Plus } from "@phosphor-icons/react";
import { useNavigate } from "react-router";
import { patients, profileTagStandard, type Patient, type PatientProfile } from "./mockData";

function formatDateOnly(value?: string) {
  if (!value) return "-";
  return String(value).split(" ")[0];
}

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

function GenderIcon({ gender }: { gender: Patient["gender"] }) {
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

function ProfileTags({ profile }: { profile?: PatientProfile }) {
  if (!profile) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {profileTagStandard.map((group) => {
        const value = profile[group.key as keyof PatientProfile];
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

export default function ClientList() {
  const navigate = useNavigate();
  const [data, setData] = useState<Patient[]>(patients);
  const [keyword, setKeyword] = useState("");
  const [followStatus, setFollowStatus] = useState("全部跟进状态");
  const [followupType, setFollowupType] = useState("回访项目类型");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [deleteCandidate, setDeleteCandidate] = useState<Patient | null>(null);
  const [applied, setApplied] = useState({
    keyword: "",
    followStatus: "全部跟进状态",
    followupType: "回访项目类型",
    startDate: "",
    endDate: "",
  });

  const filtered = useMemo(() => {
    const query = normalizeForSearch(applied.keyword);
    const start = applied.startDate ? new Date(applied.startDate) : null;
    const end = applied.endDate ? new Date(applied.endDate) : null;

    return data.filter((p) => {
      if (query) {
        const haystack = normalizeForSearch(`${p.name}${p.mobile}${p.no}`);
        if (!haystack.includes(query)) return false;
      }

      if (applied.followStatus !== "全部跟进状态") {
        const status = p.profile?.reviewStatus ?? "";
        if (status !== applied.followStatus) return false;
      }

      if (applied.followupType !== "回访项目类型") {
        if ((p.followupType ?? "") !== applied.followupType) return false;
      }

      if (start || end) {
        const date = formatDateOnly(p.latestVisit);
        if (date === "-") return false;
        const d = new Date(date);
        if (start && d < start) return false;
        if (end) {
          const endInclusive = new Date(end);
          endInclusive.setHours(23, 59, 59, 999);
          if (d > endInclusive) return false;
        }
      }

      return true;
    });
  }, [applied, data]);

  const pageSize = 10;
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = clamp(page, 1, totalPages);
  const pageStartIdx = (currentPage - 1) * pageSize;
  const pageEndIdx = Math.min(pageStartIdx + pageSize, total);
  const paged = filtered.slice(pageStartIdx, pageEndIdx);
  const pageItems = getPageItems(totalPages, currentPage);

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="bg-white rounded-2xl card-shadow border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <div className="flex flex-col gap-4 p-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="text-lg font-bold text-gray-900">客户列表</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100">
                <DownloadSimple weight="bold" className="h-4 w-4" />
                导出
              </button>
              <button className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 active:bg-primary-700">
                <Plus weight="bold" className="h-4 w-4" />
                新增档案
              </button>
            </div>
          </div>

          <div className="border-b border-gray-100"></div>

          <div className="p-5 grid gap-3 xl:grid-cols-[1.42fr_0.66fr_0.82fr_1.42fr_auto] xl:items-center">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-gray-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
              placeholder="搜索姓名 / 手机号 / 患者编号"
            />
            <select
              value={followStatus}
              onChange={(e) => setFollowStatus(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-700 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
            >
              <option>全部跟进状态</option>
              <option>跟进中</option>
              <option>待复查</option>
              <option>已终止</option>
              <option>已就诊</option>
            </select>
            <select
              value={followupType}
              onChange={(e) => setFollowupType(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-700 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
            >
              <option>回访项目类型</option>
              <option>角膜塑形镜</option>
              <option>离焦框架镜</option>
              <option>离焦软镜</option>
              <option>哺光仪</option>
              <option>视训</option>
              <option>用药</option>
              <option>定期复查</option>
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                type="date"
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
              />
              <input
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                type="date"
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setKeyword("");
                  setFollowStatus("全部跟进状态");
                  setFollowupType("回访项目类型");
                  setStartDate("");
                  setEndDate("");
                  setApplied({
                    keyword: "",
                    followStatus: "全部跟进状态",
                    followupType: "回访项目类型",
                    startDate: "",
                    endDate: "",
                  });
                  setPage(1);
                }}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100"
              >
                重置
              </button>
              <button
                onClick={() => {
                  setApplied({ keyword, followStatus, followupType, startDate, endDate });
                  setPage(1);
                }}
                className="rounded-xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-600 active:bg-primary-700"
              >
                搜索
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase tracking-[0.18em] text-gray-400">
              <tr>
                <th className="px-5 py-4 font-semibold">客户信息</th>
                <th className="px-5 py-4 font-semibold">联系方式</th>
                <th className="px-5 py-4 font-semibold">用户标签</th>
                <th className="px-5 py-4 font-semibold">回访项目类型</th>
                <th className="px-5 py-4 font-semibold">就诊日期</th>
                <th className="px-5 py-4 font-semibold">诊断备注</th>
                <th className="px-5 py-4 font-semibold">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {paged.map((p) => (
                <tr key={p.id} className="transition hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <button type="button" className="text-left" onClick={() => navigate(`/crm/client/${p.id}`)}>
                      <div className="flex items-center gap-3">
                        <GenderIcon gender={p.gender} />
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-gray-900 hover:text-primary-600">{p.name}</span>
                            <span className="text-xs text-gray-400">{p.age}岁</span>
                          </div>
                          <div className="mt-1 text-xs text-gray-500">{p.no}</div>
                        </div>
                      </div>
                    </button>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="font-semibold text-gray-800">{p.mobile}</div>
                  </td>
                  <td className="px-5 py-4">
                    <ProfileTags profile={p.profile} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-gray-800">{p.followupType || "-"}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">本次:</span>
                      <span className="font-semibold text-gray-900">{formatDateOnly(p.latestVisit)}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <span className="text-gray-500">复查:</span>
                      <span className="font-semibold text-gray-800">{formatDateOnly(p.nextReview)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="max-w-[240px] truncate text-sm font-semibold text-gray-600">
                      {p.diagnosisNote || "-"}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        className="rounded-lg bg-primary-50 px-3 py-2 text-xs font-semibold text-primary-600 hover:bg-primary-100 active:bg-primary-200"
                        onClick={() => navigate(`/crm/client/${p.id}`)}
                      >
                        查看档案
                      </button>
                      <button
                        className="text-sm font-semibold text-rose-600 hover:text-rose-700 active:text-rose-800"
                        onClick={() => setDeleteCandidate(p)}
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
            共 <span className="font-bold text-gray-900">{total}</span> 条患者记录，当前显示{" "}
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
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <div className="text-lg font-bold text-gray-900">确认删除</div>
              <div className="mt-1 text-sm text-gray-500">
                确认删除 <span className="font-semibold text-gray-900">{deleteCandidate.name}</span>（{deleteCandidate.no}）的档案吗？
              </div>
            </div>
            <div className="p-5 flex items-center justify-end gap-3">
              <button
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                onClick={() => setDeleteCandidate(null)}
              >
                取消
              </button>
              <button
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 active:bg-rose-800"
                onClick={() => {
                  const id = deleteCandidate.id;
                  setData((prev) => prev.filter((x) => x.id !== id));
                  setDeleteCandidate(null);
                  const nextTotal = Math.max(0, total - 1);
                  const nextTotalPages = Math.max(1, Math.ceil(nextTotal / pageSize));
                  setPage((p) => clamp(p, 1, nextTotalPages));
                }}
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

