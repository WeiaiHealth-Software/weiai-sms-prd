import { Crown } from "@phosphor-icons/react";
import { MiniTopBar } from "../ui";
import { useMiniBack } from "../hooks/useMiniBack";

export default function FamilyGroupDetailPage() {
  const onBack = useMiniBack();

  return (
    <div className="min-h-full flex flex-col bg-gray-50">
      <MiniTopBar title="家庭组详情" onBack={onBack} />
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="bg-emerald-600 rounded-2xl p-6 text-white mb-6 shadow-lg shadow-emerald-500/20 bg-gradient-to-br from-emerald-500 to-emerald-700">
          <h3 className="text-2xl font-bold mb-2">温馨小家</h3>
          <div className="flex items-center gap-2 text-xs text-emerald-100">
            <span className="bg-white/20 px-2 py-0.5 rounded">管理员</span>
            <span>成员 3 人</span>
          </div>
        </div>

        <h4 className="font-bold text-gray-800 mb-3 px-1">家庭成员</h4>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-4 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">你</div>
              <div>
                <h5 className="font-bold text-gray-800 text-sm">
                  你 <span className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded ml-1 font-normal">我</span>
                </h5>
                <p className="text-xs text-gray-400 mt-0.5">管理员</p>
              </div>
            </div>
            <Crown weight="fill" className="text-yellow-500 text-xl" />
          </div>

          <div className="p-4 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">李</div>
              <div>
                <h5 className="font-bold text-gray-800 text-sm">李梅</h5>
                <p className="text-xs text-gray-400 mt-0.5">妻子</p>
              </div>
            </div>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">王</div>
              <div>
                <h5 className="font-bold text-gray-800 text-sm">王小宝</h5>
                <p className="text-xs text-gray-400 mt-0.5">儿子</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 pb-8 shrink-0">
        <button className="flex-1 bg-red-50 text-red-500 py-3.5 rounded-xl font-bold active:bg-red-100 transition-colors">
          解散家庭组
        </button>
        <button className="flex-1 bg-emerald-600 text-white py-3.5 rounded-xl font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-transform">
          邀请成员
        </button>
      </div>
    </div>
  );
}

