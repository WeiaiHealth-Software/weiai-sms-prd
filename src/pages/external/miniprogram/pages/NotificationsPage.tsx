import { CalendarCheck, EnvelopeSimple, UsersThree } from "@phosphor-icons/react";
import { MiniTopBar } from "../ui";
import { useMiniBack } from "../hooks/useMiniBack";

export default function NotificationsPage() {
  const onBack = useMiniBack();

  return (
    <div className="min-h-full flex flex-col bg-gray-100">
      <MiniTopBar title="消息中心" onBack={onBack} />
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-50 relative">
          <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full"></div>
          <div className="flex items-center gap-2 mb-3">
            <CalendarCheck weight="fill" className="text-blue-500 text-lg" />
            <h3 className="font-bold text-gray-800 text-sm">预约成功提醒</h3>
            <span className="text-xs text-gray-400 ml-auto mr-4">10:30</span>
          </div>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            您预约 <span className="font-medium text-gray-800">3.20 号 张志明 医生</span>的特需号，就诊时间：
            <span className="font-medium text-gray-800">8:00-8:30</span>，请按时到店。
          </p>
          <div className="flex justify-end">
            <button className="bg-emerald-600 text-white text-xs px-4 py-1.5 rounded-full font-medium active:scale-95 transition-transform">
              查看详情
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <UsersThree weight="fill" className="text-green-500 text-lg" />
            <h3 className="font-bold text-gray-800 text-sm">家庭组成员加入</h3>
            <span className="text-xs text-gray-400 ml-auto">昨天</span>
          </div>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            您邀请的 <span className="font-medium text-gray-800">王小宝</span> 已成功加入家庭组：
            <span className="font-medium text-gray-800">温馨小家</span>。
          </p>
          <div className="flex justify-end">
            <button className="bg-gray-100 text-gray-600 text-xs px-4 py-1.5 rounded-full font-medium active:bg-gray-200 transition-colors">
              查看详情
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-50 relative">
          <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full"></div>
          <div className="flex items-center gap-2 mb-3">
            <EnvelopeSimple weight="fill" className="text-orange-500 text-lg" />
            <h3 className="font-bold text-gray-800 text-sm">家庭组邀请</h3>
            <span className="text-xs text-gray-400 ml-auto mr-4">前天</span>
          </div>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            您被 <span className="font-medium text-gray-800">张伟 (133****8888)</span> 邀请加入家庭组：
            <span className="font-medium text-gray-800">上海66号</span>。
          </p>
          <div className="flex justify-end gap-2">
            <button className="bg-red-50 text-red-500 text-xs px-4 py-1.5 rounded-full font-medium active:bg-red-100 transition-colors">
              拒绝
            </button>
            <button className="bg-emerald-600 text-white text-xs px-4 py-1.5 rounded-full font-medium active:scale-95 transition-transform">
              同意
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

