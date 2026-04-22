import React, { useState } from "react";
import {
  Plus,
  PencilSimple,
  Trash,
  DoorOpen,
  X,
  Check,
  CaretDown,
  Question,
  Stethoscope,
  Eyeglasses,
  Eye,
  GameController,
} from "@phosphor-icons/react";
import clsx from "clsx";

type RoomType = "consultation" | "optometry" | "training";
type RoomStatus = "active" | "maintenance" | "deprecated";

interface Room {
  roomNo: string;
  name: string;
  func: string;
  type: RoomType;
  status: RoomStatus;
  capacity: number;
  desc: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

const initialRooms: Room[] = [
  { roomNo: "101", name: "专家门诊", func: "诊室", type: "consultation", status: "active", capacity: 2, desc: "配备裂隙灯、眼底镜，主任医师专用。", icon: Stethoscope, color: "text-blue-500", bg: "bg-blue-50" },
  { roomNo: "102", name: "普通门诊", func: "诊室", type: "consultation", status: "active", capacity: 1, desc: "日常复查与初诊。", icon: Stethoscope, color: "text-indigo-500", bg: "bg-indigo-50" },
  { roomNo: "验光室 1", name: "综合验光", func: "验光室", type: "optometry", status: "maintenance", capacity: 2, desc: "配备综合验光仪、电脑验光仪。", icon: Eyeglasses, color: "text-primary-500", bg: "bg-primary-50" },
  { roomNo: "验光室 2", name: "角塑验配", func: "验光室", type: "optometry", status: "active", capacity: 2, desc: "配备角膜地形图仪。", icon: Eye, color: "text-teal-500", bg: "bg-teal-50" },
  { roomNo: "训练室", name: "视功能训练", func: "训练室", type: "training", status: "deprecated", capacity: 1, desc: "配备各类弱视、调节训练设备。", icon: GameController, color: "text-purple-500", bg: "bg-purple-50" },
];

export default function Room() {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [filter, setFilter] = useState<"all" | RoomType>("all");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingRoomNo, setEditingRoomNo] = useState<string | null>(null);
  const [deletingRoomNo, setDeletingRoomNo] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    roomNo: "",
    name: "",
    func: "诊室",
    capacity: 1,
    status: "启用中",
    desc: "",
  });

  const filteredRooms = filter === "all" ? rooms : rooms.filter((r) => r.type === filter);

  const getStatusMeta = (status: RoomStatus) => {
    if (status === "maintenance") return { text: "维修中", dot: "bg-amber-500", pulse: false };
    if (status === "deprecated") return { text: "已废弃", dot: "bg-gray-400", pulse: false };
    return { text: "启用中", dot: "bg-green-500", pulse: true };
  };

  const openDrawer = (roomNo?: string) => {
    if (roomNo) {
      const target = rooms.find((r) => r.roomNo === roomNo);
      if (target) {
        setEditingRoomNo(roomNo);
        setFormData({
          roomNo: target.roomNo,
          name: target.name,
          func: target.func,
          capacity: target.capacity,
          status: target.status === "maintenance" ? "维修中" : target.status === "deprecated" ? "已废弃" : "启用中",
          desc: target.desc,
        });
      }
    } else {
      setEditingRoomNo(null);
      setFormData({
        roomNo: "",
        name: "",
        func: "诊室",
        capacity: 1,
        status: "启用中",
        desc: "",
      });
    }
    setIsDrawerOpen(true);
  };

  const handleSave = () => {
    if (!formData.roomNo || !formData.name) return;

    let type: RoomType = "consultation";
    let icon = Stethoscope;
    let color = "text-blue-500";
    let bg = "bg-blue-50";

    if (formData.func === "验光室") {
      type = "optometry";
      icon = Eyeglasses;
      color = "text-primary-500";
      bg = "bg-primary-50";
    } else if (formData.func === "训练室") {
      type = "training";
      icon = GameController;
      color = "text-purple-500";
      bg = "bg-purple-50";
    }

    const newRoom: Room = {
      roomNo: formData.roomNo,
      name: formData.name,
      func: formData.func,
      type,
      status: formData.status === "维修中" ? "maintenance" : formData.status === "已废弃" ? "deprecated" : "active",
      capacity: formData.capacity,
      desc: formData.desc,
      icon,
      color,
      bg,
    };

    if (editingRoomNo) {
      setRooms(rooms.map((r) => (r.roomNo === editingRoomNo ? newRoom : r)));
    } else {
      setRooms([newRoom, ...rooms]);
    }
    setIsDrawerOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deletingRoomNo) {
      setRooms(rooms.filter((r) => r.roomNo !== deletingRoomNo));
    }
    setIsDeleteModalOpen(false);
    setDeletingRoomNo(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
          {[
            { id: "all", label: "全部" },
            { id: "consultation", label: "诊室" },
            { id: "optometry", label: "验光室" },
            { id: "training", label: "训练室" },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id as any)}
              className={clsx(
                "px-4 py-1.5 rounded-md text-sm transition-all",
                filter === btn.id
                  ? "bg-primary-500 font-semibold text-white"
                  : "font-medium text-gray-600 hover:text-primary-600"
              )}
            >
              {btn.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => openDrawer()}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium shadow-sm flex items-center"
        >
          <Plus weight="bold" className="mr-2" /> 新增诊室
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredRooms.map((r) => {
            const statusMeta = getStatusMeta(r.status);
            const Icon = r.icon;
            return (
              <div
                key={r.roomNo}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow group relative flex flex-col gap-4"
              >
                <div className="absolute top-3 right-3 flex items-center rounded-lg bg-white/95 border border-gray-100 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openDrawer(r.roomNo)}
                    className="px-2.5 py-1.5 text-gray-400 hover:text-primary-600 transition"
                  >
                    <PencilSimple weight="bold" />
                  </button>
                  <span className="w-px h-4 bg-gray-200"></span>
                  <button
                    onClick={() => {
                      setDeletingRoomNo(r.roomNo);
                      setIsDeleteModalOpen(true);
                    }}
                    className="px-2.5 py-1.5 text-red-400 hover:text-red-600 transition"
                  >
                    <Trash weight="bold" />
                  </button>
                </div>
                <div className="flex items-start gap-3 pr-10">
                  <div
                    className={clsx(
                      "w-16 h-16 rounded-xl flex items-center justify-center text-2xl shrink-0",
                      r.bg,
                      r.color
                    )}
                  >
                    <Icon weight="fill" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-gray-800 truncate">{r.name}</h3>
                      {statusMeta.pulse ? (
                        <span className="relative flex w-2.5 h-2.5">
                          <span
                            className={clsx(
                              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-50",
                              statusMeta.dot
                            )}
                          ></span>
                          <span
                            className={clsx(
                              "relative inline-flex rounded-full h-2.5 w-2.5",
                              statusMeta.dot
                            )}
                          ></span>
                        </span>
                      ) : (
                        <span
                          className={clsx(
                            "inline-flex w-2.5 h-2.5 rounded-full",
                            statusMeta.dot
                          )}
                        ></span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary-50 text-primary-600 text-xs font-bold border border-primary-100">
                        {r.roomNo}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-orange-100 text-orange-600 text-xs font-bold border border-orange-200">
                        {r.capacity}人
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-bold border border-gray-200">
                        {r.func}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">{r.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drawer */}
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
            <DoorOpen weight="duotone" className="text-primary-600" />
            {editingRoomNo ? "编辑诊室信息" : "新增诊室信息"}
          </h2>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition"
          >
            <X weight="bold" className="text-lg" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-white space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              门牌号 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.roomNo}
              onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition bg-gray-50/50 focus:bg-white"
              placeholder="例如：101"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              诊室名称{" "}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition bg-gray-50/50 focus:bg-white"
              placeholder="例如：专家门诊"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">类型</label>
              <div className="relative">
                <select
                  value={formData.func}
                  onChange={(e) => setFormData({ ...formData, func: e.target.value })}
                  className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none bg-gray-50/50 focus:bg-white transition pr-8"
                >
                  <option>诊室</option>
                  <option>验光室</option>
                  <option>训练室</option>
                </select>
                <CaretDown weight="bold" className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                容量
                <div className="group relative">
                  <Question weight="fill" className="text-gray-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition pointer-events-none z-10 text-center">
                    指同时可以容纳多少医护人员工作（不包含患者）
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </label>
              <input
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) || 1 })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition bg-gray-50/50 focus:bg-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">诊室状态</label>
            <div className="relative">
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none bg-gray-50/50 focus:bg-white transition pr-8"
              >
                <option>启用中</option>
                <option>维修中</option>
                <option>已废弃</option>
              </select>
              <CaretDown weight="bold" className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">功能描述</label>
            <textarea
              value={formData.desc}
              onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition bg-gray-50/50 focus:bg-white resize-none"
              rows={4}
              placeholder="请输入诊室设备配置或主要用途..."
            ></textarea>
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
            onClick={handleSave}
            className="px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 shadow-sm hover:shadow-md text-sm font-medium transition flex items-center gap-2"
          >
            <Check weight="bold" /> 保存信息
          </button>
        </div>
      </div>

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[80] bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <div className="w-[360px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">确认删除诊室</h3>
            </div>
            <div className="px-5 py-4 text-sm text-gray-600">
              <p>删除后无法恢复，是否继续？</p>
            </div>
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-white transition"
              >
                取消
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
