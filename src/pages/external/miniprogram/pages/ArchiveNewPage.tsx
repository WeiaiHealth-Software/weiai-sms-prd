import clsx from "clsx";
import { useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { Hospital } from "lucide-react";
import { MiniTopBar } from "../ui";
import { useMiniBack } from "../hooks/useMiniBack";
import { eyeDiseaseOptions } from "../constants/eyeDiseaseOptions";
import { createPatientArchive } from "../services/patientArchive.service";
import { useMiniprogramApp } from "../context";

type ArchiveForm = {
  name: string;
  age: string;
  gender: "男" | "女" | "";
  mobile: string;
  idCard: string;
  eyeDiseaseHistory: string;
  eyeSurgerySide: "无" | "左眼" | "右眼" | "双眼";
  eyeSurgeryDesc: string;
};

function createEmptyArchiveForm(): ArchiveForm {
  return {
    name: "",
    age: "",
    gender: "",
    mobile: "",
    idCard: "",
    eyeDiseaseHistory: "无",
    eyeSurgerySide: "无",
    eyeSurgeryDesc: "",
  };
}

export default function ArchiveNewPage() {
  const onBack = useMiniBack();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useMiniprogramApp();
  const [searchParams] = useSearchParams();

  const archiveStoreId = useMemo(() => {
    return searchParams.get("storeId") || searchParams.get("store") || "惟爱 · 上海海华医院";
  }, [searchParams]);

  const [archiveForm, setArchiveForm] = useState<ArchiveForm>(() => createEmptyArchiveForm());

  const submitArchive = () => {
    if (!archiveForm.name.trim()) return showToast("请填写姓名");
    if (!archiveForm.age.trim() || Number.isNaN(Number(archiveForm.age))) return showToast("请填写正确年龄");
    if (!archiveForm.gender) return showToast("请选择性别");
    if (!archiveForm.mobile.trim()) return showToast("请填写手机号");
    if (archiveForm.eyeSurgerySide !== "无" && !archiveForm.eyeSurgeryDesc.trim()) return showToast("请填写手术史描述");

    createPatientArchive({
      storeId: archiveStoreId,
      name: archiveForm.name.trim(),
      age: Number(archiveForm.age),
      gender: archiveForm.gender as "男" | "女",
      mobile: archiveForm.mobile.trim(),
      idCard: archiveForm.idCard.trim() ? archiveForm.idCard.trim() : undefined,
      medicalHistory: {
        eyeDiseaseHistory: archiveForm.eyeDiseaseHistory,
        eyeSurgerySide: archiveForm.eyeSurgerySide,
        eyeSurgeryDesc: archiveForm.eyeSurgerySide === "无" ? undefined : archiveForm.eyeSurgeryDesc.trim(),
      },
    });

    showToast("建档成功");
    navigate({ pathname: "/miniprogram/home", search: location.search }, { replace: true });
  };

  return (
    <div className="min-h-full flex flex-col bg-white">
      <MiniTopBar title="新增档案" onBack={onBack} />
      <div className="flex-1 bg-white">
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="text-xs font-bold text-gray-500">门店（扫码自动识别）</div>
          <div className="mt-1 text-md font-bold text-gray-900 flex items-center gap-2">
            <Hospital className="font-bold w-4 h-4 text-emerald-600" />
            {archiveStoreId}
          </div>
        </div>

        <div className="px-4 py-3 flex gap-2 text-md font-bold text-gray-900">
          <label className="border-l-4 border-emerald-500"></label>基本信息
        </div>

        <div className="px-4 py-2 pt-0">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            姓名 <span className="text-red-500">*</span>
          </label>
          <input
            value={archiveForm.name}
            onChange={(e) => setArchiveForm((p) => ({ ...p, name: e.target.value }))}
            type="text"
            placeholder="请输入姓名"
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-gray-300"
          />
        </div>

        <div className="px-4 py-2 pt-0">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            年龄 <span className="text-red-500">*</span>
          </label>
          <input
            value={archiveForm.age}
            onChange={(e) => setArchiveForm((p) => ({ ...p, age: e.target.value }))}
            inputMode="numeric"
            placeholder="请输入年龄"
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-gray-300"
          />
        </div>

        <div className="px-4 py-2 pt-0">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            性别 <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-6 items-center py-2">
            <button type="button" onClick={() => setArchiveForm((p) => ({ ...p, gender: "男" }))} className="flex items-center gap-2">
              <div
                className={clsx(
                  "w-5 h-5 rounded-full bg-white ring-1 ring-gray-200",
                  archiveForm.gender === "男" ? "border-[6px] border-emerald-600" : "border border-gray-300"
                )}
              ></div>
              <span className="text-sm text-gray-700">男</span>
            </button>
            <button type="button" onClick={() => setArchiveForm((p) => ({ ...p, gender: "女" }))} className="flex items-center gap-2">
              <div
                className={clsx(
                  "w-5 h-5 rounded-full bg-white ring-1 ring-gray-200",
                  archiveForm.gender === "女" ? "border-[6px] border-emerald-600" : "border border-gray-300"
                )}
              ></div>
              <span className="text-sm text-gray-700">女</span>
            </button>
          </div>
        </div>

        <div className="px-4 py-2 pt-0">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            手机号 <span className="text-red-500">*</span>
          </label>
          <input
            value={archiveForm.mobile}
            onChange={(e) => setArchiveForm((p) => ({ ...p, mobile: e.target.value }))}
            inputMode="tel"
            placeholder="请输入手机号"
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-gray-300"
          />
        </div>

        <div className="px-4 py-2 pt-0 border-b border-gray-100">
          <label className="block text-sm font-bold text-gray-700 mb-2">身份证号</label>
          <input
            value={archiveForm.idCard}
            onChange={(e) => setArchiveForm((p) => ({ ...p, idCard: e.target.value }))}
            type="text"
            placeholder="选填"
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-gray-300"
          />
        </div>

        <div className="px-4 py-3 flex gap-2 text-md font-bold text-gray-900">
          <label className="border-l-4 border-emerald-500"></label>病史信息（选填）
        </div>

        <div className="px-4 py-4 pt-0">
          <label className="block text-sm font-bold text-gray-700 mb-2">眼部疾病史</label>
          <select
            value={archiveForm.eyeDiseaseHistory}
            onChange={(e) => setArchiveForm((p) => ({ ...p, eyeDiseaseHistory: e.target.value }))}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
          >
            {eyeDiseaseOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="px-4 py-4 pt-0">
          <label className="block text-sm font-bold text-gray-700 mb-2">眼部手术史</label>
          <select
            value={archiveForm.eyeSurgerySide}
            onChange={(e) =>
              setArchiveForm((p) => ({
                ...p,
                eyeSurgerySide: e.target.value as ArchiveForm["eyeSurgerySide"],
                eyeSurgeryDesc: e.target.value === "无" ? "" : p.eyeSurgeryDesc,
              }))
            }
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
          >
            <option value="无">无</option>
            <option value="左眼">左眼</option>
            <option value="右眼">右眼</option>
            <option value="双眼">双眼</option>
          </select>
        </div>

        {archiveForm.eyeSurgerySide !== "无" && (
          <div className="px-4 py-4 pt-0">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              手术史描述 <span className="text-red-500">*</span>
            </label>
            <input
              value={archiveForm.eyeSurgeryDesc}
              onChange={(e) => setArchiveForm((p) => ({ ...p, eyeSurgeryDesc: e.target.value }))}
              type="text"
              placeholder="请输入手术名称或说明"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-gray-300"
            />
          </div>
        )}
      </div>

      <div className="px-4 py-3 bg-white border-t border-gray-100 mt-auto">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-[0.4] bg-white text-gray-600 py-3.5 rounded-xl font-bold active:bg-gray-50 transition-colors border border-gray-200"
          >
            取消
          </button>
          <button
            type="button"
            onClick={submitArchive}
            className="flex-[0.6] bg-emerald-600 text-white py-3.5 rounded-xl font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-transform"
          >
            确认建档
          </button>
        </div>
      </div>
    </div>
  );
}

