import { useMemo, useState } from "react";
import { QrCode, X } from "@phosphor-icons/react";
import clsx from "clsx";
import { Outlet, useLocation, useNavigate } from "react-router";
import { MiniprogramProvider, useMiniprogramApp } from "./context";
import { MiniTabBar } from "./ui";

function MiniprogramLayoutInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toastMsg } = useMiniprogramApp();
  const [isQrCodeOpen, setIsQrCodeOpen] = useState(false);

  const showTabBar = useMemo(() => {
    const pathname = location.pathname;
    return !pathname.startsWith("/miniprogram/login") && !pathname.startsWith("/miniprogram/archive/new");
  }, [location.pathname]);

  const activeTab = useMemo<"home" | "profile">(() => {
    const pathname = location.pathname;
    if (
      pathname.startsWith("/miniprogram/profile") ||
      pathname.startsWith("/miniprogram/patients") ||
      pathname.startsWith("/miniprogram/family-groups") ||
      pathname.startsWith("/miniprogram/my-appointments")
    ) {
      return "profile";
    }
    return "home";
  }, [location.pathname]);

  return (
    <div className="bg-gray-200 h-screen w-screen flex justify-center items-center font-sans">
      <div className="w-full h-full sm:w-[375px] sm:h-[812px] bg-gray-50 flex flex-col relative sm:rounded-[40px] sm:border-[14px] border-gray-900 sm:shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[25px] bg-gray-900 rounded-b-xl z-50 hidden sm:block"></div>
        <div className="h-12 w-full bg-white flex justify-between items-end px-6 pb-2 text-xs font-bold text-gray-800 z-20 shadow-sm relative">
          <span>9:41</span>
          <div className="flex gap-1">
            <span className="text-[10px]">5G</span>
            <span className="text-[10px]">100%</span>
          </div>
        </div>

        <div className={clsx("flex-1 overflow-y-auto relative bg-gray-50 no-scrollbar", showTabBar && "pb-[78px]")}>
          <Outlet />
        </div>

        {showTabBar && (
          <MiniTabBar
            active={activeTab}
            onChange={(t) => {
              navigate({
                pathname: t === "home" ? "/miniprogram/home" : "/miniprogram/profile",
                search: location.search,
              });
            }}
            onCenter={() => setIsQrCodeOpen(true)}
          />
        )}

        {isQrCodeOpen && (
          <div className="absolute inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-8">
            <div className="bg-white w-full rounded-2xl p-6 flex flex-col items-center relative">
              <X
                weight="bold"
                onClick={() => setIsQrCodeOpen(false)}
                className="absolute top-4 right-4 text-gray-400 text-xl cursor-pointer"
              />
              <h3 className="font-bold text-lg mb-1">患者个人码</h3>
              <p className="text-xs text-gray-400 mb-6">出示给视光师进行快捷操作</p>
              <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <QrCode weight="fill" className="text-8xl text-gray-800" />
              </div>
              <p className="text-xs text-gray-400 text-center">
                每60秒自动刷新
                <br />
                请勿截图分享给他人
              </p>
            </div>
          </div>
        )}

        {toastMsg && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm z-[100] whitespace-nowrap">
            {toastMsg}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MiniprogramLayout() {
  return (
    <MiniprogramProvider>
      <MiniprogramLayoutInner />
    </MiniprogramProvider>
  );
}

