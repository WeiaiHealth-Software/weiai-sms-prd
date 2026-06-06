import { Bell, CalendarCheck, Eye, Eyeglasses, ShieldCheck, ShoppingBag, Stethoscope } from "@phosphor-icons/react";
import { useLocation, useNavigate } from "react-router";
import { useMiniprogramApp } from "../context";

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useMiniprogramApp();

  return (
    <div className="pb-24 bg-gray-50 min-h-full">
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 h-48 rounded-b-[40px] px-6 pt-6 text-white relative shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-emerald-100 text-sm">早上好，</p>
            <h2 className="text-xl font-bold">微信昵称</h2>
          </div>
          <div
            onClick={() => navigate({ pathname: "/miniprogram/notifications", search: location.search })}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm relative cursor-pointer active:scale-95 transition-transform"
          >
            <Bell weight="bold" />
            <div className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full"></div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex items-center justify-between gap-3 border border-white/20">
          <div className="flex items-center gap-3">
            <ShieldCheck weight="fill" className="text-2xl text-emerald-100" />
            <div>
              <p className="font-bold text-sm">眼健康守护计划</p>
              <p className="text-xs text-emerald-100">定期检查，预防近视</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate({ pathname: "/miniprogram/archive/new", search: location.search })}
            className="shrink-0 rounded-lg bg-white/20 px-3 py-2 text-xs font-bold text-white active:scale-95 transition-transform"
          >
            新增档案
          </button>
        </div>
      </div>

      <div className="px-4 mt-6">
        <div
          onClick={() => navigate({ pathname: "/miniprogram/store-select", search: location.search })}
          className="bg-white rounded-2xl p-6 shadow-sm flex items-center justify-between active:bg-gray-50 transition-colors cursor-pointer border border-gray-100"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
              <CalendarCheck weight="fill" className="text-2xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">快速预约</h3>
              <p className="text-xs text-gray-400 mt-1">无需现场排队，线上挑选专家</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 px-4 mt-4">
        <div
          className="bg-white p-3 rounded-xl shadow-sm border border-gray-50 cursor-pointer active:scale-95 transition-transform"
          onClick={() => showToast("功能开发中")}
        >
          <Eye weight="fill" className="text-blue-400 text-xl mb-2" />
          <h4 className="font-bold text-gray-700 text-sm">视觉训练</h4>
          <p className="text-[10px] text-gray-400">定制康复训练</p>
        </div>
        <div
          className="bg-white p-3 rounded-xl shadow-sm border border-gray-50 cursor-pointer active:scale-95 transition-transform"
          onClick={() => showToast("功能开发中")}
        >
          <Eyeglasses weight="fill" className="text-orange-400 text-xl mb-2" />
          <h4 className="font-bold text-gray-700 text-sm">配镜服务</h4>
          <p className="text-[10px] text-gray-400">专业验光配镜</p>
        </div>
        <div
          className="bg-white p-3 rounded-xl shadow-sm border border-gray-50 cursor-pointer active:scale-95 transition-transform"
          onClick={() => showToast("功能开发中")}
        >
          <Stethoscope weight="fill" className="text-purple-400 text-xl mb-2" />
          <h4 className="font-bold text-gray-700 text-sm">检查报告</h4>
          <p className="text-[10px] text-gray-400">随时查看档案</p>
        </div>
      </div>

      <div className="px-4 mt-4">
        <div
          onClick={() => showToast("商城功能开发中...")}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 shadow-lg text-white flex items-center justify-between relative overflow-hidden cursor-pointer active:scale-95 transition-transform"
        >
          <div className="absolute -right-4 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg">惟爱商城</h3>
              <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">严选好物</span>
            </div>
            <p className="text-xs text-emerald-50 opacity-90">专注眼视光领域，护眼产品一站购齐</p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm relative z-10">
            <ShoppingBag weight="fill" className="text-lg" />
          </div>
        </div>
      </div>
      <div className="px-4 mt-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-lg text-slate-800">健康资讯</h3>
          <div className="flex bg-white rounded-lg p-1 border border-slate-100 shadow-sm">
            <button className="px-3 py-1 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-md">科普文章</button>
            <button className="px-3 py-1 text-xs text-slate-500 hover:bg-slate-50 rounded-md transition-colors">健康视频</button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 cursor-pointer active:scale-[0.98] transition-transform">
            <div className="h-32 bg-slate-200 relative">
              <img
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800"
                className="w-full h-full object-cover"
                alt="article"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <h4 className="absolute bottom-3 left-4 right-4 text-white font-bold text-sm line-clamp-2">
                孩子近视加深快？可能是这几个坏习惯导致...
              </h4>
            </div>
            <div className="p-4">
              <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                长时间近距离用眼、户外活动不足、睡眠不足等都是导致近视加深的主要原因。家长应该如何科学干预？眼...
              </p>
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Eye weight="fill" /> 2381 阅读
                </span>
                <span>2024-03-10</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 cursor-pointer active:scale-[0.98] transition-transform">
            <div className="h-32 bg-slate-200 relative">
              <img
                src="https://images.unsplash.com/photo-1520690214124-2405c5217036?auto=format&fit=crop&q=80&w=800"
                className="w-full h-full object-cover"
                alt="article"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <h4 className="absolute bottom-3 left-4 right-4 text-white font-bold text-sm line-clamp-2">干眼症不仅是缺水，可能是睑板腺堵了</h4>
            </div>
            <div className="p-4">
              <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                眼睛干涩、异物感、畏光流泪？这可能是干眼症的信号。除了点眼药水，热敷和睑板腺按摩也很重要。
              </p>
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Eye weight="fill" /> 1542 阅读
                </span>
                <span>2024-03-08</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

