import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, FloppyDisk } from "@phosphor-icons/react";
import { patients, visitDetailRecords, historyVisits } from "./mockData";

function formatDateOnly(value?: string) {
  if (!value) return "-";
  return String(value).split(" ")[0];
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

  const [doctor, setDoctor] = useState(seed.basicInfo.doctor);
  const [optometrist, setOptometrist] = useState(seed.basicInfo.optometrist);
  const [cycloplegia, setCycloplegia] = useState(seed.basicInfo.cycloplegia);
  const [eye, setEye] = useState(seed.chiefHistory.eye);
  const [symptom, setSymptom] = useState(seed.chiefHistory.symptom);
  const [duration, setDuration] = useState(seed.chiefHistory.duration);
  const [durationUnit, setDurationUnit] = useState(seed.chiefHistory.durationUnit);
  const [description, setDescription] = useState(seed.chiefHistory.description);
  const [diagnosis, setDiagnosis] = useState(seed.diagnosis);
  const [advice, setAdvice] = useState(seed.treatment.advice);
  const [followupCycle, setFollowupCycle] = useState(seed.treatment.followupCycle);
  const [estimatedDate, setEstimatedDate] = useState(seed.treatment.estimatedDate);
  const [reminderDate, setReminderDate] = useState(seed.treatment.reminderDate);
  const [saved, setSaved] = useState(false);

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
                className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 active:bg-primary-700"
                onClick={() => setSaved(true)}
              >
                <FloppyDisk weight="bold" className="h-4 w-4" />
                保存
              </button>
            </div>
          </div>
          {saved && (
            <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              已保存（示例数据，本期仅打通页面与交互路径）
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
            <div className="text-base font-bold text-gray-900">基本信息</div>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <div>
                <div className="text-sm text-gray-500">医生</div>
                <input
                  value={doctor}
                  onChange={(e) => setDoctor(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <div>
                <div className="text-sm text-gray-500">验光师</div>
                <input
                  value={optometrist}
                  onChange={(e) => setOptometrist(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <div>
                <div className="text-sm text-gray-500">散瞳</div>
                <input
                  value={cycloplegia}
                  onChange={(e) => setCycloplegia(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-5">
            <div className="text-base font-bold text-gray-900">主诉 / 现病史</div>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <div>
                <div className="text-sm text-gray-500">眼别</div>
                <select
                  value={eye}
                  onChange={(e) => setEye(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                >
                  <option value="双眼">双眼</option>
                  <option value="右眼">右眼</option>
                  <option value="左眼">左眼</option>
                </select>
              </div>
              <div>
                <div className="text-sm text-gray-500">症状</div>
                <input
                  value={symptom}
                  onChange={(e) => setSymptom(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <div>
                <div className="text-sm text-gray-500">病程</div>
                <div className="mt-2 grid grid-cols-[1fr_120px] gap-3">
                  <input
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  />
                  <select
                    value={durationUnit}
                    onChange={(e) => setDurationUnit(e.target.value)}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  >
                    <option value="日">日</option>
                    <option value="周">周</option>
                    <option value="月">月</option>
                    <option value="年">年</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-500">描述</div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-2 w-full min-h-[140px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-5">
            <div className="text-base font-bold text-gray-900">诊断与处理</div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div>
                <div className="text-sm text-gray-500">诊断</div>
                <textarea
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="mt-2 w-full min-h-[120px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <div>
                <div className="text-sm text-gray-500">处理意见</div>
                <textarea
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                  className="mt-2 w-full min-h-[120px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                />
                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  <div>
                    <div className="text-sm text-gray-500">复查周期</div>
                    <input
                      value={followupCycle}
                      onChange={(e) => setFollowupCycle(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">预计复查</div>
                    <input
                      value={estimatedDate}
                      onChange={(e) => setEstimatedDate(e.target.value)}
                      type="date"
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">提醒日期</div>
                    <input
                      value={reminderDate}
                      onChange={(e) => setReminderDate(e.target.value)}
                      type="date"
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

