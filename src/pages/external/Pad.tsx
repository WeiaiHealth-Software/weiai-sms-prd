import { useState } from "react";
import { Eye, CaretLeft, UserCircle, SignOut, LockKey, Backspace, Plus, Users, DoorOpen, Desktop, ClipboardText, Play, HandCoins, ListBullets, IdentificationCard, FilePlus, Prescription, Stethoscope, Eyeglasses, Bell } from "@phosphor-icons/react";
import clsx from "clsx";

const ROLES = [
  { id: "all", label: "全部员工" },
  { id: "doctor", label: "医生" },
  { id: "optometrist", label: "视光师" },
  { id: "receptionist", label: "前台" },
  { id: "sales", label: "销售" },
];

const USERS = [
  { id: 1, name: "李主任", role: "doctor", title: "主任医师", avatar: "李", color: "bg-blue-500" },
  { id: 2, name: "王医生", role: "doctor", title: "主治医师", avatar: "王", color: "bg-blue-500" },
  { id: 3, name: "张视光", role: "optometrist", title: "高级视光师", avatar: "张", color: "bg-emerald-500" },
  { id: 4, name: "赵视光", role: "optometrist", title: "初级视光师", avatar: "赵", color: "bg-emerald-500" },
  { id: 5, name: "小美", role: "receptionist", title: "前台主管", avatar: "美", color: "bg-amber-500" },
  { id: 6, name: "大强", role: "sales", title: "资深顾问", avatar: "强", color: "bg-purple-500" },
];

export default function Pad() {
  const [currentScreen, setCurrentScreen] = useState<"home" | "login" | "dashboard">("home");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [pin, setPin] = useState("");
  const [loggedInUser, setLoggedInUser] = useState<any>(null);

  const filteredUsers = selectedRole === "all" ? USERS : USERS.filter((u) => u.role === selectedRole);

  const handlePinInput = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        setTimeout(() => {
          setLoggedInUser(selectedUser);
          setCurrentScreen("dashboard");
          setPin("");
        }, 200);
      }
    }
  };

  const handleDeletePin = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  };

  const logout = () => {
    setLoggedInUser(null);
    setSelectedUser(null);
    setPin("");
    setCurrentScreen("home");
  };

  const getRoleName = (role: string) => {
    const roleNames: Record<string, string> = {
      doctor: "医生工作台",
      optometrist: "视光师工作台",
      receptionist: "前台工作台",
      sales: "销售工作台",
    };
    return roleNames[role] || "工作台";
  };

  return (
    <div className="font-sans antialiased text-slate-800 bg-slate-50 overflow-hidden select-none h-screen w-screen relative">
      {/* 1. 首页 (Home Screen) */}
      <div
        className={clsx(
          "absolute inset-0 flex flex-col items-center justify-center h-screen bg-emerald-50 transition-opacity duration-300 z-10",
          currentScreen === "home" ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-emerald-100">
            <Eye weight="fill" className="text-5xl text-emerald-500" />
          </div>
          <h1 className="text-5xl font-light tracking-wider text-slate-800">
            惟翎<span className="font-bold text-emerald-500 mx-1">·</span>门店管理系统
          </h1>
        </div>
        <p className="text-slate-500 mb-12 text-lg tracking-widest font-medium">
          WEILING STORE MANAGEMENT SYSTEM
        </p>

        <button
          onClick={() => setCurrentScreen("login")}
          className="group relative px-12 py-5 bg-emerald-500 hover:bg-emerald-600 transition-all duration-300 rounded-full text-2xl font-medium text-white shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center space-x-3 overflow-hidden"
        >
          <UserCircle weight="fill" className="relative z-10" />
          <span className="relative z-10">签到上班</span>
        </button>
      </div>

      {/* 2. 登录/签到页 (Login Screen) */}
      <div
        className={clsx(
          "absolute inset-0 flex h-screen bg-slate-50 z-20 transition-opacity duration-300",
          currentScreen === "login" ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        {/* 左侧：角色与员工选择 */}
        <div className="w-7/12 bg-white shadow-xl z-10 flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center space-x-4 shrink-0">
            <button
              onClick={() => setCurrentScreen("home")}
              className="p-3 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
            >
              <CaretLeft weight="bold" className="text-xl" />
            </button>
            <h2 className="text-2xl font-bold text-slate-800">选择签到账户</h2>
          </div>

          {/* 角色筛选区 */}
          <div className="px-6 py-4 flex space-x-3 overflow-x-auto border-b border-slate-50 no-scrollbar shrink-0">
            {ROLES.map((role) => (
              <button
                key={role.id}
                onClick={() => {
                  setSelectedRole(role.id);
                  setSelectedUser(null);
                  setPin("");
                }}
                className={clsx(
                  "px-6 py-3 rounded-full text-lg font-medium transition-colors whitespace-nowrap",
                  selectedRole === role.id
                    ? "bg-emerald-500 text-white shadow-md"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                {role.label}
              </button>
            ))}
          </div>

          {/* 员工列表区 */}
          <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
            <div className="grid grid-cols-2 gap-4 content-start">
              {filteredUsers.map((user) => {
                const isSelected = selectedUser && selectedUser.id === user.id;
                return (
                  <div
                    key={user.id}
                    onClick={() => {
                      setSelectedUser(user);
                      setPin("");
                    }}
                    className={clsx(
                      "p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center space-x-4",
                      isSelected
                        ? "border-emerald-500 bg-emerald-50 shadow-sm"
                        : "border-transparent bg-white shadow-sm hover:border-emerald-200"
                    )}
                  >
                    <div
                      className={clsx(
                        "w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white",
                        user.color
                      )}
                    >
                      {user.avatar}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">{user.name}</h3>
                      <p className="text-slate-500 text-sm mt-1">{user.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 右侧：密码验证区域 */}
        <div className="w-5/12 bg-emerald-50/30 flex flex-col items-center justify-center p-12 relative">
          {!selectedUser ? (
            <div className="text-center text-slate-400 flex flex-col items-center space-y-6 animate-[fadeIn_0.3s_ease-in-out]">
              <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center">
                <LockKey weight="fill" className="text-5xl text-slate-300" />
              </div>
              <p className="text-2xl font-light tracking-wide text-slate-500">
                请在左侧选择要登录的账户
              </p>
            </div>
          ) : (
            <div className="w-full max-w-sm flex flex-col items-center animate-[fadeIn_0.3s_ease-in-out]">
              <div
                className={clsx(
                  "w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold text-white mb-4 shadow-lg ring-4 ring-white",
                  selectedUser.color
                )}
              >
                {selectedUser.avatar}
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-1">{selectedUser.name}</h2>
              <p className="text-emerald-600 font-medium mb-10 bg-emerald-100 px-4 py-1 rounded-full text-sm">
                {selectedUser.title}
              </p>

              <p className="text-slate-500 mb-6 font-medium">请输入四位签到密码</p>

              <div className="flex space-x-6 mb-12">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={clsx(
                      "w-5 h-5 rounded-full transition-all duration-200",
                      pin.length > i ? "bg-emerald-500 scale-110 shadow-md" : "bg-slate-200"
                    )}
                  ></div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 w-full">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handlePinInput(num.toString())}
                    className="h-16 rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-700 text-2xl font-bold hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 active:bg-emerald-100 transition-all"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => handlePinInput("0")}
                  className="h-16 rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-700 text-2xl font-bold hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 active:bg-emerald-100 transition-all"
                >
                  0
                </button>
                <button
                  onClick={handleDeletePin}
                  className="col-span-2 h-16 rounded-2xl bg-red-500 shadow-sm border border-red-500 text-white flex items-center justify-center hover:bg-red-600 hover:border-red-600 active:bg-red-700 transition-all"
                >
                  <Backspace weight="fill" className="text-2xl" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. 专属工作台 (Dashboard Screen) */}
      <div
        className={clsx(
          "absolute inset-0 flex flex-col bg-slate-50 z-30 transition-opacity duration-300",
          currentScreen === "dashboard" ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center z-10 border-b border-slate-200 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <Eye weight="fill" className="text-white text-xl" />
            </div>
            <span className="text-xl font-bold text-slate-800">惟翎管理系统</span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-sm font-bold ml-4 border border-emerald-100">
              {loggedInUser ? getRoleName(loggedInUser.role) : ""}
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div
                className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg",
                  loggedInUser?.color || "bg-emerald-100 text-emerald-600"
                )}
              >
                {loggedInUser?.avatar}
              </div>
              <div>
                <p className="font-bold text-slate-800 leading-tight">
                  {loggedInUser?.name}
                </p>
                <p className="text-xs text-emerald-500 flex items-center mt-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span>{" "}
                  在线服务中
                </p>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-slate-500 hover:text-red-500 transition-colors px-4 py-2 rounded-lg hover:bg-red-50 font-medium"
            >
              <SignOut weight="bold" />
              <span>签出下班</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {loggedInUser?.role === "receptionist" && (
            <div className="grid grid-cols-3 gap-6 animate-[fadeIn_0.3s_ease-in-out]">
              <div className="col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-xl font-bold mb-4 flex items-center text-slate-800">
                    <ListBullets weight="bold" className="text-emerald-500 mr-3 text-2xl" />
                    今日预约总览
                  </h3>
                  <div className="h-64 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 font-medium">
                    预约列表与时间段余号展示区
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-xl font-bold mb-4 flex items-center text-slate-800">
                    <FilePlus weight="fill" className="text-emerald-500 mr-3 text-xl" />
                    现场代预约 / 建档
                  </h3>
                  <div className="h-40 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 font-medium">
                    扫码建档与快速排期表单区
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 shadow-sm">
                  <h3 className="text-lg font-bold text-amber-800 mb-4 flex items-center">
                    <Bell weight="fill" className="mr-2 animate-bounce" />实时弹窗提醒
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-amber-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded font-bold">线上预约</span>
                        <span className="text-xs text-slate-400">刚刚</span>
                      </div>
                      <p className="font-bold text-slate-800 mb-4">患者 张三 提交了初诊预约</p>
                      <button className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold transition-colors">
                        确认接诊
                      </button>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-lg font-bold mb-4 text-slate-800">快捷操作</h3>
                  <button className="w-full py-3.5 mb-3 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 border border-slate-200 hover:border-emerald-200 rounded-xl font-bold text-slate-600 transition-all flex justify-center items-center">
                    <Plus weight="bold" className="mr-2" />手动加号 (突破限制)
                  </button>
                  <button className="w-full py-3.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 border border-slate-200 hover:border-emerald-200 rounded-xl font-bold text-slate-600 transition-all flex justify-center items-center">
                    <Users weight="fill" className="mr-2" />家庭组管理
                  </button>
                </div>
              </div>
            </div>
          )}

          {loggedInUser?.role === "doctor" && (
            <div className="grid grid-cols-3 gap-6 animate-[fadeIn_0.3s_ease-in-out]">
              <div className="col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[calc(100vh-8rem)] overflow-y-auto">
                <h3 className="text-xl font-bold mb-6 flex items-center text-slate-800">
                  <ListBullets weight="bold" className="text-blue-500 mr-3 text-xl" />
                  今日接诊队列
                </h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border-2 border-blue-500 bg-blue-50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-slate-800 text-lg">
                          李四 <span className="text-sm font-normal text-blue-600 bg-blue-100 px-2 py-0.5 rounded ml-1">初诊</span>
                        </p>
                        <p className="text-sm text-slate-500 mt-2">10:00 - 10:30</p>
                      </div>
                      <button className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg font-medium">接诊中</button>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 cursor-pointer transition-colors">
                    <p className="font-bold text-slate-800 text-lg">
                      王五 <span className="text-sm font-normal text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded ml-1">复查</span>
                    </p>
                    <p className="text-sm text-slate-500 mt-2">10:30 - 11:00</p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 cursor-pointer transition-colors">
                    <p className="font-bold text-slate-800 text-lg">
                      赵六 <span className="text-sm font-normal text-amber-600 bg-amber-100 px-2 py-0.5 rounded ml-1">特需</span>
                    </p>
                    <p className="text-sm text-slate-500 mt-2">11:00 - 11:30</p>
                  </div>
                </div>
              </div>
              <div className="col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-xl font-bold mb-4 flex items-center text-slate-800">
                    <IdentificationCard weight="fill" className="text-blue-500 mr-3 text-xl" />
                    患者信息一屏展示
                  </h3>
                  <div className="h-64 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 font-medium">
                    姓名、既往病史、是否带镜、复查记录展示区
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-xl font-bold mb-4 flex items-center text-slate-800">
                    <FilePlus weight="fill" className="text-blue-500 mr-3 text-xl" />
                    一键开单
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <button className="h-28 bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-700 rounded-xl font-bold flex flex-col items-center justify-center transition-colors text-lg">
                      <Prescription weight="fill" className="text-2xl mb-2" /> 开具处方
                    </button>
                    <button className="h-28 bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-700 rounded-xl font-bold flex flex-col items-center justify-center transition-colors text-lg">
                      <Stethoscope weight="fill" className="text-2xl mb-2" /> 开检查单
                    </button>
                    <button className="h-28 bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-700 rounded-xl font-bold flex flex-col items-center justify-center transition-colors text-lg">
                      <Eyeglasses weight="fill" className="text-2xl mb-2" /> 开验光单
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loggedInUser?.role === "optometrist" && (
            <div className="grid grid-cols-2 gap-6 animate-[fadeIn_0.3s_ease-in-out] h-full">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                <div className="w-28 h-28 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                  <DoorOpen weight="fill" className="text-5xl text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">当前未占位诊室</h3>
                <p className="text-slate-500 mt-3 mb-8">
                  请选择您当前所在的诊室，系统将自动同步门口屏幕
                </p>

                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                  <button className="py-5 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-600 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all text-lg">
                    201 诊室
                  </button>
                  <button className="py-5 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-600 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all text-lg">
                    202 诊室
                  </button>
                  <button className="py-5 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-600 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all text-lg">
                    301 诊室
                  </button>
                  <button className="py-5 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-600 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all text-lg">
                    302 诊室
                  </button>
                </div>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                <h3 className="text-xl font-bold mb-6 flex items-center text-slate-800">
                  <Desktop weight="fill" className="text-emerald-500 mr-3 text-xl" />
                  验光操作台
                </h3>
                <div className="flex-1 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 space-y-6">
                  <ClipboardText weight="fill" className="text-6xl text-slate-200" />
                  <p className="font-medium">选择诊室后，点击下方按钮开始接诊</p>
                  <button className="px-10 py-4 bg-emerald-500 text-white rounded-full font-bold shadow-lg opacity-50 cursor-not-allowed text-lg flex items-center justify-center">
                    <Play weight="fill" className="mr-2" />开始接诊
                  </button>
                </div>
              </div>
            </div>
          )}

          {loggedInUser?.role === "sales" && (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col items-center justify-center text-slate-400 animate-[fadeIn_0.3s_ease-in-out]">
              <div className="w-32 h-32 bg-purple-50 rounded-full flex items-center justify-center mb-6">
                <HandCoins weight="fill" className="text-6xl text-purple-300" />
              </div>
              <p className="text-2xl font-bold text-slate-600 mb-3">销售面板占位</p>
              <p className="text-lg">客户档案查看 / 销售开单 / 回访记录</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}