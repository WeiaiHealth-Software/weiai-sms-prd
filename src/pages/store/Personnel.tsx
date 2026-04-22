import React, { useState } from "react";
import {
  MagnifyingGlass,
  Plus,
  Circle,
  UserPlus,
  X,
  Camera,
  Check,
  CaretDown,
} from "@phosphor-icons/react";
import clsx from "clsx";

const STAFF = [
  { id: "d2", name: "王医生", age: 38, role: "医生", defaultCap: 3, title: "主任医师", desc: "成人斜弱视、近视防控", status: "active", joinDate: "2015-08-20", color: "bg-blue-500", isWorking: true },
  { id: "d1", name: "李主任", age: 45, role: "医生", defaultCap: 2, title: "副主任医师", desc: "小儿斜弱视、近视防控", status: "active", joinDate: "2018-05-12", color: "bg-orange-500", isWorking: true },
  { id: "o1", name: "张视光", age: 28, role: "视光师", defaultCap: 5, title: "高级验光员", desc: "角膜塑形镜验配、双眼视功能异常处理", status: "active", joinDate: "2021-03-01", color: "bg-emerald-500", isWorking: false },
  { id: "t1", name: "王视训", age: 26, role: "视训师", defaultCap: 5, title: "初级视训师", desc: "弱视训练、调节功能训练", status: "active", joinDate: "2022-07-15", color: "bg-teal-500", isWorking: false },
  { id: "f1", name: "赵前台", age: 24, role: "前台", defaultCap: null, title: "接待专员", desc: "客户接待、分诊引导", status: "resigned", joinDate: "2020-01-10", resignDate: "2023-09-01", color: "bg-amber-500", isWorking: false },
  { id: "r1", name: "小美", age: 28, role: "客服", defaultCap: null, title: "客户服务专员", desc: "客户咨询、问题解决", status: "active", joinDate: "2023-01-01", color: "bg-amber-500", isWorking: false },
  { id: "s1", name: "大强", age: 32, role: "销售", defaultCap: null, title: "销售代表", desc: "客户销售、业务管理", status: "active", joinDate: "2022-05-20", color: "bg-purple-500", isWorking: true },
];

export default function Personnel() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [nameInput, setNameInput] = useState("李主任");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* 顶部操作栏 */}
      <div className="flex justify-between items-center mb-2 shrink-0">
        <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm flex space-x-2">
          <div className="max-w-xs relative">
            <MagnifyingGlass weight="bold" className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索姓名/职称..."
              className="w-64 pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 transition"
            />
          </div>
          <select className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary-500 text-gray-600 bg-white">
            <option value="">全部角色</option>
            <option value="doctor">医生</option>
            <option value="optometrist">视光师</option>
            <option value="trainer">视训师</option>
            <option value="receptionist">前台</option>
            <option value="sales">销售</option>
          </select>
          <select className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary-500 text-gray-600 bg-white">
            <option value="active">在职</option>
            <option value="resigned">已离职</option>
          </select>
        </div>

        <button
          onClick={() => setIsDrawerOpen(true)}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium shadow-sm flex items-center"
        >
          <Plus weight="bold" className="mr-2" /> 录入人员
        </button>
      </div>

      {/* 表格区 */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col flex-1">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
              <tr>
                <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">人员信息</th>
                <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">角色 / 职称</th>
                <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">擅长描述</th>
                <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">状态 / 时间</th>
                <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {STAFF.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="py-3 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div
                          className={clsx(
                            "w-10 h-10 rounded-full text-white flex items-center justify-center font-bold shadow-sm",
                            s.color,
                            s.isWorking ? "ring-2 ring-offset-2 ring-green-500" : ""
                          )}
                        >
                          {s.name.charAt(0)}
                        </div>
                        {s.isWorking && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                          {s.name}
                          <span className="text-xs font-normal text-slate-400">{s.age}岁</span>
                        </div>
                        {s.isWorking && (
                          <div className="text-[10px] text-green-600 font-medium flex items-center gap-1 mt-0.5">
                            <Circle weight="fill" className="text-[6px]" /> 接诊中
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <div className="text-sm font-bold text-slate-700">{s.role}</div>
                    <div className="text-xs text-slate-500">{s.title}</div>
                  </td>
                  <td className="py-3 px-6">
                    <div className="text-sm text-slate-600 max-w-xs truncate" title={s.desc}>
                      {s.desc}
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    {s.status === "active" ? (
                      <>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">在职</span>
                        <div className="text-xs text-slate-400 mt-1">入职: {s.joinDate}</div>
                      </>
                    ) : (
                      <>
                        <span className="px-2 py-1 bg-slate-200 text-slate-500 rounded text-xs font-bold">已离职</span>
                        <div className="text-xs text-slate-400 mt-1">离职: {s.resignDate}</div>
                      </>
                    )}
                  </td>
                  <td className="py-3 px-6 text-right">
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-medium mr-3">编辑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 人员管理抽屉 */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-[60] backdrop-blur-sm"
          onClick={() => setIsDrawerOpen(false)}
        ></div>
      )}
      <div
        className={clsx(
          "fixed top-0 right-0 h-full w-[500px] bg-white shadow-2xl z-[70] transform transition-transform duration-300 flex flex-col",
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <UserPlus weight="duotone" className="text-primary-600" /> 录入人员信息
          </h2>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition"
          >
            <X weight="bold" className="text-lg" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-white space-y-6">
          {/* 顶部头像与基础信息区 */}
          <div className="flex gap-6">
            {/* 左侧：头像上传 */}
            <div className="w-1/3 flex flex-col items-center">
              <label className="relative group cursor-pointer w-24 h-24 block">
                <div className="w-full h-full rounded-full bg-primary-500 text-white flex items-center justify-center text-3xl font-bold border-4 border-white shadow-md overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:scale-105">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    nameInput ? nameInput.charAt(0) : <Camera weight="bold" />
                  )}
                </div>
                <div className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md border border-gray-100 group-hover:bg-primary-50 transition-colors">
                  <Camera weight="bold" className="text-primary-500 text-lg" />
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
              </label>
              <p className="text-xs text-gray-400 mt-3 text-center">点击上传头像<br />默认使用姓名首字</p>
            </div>

            {/* 右侧：姓名与年龄 */}
            <div className="w-2/3 flex flex-col justify-center gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">姓名 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition bg-gray-50/50 focus:bg-white"
                  placeholder="请输入姓名"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">年龄</label>
                <input
                  type="number"
                  defaultValue="45"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition bg-gray-50/50 focus:bg-white"
                  placeholder="请输入年龄"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">角色</label>
              <div className="relative">
                <select className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none bg-gray-50/50 focus:bg-white transition pr-8">
                  <option defaultValue="医生">医生</option>
                  <option>视光师</option>
                  <option>视训师</option>
                  <option>前台</option>
                </select>
                <CaretDown weight="bold" className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">职称</label>
              <input
                type="text"
                defaultValue="副主任医师"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition bg-gray-50/50 focus:bg-white"
                placeholder="请输入职称"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">擅长描述</label>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition bg-gray-50/50 focus:bg-white resize-none"
              rows={4}
              placeholder="请输入擅长领域描述..."
              defaultValue="小儿斜弱视、青少年近视防控"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">入职时间</label>
              <input
                type="date"
                defaultValue="2018-05-12"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition bg-gray-50/50 focus:bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">状态</label>
              <div className="relative">
                <select className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none bg-gray-50/50 focus:bg-white transition pr-8">
                  <option defaultValue="在职">在职</option>
                  <option>已离职</option>
                </select>
                <CaretDown weight="bold" className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-white hover:border-gray-300 hover:text-gray-900 text-sm font-medium transition shadow-sm"
          >
            取消
          </button>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 shadow-sm hover:shadow-md text-sm font-medium transition flex items-center gap-2"
          >
            <Check weight="bold" /> 保存信息
          </button>
        </div>
      </div>
    </div>
  );
}
