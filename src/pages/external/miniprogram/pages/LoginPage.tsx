import { useState } from "react";
import { Eye, Info, WechatLogo } from "@phosphor-icons/react";
import { useLocation, useNavigate } from "react-router";
import { useMiniprogramApp } from "../context";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setLoggedIn } = useMiniprogramApp();
  const [isLoginDrawerOpen, setIsLoginDrawerOpen] = useState(false);

  const confirmLogin = () => {
    setLoggedIn(true);
    setIsLoginDrawerOpen(false);
    navigate({ pathname: "/miniprogram/home", search: location.search }, { replace: true });
  };

  return (
    <>
      <div className="min-h-full flex flex-col items-center justify-center p-8 bg-white z-50 absolute inset-0">
        <div className="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center mb-6 text-emerald-600 shadow-sm">
          <Eye weight="fill" className="text-5xl" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">惟爱视觉</h1>
        <p className="text-slate-500 mb-12 text-sm">专业的视光门诊服务平台</p>

        <div className="w-full space-y-4">
          <button
            onClick={() => setIsLoginDrawerOpen(true)}
            className="w-full bg-[#07C160] hover:bg-[#06ad56] text-white py-3.5 rounded-xl font-medium shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <WechatLogo weight="fill" className="text-xl" />
            微信用户一键登录
          </button>
          <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
            <Info weight="fill" className="text-slate-300" /> 为了提供完整的预约服务，我们需要获取您的公开信息
          </p>
        </div>

        <div className="absolute bottom-12 flex items-center gap-2 text-xs text-slate-500">
          <input
            type="checkbox"
            className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
          />
          <span>
            我已阅读并同意{" "}
            <a href="#" className="text-emerald-600 hover:underline">
              《用户协议》
            </a>{" "}
            与{" "}
            <a href="#" className="text-emerald-600 hover:underline">
              《隐私政策》
            </a>
          </span>
        </div>
      </div>

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
              <button
                onClick={confirmLogin}
                className="w-full bg-white border border-gray-200 rounded-lg py-3 flex flex-col items-center justify-center active:bg-gray-50 relative"
              >
                <span className="text-lg font-bold text-gray-900">138****8888</span>
                <span className="text-xs text-green-600 mt-1">上次提供</span>
              </button>
              <button
                onClick={() => setIsLoginDrawerOpen(false)}
                className="w-full bg-white border border-gray-200 rounded-lg py-4 text-gray-800 font-medium active:bg-gray-50"
              >
                不允许
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

