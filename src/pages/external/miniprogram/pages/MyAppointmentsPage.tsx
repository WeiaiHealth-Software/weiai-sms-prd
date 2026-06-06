import { MiniTopBar } from "../ui";
import { useMiniBack } from "../hooks/useMiniBack";

export default function MyAppointmentsPage() {
  const onBack = useMiniBack();

  return (
    <div className="min-h-full flex flex-col bg-gray-100">
      <MiniTopBar title="我的预约" onBack={onBack} />
      <div className="bg-white px-4 pb-2 border-b border-gray-200 flex gap-4 sticky top-[48px] z-10">
        <div className="flex-1 py-2 text-center text-emerald-600 font-bold border-b-2 border-emerald-600">门诊预约</div>
        <div className="flex-1 py-2 text-center text-gray-500 font-medium">视觉训练</div>
      </div>
      <div className="p-4 space-y-3">
        <div className="bg-white rounded-xl p-4 shadow-sm relative">
          <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-50">
            <div>
              <div className="text-sm font-bold text-gray-800">
                09:00-09:30 <span className="ml-1">上午05号</span>
              </div>
              <div className="text-xs text-gray-400 mt-0.5">2026-04-23</div>
            </div>
            <div className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded shrink-0 font-medium">预约成功</div>
          </div>
          <div className="flex gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-lg border border-emerald-100">
              张
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-base">
                张志明 <span className="text-xs text-gray-400 font-normal ml-1">主任医师</span>
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">惟爱视觉总院 眼科</p>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">就诊人：张三</p>
            <button className="border border-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-full active:bg-gray-50 bg-white">电子凭条</button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm relative">
          <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-50">
            <div>
              <div className="text-sm font-bold text-gray-800">
                14:00-14:30 <span className="ml-1">下午12号</span>
              </div>
              <div className="text-xs text-gray-400 mt-0.5">2026-04-20</div>
            </div>
            <div className="border border-emerald-600 text-emerald-600 bg-emerald-50 text-xs px-2 py-0.5 rounded shrink-0 font-medium">
              已完成
            </div>
          </div>
          <div className="flex gap-3 mb-3 opacity-60">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-lg border border-emerald-100">
              李
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-base">
                李晓华 <span className="text-xs text-gray-400 font-normal ml-1">主任医师</span>
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">海淀分院 眼科</p>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">就诊人：张三</p>
            <button className="border border-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-full active:bg-gray-50 bg-white">查看详情</button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm relative">
          <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-50">
            <div>
              <div className="text-sm font-bold text-gray-800">
                10:00-10:30 <span className="ml-1">上午08号</span>
              </div>
              <div className="text-xs text-gray-400 mt-0.5">2026-04-17</div>
            </div>
            <div className="border border-red-500 text-red-500 bg-red-50 text-xs px-2 py-0.5 rounded shrink-0 font-medium">已取消</div>
          </div>
          <div className="flex gap-3 mb-3 opacity-40">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-lg border border-emerald-100">
              王
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-base">
                王大力 <span className="text-xs text-gray-400 font-normal ml-1">主任医师</span>
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">惟爱视觉总院 眼科</p>
            </div>
          </div>
          <div className="flex justify-between items-center opacity-40">
            <p className="text-sm text-gray-600">就诊人：张三</p>
          </div>
        </div>
      </div>
    </div>
  );
}

