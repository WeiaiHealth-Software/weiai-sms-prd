import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, PaperPlaneTilt } from "@phosphor-icons/react";
import { followups, patients } from "./mockData";

function formatDateOnly(value?: string) {
  if (!value) return "-";
  return String(value).split(" ")[0];
}

export default function ClientFollowupNew() {
  const navigate = useNavigate();
  const params = useParams();
  const id = String(params.id ?? "");
  const patient = useMemo(() => patients.find((p) => p.id === id) ?? patients[0], [id]);
  const seed = useMemo(() => followups.find((f) => f.patient === patient.name) ?? followups[0], [patient.name]);

  const [followupType, setFollowupType] = useState(patient.followupType ?? seed?.treatment ?? "定期复查");
  const [reviewDate, setReviewDate] = useState(patient.nextReview ?? seed?.reviewDate ?? "");
  const [owner, setOwner] = useState(patient.owner ?? seed?.owner ?? "");
  const [note, setNote] = useState(patient.diagnosisNote ?? "");
  const [submitted, setSubmitted] = useState(false);

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
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 active:bg-primary-700"
              onClick={() => setSubmitted(true)}
            >
              <PaperPlaneTilt weight="bold" className="h-4 w-4" />
              提交回访
            </button>
          </div>
          {submitted && (
            <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              已创建回访任务（示例数据，本期仅打通页面与交互路径）
            </div>
          )}
        </div>

        <div className="p-5 space-y-5">
          <section className="rounded-2xl border border-gray-100 bg-white p-5">
            <div className="text-base font-bold text-gray-900">客户信息</div>
            <div className="mt-4 grid gap-4 lg:grid-cols-4">
              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="text-sm text-gray-500">姓名</div>
                <div className="mt-2 font-semibold text-gray-900">{patient.name}</div>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="text-sm text-gray-500">编号</div>
                <div className="mt-2 font-semibold text-gray-900">{patient.no}</div>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="text-sm text-gray-500">手机号</div>
                <div className="mt-2 font-semibold text-gray-900">{patient.mobile}</div>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="text-sm text-gray-500">最近就诊</div>
                <div className="mt-2 font-semibold text-gray-900">{formatDateOnly(patient.latestVisit)}</div>
              </div>
            </div>
          </section>
          <section className="rounded-2xl border border-gray-100 bg-white p-5">
            <div className="text-base font-bold text-gray-900">回访信息</div>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <div>
                <div className="text-sm text-gray-500">回访项目类型</div>
                <select
                  value={followupType}
                  onChange={(e) => setFollowupType(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                >
                  <option value="角膜塑形镜">角膜塑形镜</option>
                  <option value="离焦框架镜">离焦框架镜</option>
                  <option value="离焦软镜">离焦软镜</option>
                  <option value="哺光仪">哺光仪</option>
                  <option value="视训">视训</option>
                  <option value="用药">用药</option>
                  <option value="定期复查">定期复查</option>
                </select>
              </div>
              <div>
                <div className="text-sm text-gray-500">复查日期</div>
                <input
                  value={reviewDate}
                  onChange={(e) => setReviewDate(e.target.value)}
                  type="date"
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <div>
                <div className="text-sm text-gray-500">负责人</div>
                <input
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-500">备注</div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-2 w-full min-h-[140px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-5">
            <div className="text-base font-bold text-gray-900">任务预览（原型结构）</div>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="text-sm text-gray-500">最近就诊</div>
                <div className="mt-2 font-semibold text-gray-900">{formatDateOnly(patient.latestVisit)}</div>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="text-sm text-gray-500">诊断</div>
                <div className="mt-2 font-semibold text-gray-900">{patient.diagnosis ?? "-"}</div>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="text-sm text-gray-500">项目类型</div>
                <div className="mt-2 font-semibold text-gray-900">{followupType || "-"}</div>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="text-sm text-gray-500">复查日期</div>
                <div className="mt-2 font-semibold text-gray-900">{reviewDate || "-"}</div>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="text-sm text-gray-500">负责人</div>
                <div className="mt-2 font-semibold text-gray-900">{owner || "-"}</div>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="text-sm text-gray-500">状态</div>
                <div className="mt-2 font-semibold text-gray-900">待跟进</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

