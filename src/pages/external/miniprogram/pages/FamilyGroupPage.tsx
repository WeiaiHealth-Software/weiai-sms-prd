import { CaretRight, HouseLine, Plus } from "@phosphor-icons/react";
import { useLocation, useNavigate } from "react-router";
import { useMiniprogramApp } from "../context";
import { useMiniBack } from "../hooks/useMiniBack";
import { MiniTopBar } from "../ui";

export default function FamilyGroupPage() {
  const onBack = useMiniBack();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useMiniprogramApp();

  return (
    <div className="min-h-full flex flex-col bg-gray-100">
      <MiniTopBar
        title="我的家庭组"
        onBack={onBack}
        rightSlot={
          <button
            type="button"
            onClick={() => showToast("添加家庭组")}
            className="w-10 h-10 flex items-center justify-center rounded-full active:bg-gray-100 text-emerald-600"
            aria-label="添加"
          >
            <Plus weight="bold" className="text-xl" />
          </button>
        }
      />
      <div className="p-4 space-y-4">
        <div
          onClick={() => navigate({ pathname: "/miniprogram/family-groups/1", search: location.search })}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-50 flex items-center justify-between active:scale-[0.98] transition-transform cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
              <HouseLine weight="fill" className="text-2xl" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">温馨小家</h3>
              <p className="text-xs text-gray-500 mt-1">3 位成员</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="bg-emerald-50 text-emerald-600 text-[10px] px-2 py-0.5 rounded font-medium border border-emerald-100">
              管理员
            </span>
            <CaretRight weight="bold" className="text-gray-300" />
          </div>
        </div>

        <div
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-50 flex items-center justify-between active:scale-[0.98] transition-transform cursor-pointer"
          onClick={() => showToast("详情开发中")}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
              <HouseLine weight="fill" className="text-2xl" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">老家大院</h3>
              <p className="text-xs text-gray-500 mt-1">3 位成员</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded font-medium border border-blue-100">成员</span>
            <CaretRight weight="bold" className="text-gray-300" />
          </div>
        </div>
      </div>
    </div>
  );
}

