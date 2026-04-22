import { useState } from "react";
import { Eye, ShieldCheck, CalendarCheck, Eyeglasses, Stethoscope, ShoppingBag, Bell, X, MapPin, ArrowLeft, Users, User, Question, ChatCircleDots, Info, QrCode, CaretRight, WechatLogo, UsersThree, EnvelopeSimple, Crown, Plus, HouseLine } from "@phosphor-icons/react";
import clsx from "clsx";

type PageId = "login" | "home" | "notifications" | "store-select" | "appointment" | "profile" | "family-group" | "family-group-detail" | "patient-list" | "my-appointments" | "appointment-detail";

export default function Miniprogram() {
  const [currentPage, setCurrentPage] = useState<PageId>("login");
  const [currentTab, setCurrentTab] = useState<"home" | "profile">("home");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  const [isLoginDrawerOpen, setIsLoginDrawerOpen] = useState(false);
  const [isQrCodeOpen, setIsQrCodeOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  };

  const navigateTo = (page: PageId) => {
    setCurrentPage(page);
  };

  const goBack = () => {
    if (currentPage === "notifications") setCurrentPage("home");
    else if (currentPage === "patient-list") setCurrentPage("profile");
    else if (currentPage === "family-group-detail") setCurrentPage("family-group");
    else if (currentPage === "family-group") setCurrentPage("profile");
    else if (currentPage === "appointment-detail") setCurrentPage("my-appointments");
    else if (currentPage === "my-appointments") setCurrentPage("profile");
    else if (currentPage === "appointment") setCurrentPage("store-select");
    else if (currentPage === "store-select") setCurrentPage("home");
  };

  const handleLogin = () => {
    setIsLoginDrawerOpen(true);
  };

  const confirmLogin = () => {
    setIsLoginDrawerOpen(false);
    showToast("登录成功");
    setTimeout(() => {
      setCurrentPage("home");
    }, 500);
  };

  // Content for Home Page
  const HomePage = () => (
    <div className="pb-24 bg-gray-50 min-h-full">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 h-48 rounded-b-[40px] px-6 pt-6 text-white relative shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-emerald-100 text-sm">早上好，</p>
            <h2 className="text-xl font-bold">微信昵称</h2>
          </div>
          <div onClick={() => navigateTo("notifications")} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm relative cursor-pointer active:scale-95 transition-transform">
            <Bell weight="bold" />
            <div className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full"></div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex items-center gap-3 border border-white/20">
          <ShieldCheck weight="fill" className="text-2xl text-emerald-100" />
          <div>
            <p className="font-bold text-sm">眼健康守护计划</p>
            <p className="text-xs text-emerald-100">定期检查，预防近视</p>
          </div>
        </div>
      </div>

      {/* Core Actions */}
      <div className="px-4 mt-6">
        <div onClick={() => navigateTo("store-select")} className="bg-white rounded-2xl p-6 shadow-sm flex items-center justify-between active:bg-gray-50 transition-colors cursor-pointer border border-gray-100">
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
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-50 cursor-pointer active:scale-95 transition-transform" onClick={() => showToast("功能开发中")}>
          <Eye weight="fill" className="text-blue-400 text-xl mb-2" />
          <h4 className="font-bold text-gray-700 text-sm">视觉训练</h4>
          <p className="text-[10px] text-gray-400">定制康复训练</p>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-50 cursor-pointer active:scale-95 transition-transform" onClick={() => showToast("功能开发中")}>
          <Eyeglasses weight="fill" className="text-orange-400 text-xl mb-2" />
          <h4 className="font-bold text-gray-700 text-sm">配镜服务</h4>
          <p className="text-[10px] text-gray-400">专业验光配镜</p>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-50 cursor-pointer active:scale-95 transition-transform" onClick={() => showToast("功能开发中")}>
          <Stethoscope weight="fill" className="text-purple-400 text-xl mb-2" />
          <h4 className="font-bold text-gray-700 text-sm">检查报告</h4>
          <p className="text-[10px] text-gray-400">随时查看档案</p>
        </div>
      </div>

      {/* Store */}
      <div className="px-4 mt-4">
        <div onClick={() => showToast("商城功能开发中...")} className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 shadow-lg text-white flex items-center justify-between relative overflow-hidden cursor-pointer active:scale-95 transition-transform">
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
              <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="article" />
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
                <span className="flex items-center gap-1"><Eye weight="fill" /> 2381 阅读</span>
                <span>2024-03-10</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 cursor-pointer active:scale-[0.98] transition-transform">
            <div className="h-32 bg-slate-200 relative">
              <img src="https://images.unsplash.com/photo-1520690214124-2405c5217036?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="article" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <h4 className="absolute bottom-3 left-4 right-4 text-white font-bold text-sm line-clamp-2">
                干眼症不仅是缺水，可能是睑板腺堵了
              </h4>
            </div>
            <div className="p-4">
              <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                眼睛干涩、异物感、畏光流泪？这可能是干眼症的信号。除了点眼药水，热敷和睑板腺按摩也很重要。
              </p>
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span className="flex items-center gap-1"><Eye weight="fill" /> 1542 阅读</span>
                <span>2024-03-08</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ProfilePage = () => (
    <div className="min-h-full bg-gray-50 pb-24">
      <div className="bg-emerald-600 text-white px-6 pt-12 pb-16 relative">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-full p-1">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="w-full h-full rounded-full bg-gray-100" alt="Avatar" />
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
          <div className="border-b border-gray-50 p-4 flex justify-between items-center active:bg-gray-50" onClick={() => navigateTo("my-appointments")}>
            <div className="flex items-center gap-3">
              <CalendarCheck weight="fill" className="text-blue-500 w-6 text-center text-xl" />
              <span className="text-sm font-medium text-gray-700">我的预约</span>
            </div>
            <CaretRight weight="bold" className="text-gray-300" />
          </div>
          <div className="border-b border-gray-50 p-4 flex justify-between items-center active:bg-gray-50" onClick={() => navigateTo("family-group")}>
            <div className="flex items-center gap-3">
              <Users weight="fill" className="text-orange-400 w-6 text-center text-xl" />
              <span className="text-sm font-medium text-gray-700">我的家庭组</span>
            </div>
            <CaretRight weight="bold" className="text-gray-300" />
          </div>
          <div className="border-b border-gray-50 p-4 flex justify-between items-center active:bg-gray-50" onClick={() => showToast("功能开发中")}>
            <div className="flex items-center gap-3">
              <User weight="fill" className="text-green-400 w-6 text-center text-xl" />
              <span className="text-sm font-medium text-gray-700">我的就诊人</span>
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

  return (
    <div className="bg-gray-200 h-screen w-screen flex justify-center items-center font-sans">
      <div className="w-full h-full sm:w-[375px] sm:h-[812px] bg-gray-50 flex flex-col relative sm:rounded-[40px] sm:border-[14px] border-gray-900 sm:shadow-2xl overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[25px] bg-gray-900 rounded-b-xl z-50 hidden sm:block"></div>
        
        {/* Status Bar */}
        <div className="h-12 w-full bg-white flex justify-between items-end px-6 pb-2 text-xs font-bold text-gray-800 z-20 shadow-sm relative">
          <span>9:41</span>
          <div className="flex gap-1">
            <span className="text-[10px]">5G</span>
            <span className="text-[10px]">100%</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto relative bg-gray-50 no-scrollbar">
          {currentPage === "login" && (
            <div className="min-h-full flex flex-col items-center justify-center p-8 bg-white z-50 absolute inset-0">
              <div className="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center mb-6 text-emerald-600 shadow-sm">
                <Eye weight="fill" className="text-5xl" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">惟爱视觉</h1>
              <p className="text-slate-500 mb-12 text-sm">专业的视光门诊服务平台</p>
              
              <div className="w-full space-y-4">
                <button onClick={handleLogin} className="w-full bg-[#07C160] hover:bg-[#06ad56] text-white py-3.5 rounded-xl font-medium shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                  <WechatLogo weight="fill" className="text-xl" />
                  微信用户一键登录
                </button>
                <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
                  <Info weight="fill" className="text-slate-300" /> 为了提供完整的预约服务，我们需要获取您的公开信息
                </p>
              </div>

              <div className="absolute bottom-12 flex items-center gap-2 text-xs text-slate-500">
                <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600" />
                <span>我已阅读并同意 <a href="#" className="text-emerald-600 hover:underline">《用户协议》</a> 与 <a href="#" className="text-emerald-600 hover:underline">《隐私政策》</a></span>
              </div>
            </div>
          )}

          {currentPage === "home" && <HomePage />}
          {currentPage === "profile" && <ProfilePage />}

          {currentPage === "notifications" && (
            <div className="min-h-full flex flex-col bg-gray-100">
              <div className="bg-white px-4 py-3 shadow-sm flex items-center gap-3 z-10 sticky top-0">
                <ArrowLeft weight="bold" onClick={goBack} className="text-gray-600 p-2 cursor-pointer text-xl" />
                <h2 className="font-bold text-lg flex-1 text-center pr-8">消息中心</h2>
              </div>
              <div className="p-4 space-y-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-50 relative">
                  <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="flex items-center gap-2 mb-3">
                    <CalendarCheck weight="fill" className="text-blue-500 text-lg" />
                    <h3 className="font-bold text-gray-800 text-sm">预约成功提醒</h3>
                    <span className="text-xs text-gray-400 ml-auto mr-4">10:30</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    您预约 <span className="font-medium text-gray-800">3.20 号 张志明 医生</span>的特需号，就诊时间：<span className="font-medium text-gray-800">8:00-8:30</span>，请按时到店。
                  </p>
                  <div className="flex justify-end">
                    <button className="bg-emerald-600 text-white text-xs px-4 py-1.5 rounded-full font-medium active:scale-95 transition-transform">查看详情</button>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-50">
                  <div className="flex items-center gap-2 mb-3">
                    <UsersThree weight="fill" className="text-green-500 text-lg" />
                    <h3 className="font-bold text-gray-800 text-sm">家庭组成员加入</h3>
                    <span className="text-xs text-gray-400 ml-auto">昨天</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    您邀请的 <span className="font-medium text-gray-800">王小宝</span> 已成功加入家庭组：<span className="font-medium text-gray-800">温馨小家</span>。
                  </p>
                  <div className="flex justify-end">
                    <button className="bg-gray-100 text-gray-600 text-xs px-4 py-1.5 rounded-full font-medium active:bg-gray-200 transition-colors">查看详情</button>
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
                    您被 <span className="font-medium text-gray-800">张伟 (133****8888)</span> 邀请加入家庭组：<span className="font-medium text-gray-800">上海66号</span>。
                  </p>
                  <div className="flex justify-end gap-2">
                    <button className="bg-red-50 text-red-500 text-xs px-4 py-1.5 rounded-full font-medium active:bg-red-100 transition-colors">拒绝</button>
                    <button className="bg-emerald-600 text-white text-xs px-4 py-1.5 rounded-full font-medium active:scale-95 transition-transform">同意</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentPage === "store-select" && (
            <div className="min-h-full bg-gray-50 flex flex-col">
              <div className="bg-white px-4 py-3 shadow-sm flex items-center gap-3 z-10">
                <ArrowLeft weight="bold" onClick={goBack} className="text-gray-600 p-2 cursor-pointer text-xl" />
                <h2 className="font-bold text-lg">选择就诊门店</h2>
              </div>
              <div className="p-4 space-y-3">
                <div onClick={() => navigateTo("appointment")} className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 active:border-emerald-500 cursor-pointer flex gap-3">
                  <div className="w-24 h-20 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=200&h=200" className="w-full h-full object-cover" alt="store" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">惟爱视觉·上海海华医院</h3>
                      <div className="flex gap-1 mt-1.5">
                        <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">眼科门诊</span>
                        <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">医保定点</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400"><MapPin weight="fill" className="inline mr-1" />上海市嘉定区</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentPage === "appointment" && (
            <div className="h-full flex flex-col bg-white">
              <div className="bg-white px-4 py-3 border-b flex items-center gap-3 shrink-0">
                <ArrowLeft weight="bold" onClick={goBack} className="text-gray-600 p-2 cursor-pointer text-xl" />
                <div>
                  <h2 className="font-bold text-base">惟爱视觉·上海海华医院</h2>
                  <p className="text-xs text-gray-400">请选择就诊时间与医生</p>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                预约选择页面开发中...
              </div>
            </div>
          )}

          {currentPage === "family-group" && (
            <div className="min-h-full flex flex-col bg-gray-100">
              <div className="bg-white px-4 py-3 shadow-sm flex items-center justify-between z-10 sticky top-0">
                <ArrowLeft weight="bold" onClick={goBack} className="text-gray-600 p-2 cursor-pointer text-xl" />
                <h2 className="font-bold text-lg">我的家庭组</h2>
                <Plus weight="bold" className="text-emerald-600 p-2 cursor-pointer text-xl" onClick={() => showToast("添加家庭组")} />
              </div>
              <div className="p-4 space-y-4">
                <div onClick={() => navigateTo("family-group-detail")} className="bg-white rounded-xl p-4 shadow-sm border border-gray-50 flex items-center justify-between active:scale-[0.98] transition-transform cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
                      <HouseLine weight="fill" className="text-2xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                        温馨小家
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">3 位成员</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="bg-emerald-50 text-emerald-600 text-[10px] px-2 py-0.5 rounded font-medium border border-emerald-100">管理员</span>
                    <CaretRight weight="bold" className="text-gray-300" />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-50 flex items-center justify-between active:scale-[0.98] transition-transform cursor-pointer" onClick={() => showToast("详情开发中")}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                      <HouseLine weight="fill" className="text-2xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                        老家大院
                      </h3>
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
          )}

          {currentPage === "family-group-detail" && (
            <div className="min-h-full flex flex-col bg-gray-50">
              <div className="bg-white px-4 py-3 flex items-center gap-3 z-10 sticky top-0">
                <ArrowLeft weight="bold" onClick={goBack} className="text-gray-600 p-2 cursor-pointer text-xl" />
                <h2 className="font-bold text-lg flex-1 text-center pr-8">家庭组详情</h2>
              </div>
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
                        <h5 className="font-bold text-gray-800 text-sm">你 <span className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded ml-1 font-normal">我</span></h5>
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
          )}

          {currentPage === "my-appointments" && (
            <div className="min-h-full flex flex-col bg-gray-100">
              <div className="bg-white px-4 py-3 flex items-center gap-3 z-10 sticky top-0">
                <ArrowLeft weight="bold" onClick={goBack} className="text-gray-600 p-2 cursor-pointer text-xl" />
                <h2 className="font-bold text-lg flex-1 text-center pr-8">我的预约</h2>
              </div>
              <div className="bg-white px-4 pb-2 border-b border-gray-200 flex gap-4 sticky top-[52px] z-10">
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
                    <div className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded shrink-0 font-medium">
                      预约成功
                    </div>
                  </div>
                  <div className="flex gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-lg border border-emerald-100">
                      张
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-base">张志明 <span className="text-xs text-gray-400 font-normal ml-1">主任医师</span></h4>
                      <p className="text-xs text-gray-500 mt-0.5">惟爱视觉总院 眼科</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">就诊人：张三</p>
                    <button className="border border-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-full active:bg-gray-50 bg-white">
                      电子凭条
                    </button>
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
                      <h4 className="font-bold text-gray-800 text-base">李晓华 <span className="text-xs text-gray-400 font-normal ml-1">主任医师</span></h4>
                      <p className="text-xs text-gray-500 mt-0.5">海淀分院 眼科</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">就诊人：张三</p>
                    <button className="border border-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-full active:bg-gray-50 bg-white">
                      查看详情
                    </button>
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
                    <div className="border border-red-500 text-red-500 bg-red-50 text-xs px-2 py-0.5 rounded shrink-0 font-medium">
                      已取消
                    </div>
                  </div>
                  <div className="flex gap-3 mb-3 opacity-40">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-lg border border-emerald-100">
                      王
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-base">王大力 <span className="text-xs text-gray-400 font-normal ml-1">主任医师</span></h4>
                      <p className="text-xs text-gray-500 mt-0.5">惟爱视觉总院 眼科</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center opacity-40">
                    <p className="text-sm text-gray-600">就诊人：张三</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tab Bar */}
        {(currentPage === "home" || currentPage === "profile") && (
          <div className="bg-white border-t flex justify-between items-end px-2 pb-6 pt-2 z-40 shrink-0">
            <div onClick={() => { setCurrentTab("home"); navigateTo("home"); }} className={clsx("flex-1 flex flex-col items-center justify-center gap-1 cursor-pointer", currentTab === "home" ? "text-emerald-600" : "text-gray-400")}>
              <Eye weight="fill" className="text-xl" />
              <span className="text-[10px] font-medium">首页</span>
            </div>
            
            <div className="w-20 relative flex justify-center pointer-events-none">
              <div className="absolute -top-16 cursor-pointer pointer-events-auto" onClick={() => setIsQrCodeOpen(true)}>
                <div className="w-14 h-14 bg-emerald-500 rounded-full shadow-[0_4px_10px_rgba(16,185,129,0.4)] flex items-center justify-center text-white border-4 border-gray-50 transform transition-transform active:scale-95">
                  <QrCode weight="bold" className="text-2xl" />
                </div>
              </div>
            </div>

            <div onClick={() => { setCurrentTab("profile"); navigateTo("profile"); }} className={clsx("flex-1 flex flex-col items-center justify-center gap-1 cursor-pointer", currentTab === "profile" ? "text-emerald-600" : "text-gray-400")}>
              <User weight="fill" className="text-xl" />
              <span className="text-[10px] font-medium">个人中心</span>
            </div>
          </div>
        )}

        {/* Login Drawer */}
        {isLoginDrawerOpen && (
          <div className="absolute inset-0 z-[60]">
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsLoginDrawerOpen(false)}></div>
            <div className="absolute bottom-0 w-full bg-white rounded-t-2xl p-6 transform transition-transform duration-300 pb-10">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs">
                  <Eye weight="fill" />
                </div>
                <span className="font-bold text-sm text-gray-800">惟爱视觉门诊服务</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">申请获取并验证你的手机号</h3>
              <p className="text-sm text-gray-400 mb-8">账户登录使用</p>
              <div className="space-y-3">
                <button onClick={confirmLogin} className="w-full bg-white border border-gray-200 rounded-lg py-3 flex flex-col items-center justify-center active:bg-gray-50 relative">
                  <span className="text-lg font-bold text-gray-900">138****8888</span>
                  <span className="text-xs text-green-600 mt-1">上次提供</span>
                </button>
                <button onClick={() => setIsLoginDrawerOpen(false)} className="w-full bg-white border border-gray-200 rounded-lg py-4 text-gray-800 font-medium active:bg-gray-50">
                  不允许
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Modal */}
        {isQrCodeOpen && (
          <div className="absolute inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-8">
            <div className="bg-white w-full rounded-2xl p-6 flex flex-col items-center relative">
              <X weight="bold" onClick={() => setIsQrCodeOpen(false)} className="absolute top-4 right-4 text-gray-400 text-xl cursor-pointer" />
              <h3 className="font-bold text-lg mb-1">患者个人码</h3>
              <p className="text-xs text-gray-400 mb-6">出示给视光师进行快捷操作</p>
              <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <QrCode weight="fill" className="text-8xl text-gray-800" />
              </div>
              <p className="text-xs text-gray-400 text-center">每60秒自动刷新<br/>请勿截图分享给他人</p>
            </div>
          </div>
        )}

        {/* Toast */}
        {toastMsg && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm z-[100] whitespace-nowrap">
            {toastMsg}
          </div>
        )}
      </div>
    </div>
  );
}