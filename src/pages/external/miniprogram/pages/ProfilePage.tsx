import {
  CalendarCheck,
  CaretRight,
  ChatCircleDots,
  Eyeglasses,
  IdentificationCard,
  Info,
  Question,
  User,
  Users,
} from "@phosphor-icons/react";
import { useLocation, useNavigate } from "react-router";
import { useMiniprogramApp } from "../context";

export default function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useMiniprogramApp();

  return (
    <div className="min-h-full bg-gray-50 pb-24">
      <div className="bg-emerald-600 text-white px-6 pt-12 pb-16 relative">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-full p-1">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
              className="w-full h-full rounded-full bg-gray-100"
              alt="Avatar"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold">微信昵称</h2>
            <p className="text-emerald-100 text-xs mt-1">138****8888</p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-6 bg-gray-50 rounded-t-[30px]"></div>
      </div>

      <div className="p-2 mt-4 space-y-3">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mx-2">
          <div
            className="border-b border-gray-50 p-4 flex justify-between items-center active:bg-gray-50"
            onClick={() => navigate({ pathname: "/miniprogram/my-appointments", search: location.search })}
          >
            <div className="flex items-center gap-3">
              <CalendarCheck weight="fill" className="text-blue-500 w-6 text-center text-xl" />
              <span className="text-sm font-medium text-gray-700">我的预约</span>
            </div>
            <CaretRight weight="bold" className="text-gray-300" />
          </div>
          <div
            className="border-b border-gray-50 p-4 flex justify-between items-center active:bg-gray-50"
            onClick={() => navigate({ pathname: "/miniprogram/family-groups", search: location.search })}
          >
            <div className="flex items-center gap-3">
              <Users weight="fill" className="text-orange-400 w-6 text-center text-xl" />
              <span className="text-sm font-medium text-gray-700">我的家庭组</span>
            </div>
            <CaretRight weight="bold" className="text-gray-300" />
          </div>
          <div
            className="border-b border-gray-50 p-4 flex justify-between items-center active:bg-gray-50"
            onClick={() => navigate({ pathname: "/miniprogram/patients", search: location.search })}
          >
            <div className="flex items-center gap-3">
              <User weight="fill" className="text-green-400 w-6 text-center text-xl" />
              <span className="text-sm font-medium text-gray-700">我的就诊人</span>
            </div>
            <CaretRight weight="bold" className="text-gray-300" />
          </div>
          <div
            className="border-b border-gray-50 p-4 flex justify-between items-center active:bg-gray-50"
            onClick={() => showToast("功能开发中")}
          >
            <div className="flex items-center gap-3">
              <IdentificationCard weight="fill" className="text-blue-500 w-6 text-center text-xl" />
              <span className="text-sm font-medium text-gray-700">档案记录</span>
            </div>
            <CaretRight weight="bold" className="text-gray-300" />
          </div>
          <div className="p-4 flex justify-between items-center active:bg-gray-50" onClick={() => showToast("功能开发中")}>
            <div className="flex items-center gap-3">
              <Eyeglasses weight="fill" className="text-orange-400 w-6 text-center text-xl" />
              <span className="text-sm font-medium text-gray-700">配镜记录</span>
            </div>
            <CaretRight weight="bold" className="text-gray-300" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden mx-2">
          <div className="border-b border-gray-50 p-4 flex justify-between items-center active:bg-gray-50" onClick={() => showToast("功能开发中")}>
            <div className="flex items-center gap-3">
              <Question weight="fill" className="text-gray-400 w-6 text-center text-xl" />
              <span className="text-sm font-medium text-gray-700">帮助中心</span>
            </div>
            <CaretRight weight="bold" className="text-gray-300" />
          </div>
          <div className="border-b border-gray-50 p-4 flex justify-between items-center active:bg-gray-50" onClick={() => showToast("功能开发中")}>
            <div className="flex items-center gap-3">
              <ChatCircleDots weight="fill" className="text-gray-400 w-6 text-center text-xl" />
              <span className="text-sm font-medium text-gray-700">意见反馈</span>
            </div>
            <CaretRight weight="bold" className="text-gray-300" />
          </div>
          <div className="p-4 flex justify-between items-center active:bg-gray-50" onClick={() => showToast("功能开发中")}>
            <div className="flex items-center gap-3">
              <Info weight="fill" className="text-gray-400 w-6 text-center text-xl" />
              <span className="text-sm font-medium text-gray-700">关于我们</span>
            </div>
            <CaretRight weight="bold" className="text-gray-300" />
          </div>
        </div>
      </div>
    </div>
  );
}

