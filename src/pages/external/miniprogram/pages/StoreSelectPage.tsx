import { MapPin } from "@phosphor-icons/react";
import { useLocation, useNavigate } from "react-router";
import { useMiniBack } from "../hooks/useMiniBack";
import { MiniTopBar } from "../ui";

export default function StoreSelectPage() {
  const onBack = useMiniBack();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-full bg-gray-50 flex flex-col">
      <MiniTopBar title="选择就诊门店" onBack={onBack} />
      <div className="p-4 space-y-3">
        <div
          onClick={() => navigate({ pathname: "/miniprogram/appointment", search: location.search })}
          className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 active:border-emerald-500 cursor-pointer flex gap-3"
        >
          <div className="w-24 h-20 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=200&h=200"
              className="w-full h-full object-cover"
              alt="store"
            />
          </div>
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">惟爱视觉·上海海华医院</h3>
              <div className="flex gap-1 mt-1.5">
                <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">眼科门诊</span>
                <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">医保定点</span>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              <MapPin weight="fill" className="inline mr-1" />
              上海市嘉定区
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

