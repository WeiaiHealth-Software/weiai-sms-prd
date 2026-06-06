import { CalendarCheck, Cake, GenderFemale, GenderMale, IdentificationCard, PencilSimple, Plus, X } from "@phosphor-icons/react";
import { useState } from "react";
import { useMiniprogramApp } from "../context";
import { useMiniBack } from "../hooks/useMiniBack";
import { MiniTopBar } from "../ui";

export default function PatientListPage() {
  const onBack = useMiniBack();
  const { showToast } = useMiniprogramApp();
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);

  return (
    <>
      <div className="min-h-full flex flex-col bg-gray-50">
        <MiniTopBar
          title="我的就诊人"
          onBack={onBack}
          rightSlot={
            <button
              type="button"
              onClick={() => setIsAddPatientOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-full active:bg-gray-100 text-emerald-600"
              aria-label="添加"
            >
              <Plus weight="bold" className="text-xl" />
            </button>
          }
        />
        <div className="p-4 space-y-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between active:scale-[0.98] transition-transform">
            <div>
              <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2 mb-3">
                张三 <GenderMale weight="bold" className="text-blue-500 text-base" />
              </h3>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <Cake weight="fill" className="text-orange-400" /> 1990-01-01
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <IdentificationCard weight="fill" className="text-blue-400" /> 3101****1234
                </p>
              </div>
            </div>
            <button className="w-10 h-10 rounded-full hover:bg-gray-50 flex items-center justify-center text-emerald-600 transition-colors">
              <PencilSimple weight="bold" className="text-xl" />
            </button>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between active:scale-[0.98] transition-transform">
            <div>
              <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2 mb-3">
                李四 <GenderFemale weight="bold" className="text-pink-500 text-base" />
              </h3>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <Cake weight="fill" className="text-orange-400" /> 1995-05-20
                </p>
              </div>
            </div>
            <button className="w-10 h-10 rounded-full hover:bg-gray-50 flex items-center justify-center text-emerald-600 transition-colors">
              <PencilSimple weight="bold" className="text-xl" />
            </button>
          </div>
        </div>
      </div>

      {isAddPatientOpen && (
        <div className="absolute inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsAddPatientOpen(false)}></div>
          <div className="absolute bottom-0 w-full bg-white rounded-t-2xl p-6 transform transition-transform duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">添加就诊人</h3>
              <button
                onClick={() => setIsAddPatientOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X weight="bold" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="请输入真实姓名"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  性别 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-6 items-center py-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="w-5 h-5 rounded-full border-[6px] border-emerald-600 bg-white ring-1 ring-gray-200"></div>
                    <span className="text-sm text-gray-700">男</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="w-5 h-5 rounded-full border border-gray-300 bg-white"></div>
                    <span className="text-sm text-gray-700">女</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">出生日期</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="年 / 月 / 日"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-gray-300"
                  />
                  <CalendarCheck weight="bold" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">身份证号</label>
                <input
                  type="text"
                  placeholder="选填，用于医保挂号"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-gray-300"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8 pb-4">
              <button
                onClick={() => setIsAddPatientOpen(false)}
                className="flex-[0.4] bg-gray-50 text-gray-600 py-3.5 rounded-xl font-bold active:bg-gray-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  showToast("添加成功");
                  setIsAddPatientOpen(false);
                }}
                className="flex-[0.6] bg-emerald-600 text-white py-3.5 rounded-xl font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-transform"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

