import { MiniTopBar } from "../ui";
import { useMiniBack } from "../hooks/useMiniBack";

export default function AppointmentPage() {
  const onBack = useMiniBack();

  return (
    <div className="h-full flex flex-col bg-white">
      <MiniTopBar title="惟爱视觉·上海海华医院" onBack={onBack} />
      <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-100 bg-white">请选择就诊时间与医生</div>
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">预约选择页面开发中...</div>
    </div>
  );
}

