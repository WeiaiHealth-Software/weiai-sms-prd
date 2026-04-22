import { useEffect, useState } from "react";
import { SpeakerHigh } from "@phosphor-icons/react";

export default function ScreenList() {
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("zh-CN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      setDateStr(
        now.toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "long",
          day: "numeric",
          weekday: "long",
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col p-6 lg:p-10 select-none bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 flex-none">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              惟
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              惟翎眼视光 · 上海旗舰店
            </h1>
            <p className="text-slate-500 text-lg mt-1">
              综合验光中心排队叫号系统
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-5xl font-bold font-mono text-slate-900">{timeStr}</p>
          <p className="text-slate-500 text-lg mt-1">{dateStr}</p>
        </div>
      </header>

      {/* Main Content: Rooms Grid */}
      <main className="flex-1 grid grid-cols-1 gap-5">
        {/* 诊室 1 */}
        <div className="bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] border border-slate-200 rounded-3xl p-6 flex items-center justify-between relative overflow-hidden group hover:shadow-lg transition cursor-pointer">
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-primary-500"></div>

          {/* 房间信息 & 医生 */}
          <div className="flex items-center gap-8 w-1/3 pl-2">
            <div className="flex flex-col items-center justify-center w-28 h-28 bg-slate-100 rounded-2xl border border-slate-200">
              <span className="text-slate-500 text-sm font-medium">诊室</span>
              <span className="text-5xl font-bold text-slate-900 mt-1">101</span>
            </div>
            <div className="flex items-center gap-4">
              <img
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm"
                src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="doctor"
              />
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">王主任</h2>
                <span className="bg-primary-50 text-primary-600 px-2 py-1 rounded-md text-sm font-bold border border-primary-100">
                  高级验光师
                </span>
              </div>
            </div>
          </div>

          {/* 正在就诊 (重点) */}
          <div className="flex-1 flex flex-col items-center justify-center border-l border-r border-slate-100 h-full px-8 bg-slate-50/50">
            <p className="text-primary-600 text-lg font-bold mb-1 animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite]">
              正在就诊
            </p>
            <div className="text-6xl font-bold text-slate-900 tracking-widest font-mono">
              A089
            </div>
            <p className="text-slate-500 text-xl mt-1">李*明</p>
          </div>

          {/* 候诊队列 */}
          <div className="w-1/3 pl-8 pr-2">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">
              候诊队列
            </p>
            <div className="flex gap-3">
              <div className="bg-white rounded-xl p-3 flex-1 text-center border border-slate-200 shadow-sm">
                <span className="block text-xl font-bold text-slate-900 mb-0.5">
                  A090
                </span>
                <span className="text-xs text-slate-500">张*</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 flex-1 text-center border border-slate-100">
                <span className="block text-xl font-bold text-slate-400 mb-0.5">
                  A091
                </span>
                <span className="text-xs text-slate-400">王*强</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 flex-1 text-center border border-slate-100">
                <span className="block text-xl font-bold text-slate-400 mb-0.5">
                  A092
                </span>
                <span className="text-xs text-slate-400">陈*</span>
              </div>
            </div>
          </div>
        </div>

        {/* 诊室 2 */}
        <div className="bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] border border-slate-200 rounded-3xl p-6 flex items-center justify-between relative overflow-hidden hover:shadow-lg transition cursor-pointer">
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-blue-500"></div>

          <div className="flex items-center gap-8 w-1/3 pl-2">
            <div className="flex flex-col items-center justify-center w-28 h-28 bg-slate-100 rounded-2xl border border-slate-200">
              <span className="text-slate-500 text-sm font-medium">诊室</span>
              <span className="text-5xl font-bold text-slate-900 mt-1">102</span>
            </div>
            <div className="flex items-center gap-4">
              <img
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm"
                src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="doctor"
              />
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">张医生</h2>
                <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-sm font-bold border border-blue-100">
                  资深视光师
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center border-l border-r border-slate-100 h-full px-8 bg-slate-50/50">
            <p className="text-blue-600 text-lg font-bold mb-1 animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite]">
              正在就诊
            </p>
            <div className="text-6xl font-bold text-slate-900 tracking-widest font-mono">
              B042
            </div>
            <p className="text-slate-500 text-xl mt-1">赵*敏</p>
          </div>

          <div className="w-1/3 pl-8 pr-2">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">
              候诊队列
            </p>
            <div className="flex gap-3">
              <div className="bg-white rounded-xl p-3 flex-1 text-center border border-slate-200 shadow-sm">
                <span className="block text-xl font-bold text-slate-900 mb-0.5">
                  B043
                </span>
                <span className="text-xs text-slate-500">刘*</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 flex-1 text-center border border-slate-100">
                <span className="block text-xl font-bold text-slate-400 mb-0.5">
                  B044
                </span>
                <span className="text-xs text-slate-400">孙*伟</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 flex-1 text-center border border-slate-100 opacity-50">
                <span className="block text-xl font-bold text-slate-400 mb-0.5">
                  --
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 诊室 3 */}
        <div className="bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] border border-slate-200 rounded-3xl p-6 flex items-center justify-between relative overflow-hidden hover:shadow-lg transition cursor-pointer">
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-purple-500"></div>

          <div className="flex items-center gap-8 w-1/3 pl-2">
            <div className="flex flex-col items-center justify-center w-28 h-28 bg-slate-100 rounded-2xl border border-slate-200">
              <span className="text-slate-500 text-sm font-medium">诊室</span>
              <span className="text-5xl font-bold text-slate-900 mt-1">103</span>
            </div>
            <div className="flex items-center gap-4">
              <img
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm"
                src="https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="doctor"
              />
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">刘医生</h2>
                <span className="bg-purple-50 text-purple-600 px-2 py-1 rounded-md text-sm font-bold border border-purple-100">
                  配镜顾问
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center border-l border-r border-slate-100 h-full px-8 bg-slate-50/50">
            <p className="text-purple-600 text-lg font-bold mb-1">正在呼叫</p>
            <div className="text-6xl font-bold text-slate-900 tracking-widest font-mono animate-bounce">
              C015
            </div>
            <p className="text-slate-500 text-xl mt-1">周*杰</p>
          </div>

          <div className="w-1/3 pl-8 pr-2">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">
              候诊队列
            </p>
            <div className="flex gap-3">
              <div className="bg-white rounded-xl p-3 flex-1 text-center border border-slate-200 shadow-sm">
                <span className="block text-xl font-bold text-slate-900 mb-0.5">
                  C016
                </span>
                <span className="text-xs text-slate-500">吴*</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 flex-1 text-center border border-slate-100 opacity-50">
                <span className="block text-xl font-bold text-slate-400 mb-0.5">
                  --
                </span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 flex-1 text-center border border-slate-100 opacity-50">
                <span className="block text-xl font-bold text-slate-400 mb-0.5">
                  --
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 flex-none border-t border-slate-200 pt-6 flex justify-between items-center text-slate-500 text-lg">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <SpeakerHigh weight="fill" className="text-2xl text-slate-400" />
            请留意语音广播
          </span>
          <span className="w-px h-6 bg-slate-300"></span>
          <span>过号请重新取号</span>
        </div>
        <div className="flex items-center gap-2">
          系统状态：
          <span className="text-green-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            在线
          </span>
        </div>
      </footer>
    </div>
  );
}