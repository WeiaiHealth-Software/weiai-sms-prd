import { useState, useEffect } from "react";
import {
  CalendarBlank,
  NotePencil,
  Sliders,
  Sun,
  CloudSun,
  Path,
  UsersThree,
  PencilRuler,
  Info,
  DoorOpen,
  X,
} from "@phosphor-icons/react";
import clsx from "clsx";

// --- Types ---
type Period = "am" | "pm";
type Role = "doctor" | "optometrist" | "trainer" | "receptionist";

interface Staff {
  id: string;
  name: string;
  role: Role;
  roleName: string;
  defaultCap: number;
  color: string;
}

interface Room {
  id: string;
  name: string;
}

interface DaySchedule {
  am: string[];
  pm: string[];
  rooms: {
    am: Record<string, string>;
    pm: Record<string, string>;
  };
  slots: Record<string, Record<string, number>>;
}

// --- Mock Data ---
const MOCK_ROOMS: Room[] = [
  { id: "r1", name: "诊室 101" },
  { id: "r2", name: "诊室 102" },
  { id: "r3", name: "验光室 1" },
  { id: "r4", name: "验光室 2" },
  { id: "r5", name: "训练室" },
];

const MOCK_STAFF: Staff[] = [
  { id: "d1", name: "李主任", role: "doctor", roleName: "医生", defaultCap: 3, color: "bg-blue-500" },
  { id: "d2", name: "王医生", role: "doctor", roleName: "医生", defaultCap: 3, color: "bg-blue-500" },
  { id: "o1", name: "张视光", role: "optometrist", roleName: "视光师", defaultCap: 5, color: "bg-primary-500" },
  { id: "o2", name: "赵视光", role: "optometrist", roleName: "视光师", defaultCap: 5, color: "bg-primary-500" },
  { id: "t1", name: "王视训", role: "trainer", roleName: "视训师", defaultCap: 0, color: "bg-teal-500" },
  { id: "r1", name: "赵前台", role: "receptionist", roleName: "前台", defaultCap: 0, color: "bg-amber-500" },
];

// --- Helpers ---
const scheduleTimeToMins = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const scheduleMinsToTime = (m: number) => {
  return `${Math.floor(m / 60).toString().padStart(2, "0")}:${(m % 60).toString().padStart(2, "0")}`;
};

export default function Schedule() {
  const [settings, setSettings] = useState({
    amStart: "08:00",
    amEnd: "12:00",
    pmStart: "13:00",
    pmEnd: "17:00",
    duration: 30,
  });

  const [dates, setDates] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState<string>("");
  const [scheduleData, setScheduleData] = useState<Record<string, DaySchedule>>({});

  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<"all" | "doctor" | "optometrist" | "other">("all");

  const [popoverState, setPopoverState] = useState<{
    visible: boolean;
    staffId: string;
    time: string;
    cap: number;
    top: number;
    left: number;
  }>({ visible: false, staffId: "", time: "", cap: 0, top: 0, left: 0 });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // --- Init ---
  useEffect(() => {
    const generatedDates = [];
    const initialData: Record<string, DaySchedule> = {};
    const today = new Date();
    const days = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const id = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      generatedDates.push({
        id,
        shortLabel: `${d.getMonth() + 1}.${d.getDate()}`,
        fullLabel: `${d.getMonth() + 1}月${d.getDate()}日`,
        day: i === 0 ? "今天" : days[d.getDay()],
      });
      initialData[id] = { am: [], pm: [], rooms: { am: {}, pm: {} }, slots: {} };
    }

    const todayId = generatedDates[0].id;
    // initial mock data
    initialData[todayId].am.push("d1", "o1", "r1");
    initialData[todayId].pm.push("d1");
    initialData[todayId].rooms.am["d1"] = "r1";
    initialData[todayId].rooms.am["o1"] = "r3";
    initialData[todayId].rooms.pm["d1"] = "r1";

    ["d1", "o1"].forEach((id) => {
      initialData[todayId].slots[id] = {};
      const staff = MOCK_STAFF.find((s) => s.id === id);
      if (!staff) return;
      let currAm = scheduleTimeToMins(settings.amStart);
      const endAm = scheduleTimeToMins(settings.amEnd);
      while (currAm < endAm) {
        initialData[todayId].slots[id][scheduleMinsToTime(currAm)] = staff.defaultCap;
        currAm += settings.duration;
      }
      if (id === "d1") {
        let currPm = scheduleTimeToMins(settings.pmStart);
        const endPm = scheduleTimeToMins(settings.pmEnd);
        while (currPm < endPm) {
          initialData[todayId].slots[id][scheduleMinsToTime(currPm)] = staff.defaultCap;
          currPm += settings.duration;
        }
      }
    });

    setDates(generatedDates);
    setCurrentDate(todayId);
    setScheduleData(initialData);
  }, []);

  const currentDayData = scheduleData[currentDate] || { am: [], pm: [], rooms: { am: {}, pm: {} }, slots: {} };
  const currentDateObj = dates.find((d) => d.id === currentDate);

  const toggleShift = (staffId: string, period: Period) => {
    setScheduleData((prev) => {
      const next = { ...prev };
      const day = { ...next[currentDate] };
      const isWorking = !day[period].includes(staffId);

      day[period] = isWorking ? [...day[period], staffId] : day[period].filter((id) => id !== staffId);

      if (!isWorking) {
        const newRooms = { ...day.rooms[period] };
        delete newRooms[staffId];
        day.rooms = { ...day.rooms, [period]: newRooms };
      }

      const staff = MOCK_STAFF.find((s) => s.id === staffId);
      if (staff && (staff.role === "doctor" || staff.role === "optometrist")) {
        day.slots = { ...day.slots };
        if (isWorking) {
          if (!day.slots[staffId]) day.slots[staffId] = {};
          let curr = scheduleTimeToMins(period === "am" ? settings.amStart : settings.pmStart);
          const end = scheduleTimeToMins(period === "am" ? settings.amEnd : settings.pmEnd);
          while (curr < end) {
            const t = scheduleMinsToTime(curr);
            if (day.slots[staffId][t] === undefined) {
              day.slots[staffId][t] = staff.defaultCap;
            }
            curr += settings.duration;
          }
        } else {
          if (!day.am.includes(staffId) && !day.pm.includes(staffId)) {
            delete day.slots[staffId];
          } else {
            let curr = scheduleTimeToMins(period === "am" ? settings.amStart : settings.pmStart);
            const end = scheduleTimeToMins(period === "am" ? settings.amEnd : settings.pmEnd);
            while (curr < end) {
              delete day.slots[staffId][scheduleMinsToTime(curr)];
              curr += settings.duration;
            }
          }
        }
      }
      next[currentDate] = day;
      return next;
    });
  };

  const setRoom = (staffId: string, period: Period, roomId: string) => {
    setScheduleData((prev) => {
      const next = { ...prev };
      const day = { ...next[currentDate] };
      const newRooms = { ...day.rooms[period] };
      if (roomId) newRooms[staffId] = roomId;
      else delete newRooms[staffId];
      day.rooms = { ...day.rooms, [period]: newRooms };
      next[currentDate] = day;
      return next;
    });
  };

  const savePopover = () => {
    setScheduleData((prev) => {
      const next = { ...prev };
      const day = { ...next[currentDate] };
      day.slots = { ...day.slots };
      if (!day.slots[popoverState.staffId]) day.slots[popoverState.staffId] = {};
      day.slots[popoverState.staffId][popoverState.time] = popoverState.cap;
      next[currentDate] = day;
      return next;
    });
    setPopoverState({ ...popoverState, visible: false });
  };

  const getTimes = (period: Period) => {
    const res = [];
    let curr = scheduleTimeToMins(period === "am" ? settings.amStart : settings.pmStart);
    const end = scheduleTimeToMins(period === "am" ? settings.amEnd : settings.pmEnd);
    while (curr < end) {
      res.push(scheduleMinsToTime(curr));
      curr += settings.duration;
    }
    return res;
  };

  const timesAm = getTimes("am");
  const timesPm = getTimes("pm");

  if (!currentDate) return null;

  return (
    <div className="h-full flex flex-col relative">
      {/* Top Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex justify-between items-center shrink-0 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
              <CalendarBlank weight="bold" className="text-lg" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">排班与诊室分配</h3>
          </div>
          <div className="h-6 w-px bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-gray-900">{currentDateObj?.fullLabel} 排班详情</h2>
            {currentDayData.am.length || currentDayData.pm.length ? (
              <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">已排班</span>
            ) : (
              <span className="px-2.5 py-1 bg-gray-200 text-gray-500 rounded text-xs font-bold">未排班</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditDrawerOpen(true)}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium shadow-sm shadow-primary-500/20 flex items-center"
          >
            <NotePencil weight="bold" className="mr-2" /> 编辑排班
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-primary-600 transition-colors text-sm font-medium flex items-center shadow-sm"
          >
            <Sliders weight="bold" className="mr-2" /> 排班设置
          </button>
        </div>
      </div>

      {/* Date Strip */}
      <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 shrink-0 mb-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {dates.map((d, i) => (
            <div
              key={d.id}
              onClick={() => setCurrentDate(d.id)}
              className={clsx(
                "flex-1 min-w-[70px] py-2 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all",
                i === 0 && "font-bold text-primary-600 border-primary-600",
                d.id === currentDate
                  ? "bg-primary-600 text-white border border-primary-600 shadow-md scale-105"
                  : "bg-white text-gray-600 border border-gray-200"
              )}
            >
              <span
                className={clsx(
                  "text-[10px]",
                  i === 0 && "text-primary-600",
                  d.id === currentDate ? "text-primary-100" : "text-gray-400"
                )}
              >
                {d.day}
              </span>
              <span className="text-sm font-bold">{d.shortLabel}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main View */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Left Column */}
          <div className="w-1/3 flex flex-col gap-4">
            <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col overflow-hidden">
              <div className="flex justify-between items-center mb-4 shrink-0 border-b border-gray-100 pb-3">
                <span className="font-bold text-gray-700 flex items-center">
                  <Sun weight="bold" className="text-amber-500 mr-2" />
                  上午班
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {settings.amStart}-{settings.amEnd}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
                {currentDayData.am.length === 0 ? (
                  <div className="text-center text-sm text-gray-400 py-4">暂未配置</div>
                ) : (
                  currentDayData.am.map((id) => {
                    const staff = MOCK_STAFF.find((s) => s.id === id);
                    const room = MOCK_ROOMS.find((r) => r.id === currentDayData.rooms.am[id]);
                    if (!staff) return null;
                    return (
                      <div key={id} className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-100 rounded-xl hover:bg-white transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={clsx("w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-bold shadow-sm", staff.color)}>
                            {staff.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-700">{staff.name}</div>
                            <div className="text-[10px] text-gray-400">{staff.roleName}</div>
                          </div>
                        </div>
                        <div>
                          {room ? (
                            <span className="px-2 py-0.5 bg-primary-50 text-primary-600 rounded text-[10px] font-bold border border-primary-200 flex items-center">
                              <DoorOpen weight="bold" className="mr-1" />
                              {room.name}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded text-[10px] font-bold border border-gray-200">
                              未分配
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col overflow-hidden">
              <div className="flex justify-between items-center mb-4 shrink-0 border-b border-gray-100 pb-3">
                <span className="font-bold text-gray-700 flex items-center">
                  <CloudSun weight="bold" className="text-orange-400 mr-2" />
                  下午班
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {settings.pmStart}-{settings.pmEnd}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
                {currentDayData.pm.length === 0 ? (
                  <div className="text-center text-sm text-gray-400 py-4">暂未配置</div>
                ) : (
                  currentDayData.pm.map((id) => {
                    const staff = MOCK_STAFF.find((s) => s.id === id);
                    const room = MOCK_ROOMS.find((r) => r.id === currentDayData.rooms.pm[id]);
                    if (!staff) return null;
                    return (
                      <div key={id} className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-100 rounded-xl hover:bg-white transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={clsx("w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-bold shadow-sm", staff.color)}>
                            {staff.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-700">{staff.name}</div>
                            <div className="text-[10px] text-gray-400">{staff.roleName}</div>
                          </div>
                        </div>
                        <div>
                          {room ? (
                            <span className="px-2 py-0.5 bg-primary-50 text-primary-600 rounded text-[10px] font-bold border border-primary-200 flex items-center">
                              <DoorOpen weight="bold" className="mr-1" />
                              {room.name}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded text-[10px] font-bold border border-gray-200">
                              未分配
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Timeline */}
          <div className="w-2/3 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h4 className="font-bold text-gray-700 flex items-center">
                <Path weight="bold" className="text-primary-500 mr-2" />
                医生/视光师 号源时间轴
              </h4>
              <span className="text-xs text-gray-400">只读模式</span>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-6 no-scrollbar">
              {Array.from(new Set([...currentDayData.am, ...currentDayData.pm]))
                .filter((id) => {
                  const s = MOCK_STAFF.find((st) => st.id === id);
                  return s && (s.role === "doctor" || s.role === "optometrist");
                })
                .map((id) => {
                  const staff = MOCK_STAFF.find((s) => s.id === id)!;
                  const inAm = currentDayData.am.includes(id);
                  const inPm = currentDayData.pm.includes(id);

                  return (
                    <div key={id} className="flex items-center gap-3 bg-gray-50/70 p-2.5 rounded-2xl border border-gray-100">
                      <div className="w-16 shrink-0 flex flex-col items-center border-r border-gray-200 pr-2">
                        <div className={clsx("w-8 h-8 rounded-full text-white flex items-center justify-center text-sm font-bold mb-1", staff.color)}>
                          {staff.name.charAt(0)}
                        </div>
                        <span className="text-[10px] font-bold text-gray-700">{staff.name}</span>
                      </div>
                      <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar">
                        <span className="text-xs text-gray-500 font-bold shrink-0 w-8 text-right">上午</span>
                        {timesAm.map((time) => {
                          if (!inAm) {
                            return (
                              <div key={time} title="暂无排班" className="shrink-0 w-16 h-14 rounded-xl border bg-gray-100 border-gray-200 text-gray-400 flex flex-col items-center justify-center">
                                <span className="text-[10px] font-medium">{time}</span>
                                <span className="text-[11px] font-bold">未排班</span>
                              </div>
                            );
                          }
                          const cap = currentDayData.slots[id]?.[time];
                          if (cap === undefined) {
                            return (
                              <div key={time} className="shrink-0 w-16 h-14 rounded-xl border bg-gray-50 border-gray-200 text-gray-400 flex flex-col items-center justify-center">
                                <span className="text-[10px] font-medium">{time}</span>
                                <span className="text-[11px] font-bold">—</span>
                              </div>
                            );
                          }
                          return (
                            <div key={time} className={clsx("shrink-0 w-16 h-14 rounded-xl border flex flex-col items-center justify-center", cap > 0 ? "bg-primary-50 border-primary-200 text-primary-700" : "bg-gray-100 border-gray-200 text-gray-400")}>
                              <span className="text-[10px] font-medium">{time}</span>
                              <span className="text-sm font-bold">{cap === 0 ? "停诊" : `${cap}人`}</span>
                            </div>
                          );
                        })}
                        <div className="w-px h-14 bg-gray-200 shrink-0 mx-1"></div>
                        <span className="text-xs text-gray-500 font-bold shrink-0 w-8 text-right">下午</span>
                        {timesPm.map((time) => {
                          if (!inPm) {
                            return (
                              <div key={time} title="暂无排班" className="shrink-0 w-16 h-14 rounded-xl border bg-gray-100 border-gray-200 text-gray-400 flex flex-col items-center justify-center">
                                <span className="text-[10px] font-medium">{time}</span>
                                <span className="text-[11px] font-bold">未排班</span>
                              </div>
                            );
                          }
                          const cap = currentDayData.slots[id]?.[time];
                          if (cap === undefined) {
                            return (
                              <div key={time} className="shrink-0 w-16 h-14 rounded-xl border bg-gray-50 border-gray-200 text-gray-400 flex flex-col items-center justify-center">
                                <span className="text-[10px] font-medium">{time}</span>
                                <span className="text-[11px] font-bold">—</span>
                              </div>
                            );
                          }
                          return (
                            <div key={time} className={clsx("shrink-0 w-16 h-14 rounded-xl border flex flex-col items-center justify-center", cap > 0 ? "bg-primary-50 border-primary-200 text-primary-700" : "bg-gray-100 border-gray-200 text-gray-400")}>
                              <span className="text-[10px] font-medium">{time}</span>
                              <span className="text-sm font-bold">{cap === 0 ? "停诊" : `${cap}人`}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Drawer */}
      {isEditDrawerOpen && (
        <div className="fixed inset-0 bg-black/40 z-[75]">
          <div className="absolute inset-0" onClick={() => setIsEditDrawerOpen(false)}></div>
          <div className="absolute left-0 right-0 bottom-0 bg-white w-full h-[95vh] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col">
            <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-3xl shrink-0">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-primary-600">编辑 {currentDateObj?.fullLabel} 排班</h3>
                <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-500 shadow-sm">1:3 黄金比例布局</span>
              </div>
              <button onClick={() => setIsEditDrawerOpen(false)} className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium shadow-sm">
                完成编辑
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className="w-1/4 border-r border-gray-100 bg-gray-50/60 p-5 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-3 shrink-0">
                  <h4 className="font-bold text-gray-700 flex items-center">
                    <UsersThree weight="bold" className="text-primary-500 mr-2" /> 人员调度
                  </h4>
                </div>
                <div className="flex bg-gray-200/60 p-1 rounded-lg mb-4 shrink-0">
                  {[
                    { id: "all", label: "全部" },
                    { id: "doctor", label: "医生" },
                    { id: "optometrist", label: "视光师" },
                    { id: "other", label: "其他" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setRoleFilter(f.id as any)}
                      className={clsx(
                        "flex-1 py-1.5 text-xs rounded-md transition-all",
                        roleFilter === f.id ? "bg-white shadow-sm font-bold text-gray-700" : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1 pb-4">
                  {MOCK_STAFF.filter((s) => {
                    if (roleFilter === "all") return true;
                    if (roleFilter === "doctor") return s.role === "doctor";
                    if (roleFilter === "optometrist") return s.role === "optometrist";
                    return s.role !== "doctor" && s.role !== "optometrist";
                  }).map((staff) => {
                    const inAm = currentDayData.am.includes(staff.id);
                    const inPm = currentDayData.pm.includes(staff.id);
                    const amRoom = currentDayData.rooms.am[staff.id] || "";
                    const pmRoom = currentDayData.rooms.pm[staff.id] || "";

                    return (
                      <div key={staff.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 w-[40%]">
                          <div className={clsx("w-10 h-10 rounded-full text-white flex items-center justify-center text-sm font-bold shadow-sm shrink-0", staff.color)}>
                            {staff.name.charAt(0)}
                          </div>
                          <div className="overflow-hidden">
                            <div className="text-sm font-bold text-gray-800 truncate">{staff.name}</div>
                            <div className="text-[10px] text-gray-400 truncate">{staff.roleName}</div>
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col gap-2 pl-3 border-l border-gray-100">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleShift(staff.id, "am")}
                              className={clsx("w-7 h-7 rounded shrink-0 text-xs font-bold transition-colors", inAm ? "bg-primary-500 text-white shadow-sm" : "bg-gray-100 text-gray-400 hover:bg-gray-200")}
                            >
                              上
                            </button>
                            <select
                              disabled={!inAm}
                              value={amRoom}
                              onChange={(e) => setRoom(staff.id, "am", e.target.value)}
                              className="flex-1 w-full text-xs border border-gray-200 rounded px-1.5 py-1 focus:border-primary-500 outline-none disabled:bg-gray-50 disabled:text-gray-300 disabled:border-gray-100 transition-all"
                            >
                              <option value="">未分配</option>
                              {MOCK_ROOMS.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleShift(staff.id, "pm")}
                              className={clsx("w-7 h-7 rounded shrink-0 text-xs font-bold transition-colors", inPm ? "bg-primary-500 text-white shadow-sm" : "bg-gray-100 text-gray-400 hover:bg-gray-200")}
                            >
                              下
                            </button>
                            <select
                              disabled={!inPm}
                              value={pmRoom}
                              onChange={(e) => setRoom(staff.id, "pm", e.target.value)}
                              className="flex-1 w-full text-xs border border-gray-200 rounded px-1.5 py-1 focus:border-primary-500 outline-none disabled:bg-gray-50 disabled:text-gray-300 disabled:border-gray-100 transition-all"
                            >
                              <option value="">未分配</option>
                              {MOCK_ROOMS.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="w-3/4 bg-white p-6 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-4 shrink-0">
                  <h4 className="font-bold text-gray-700 flex items-center">
                    <PencilRuler weight="bold" className="text-primary-500 mr-2" /> 容量微调
                  </h4>
                  <p className="text-[10px] text-gray-500 bg-gray-100 px-2 py-1 rounded flex items-center">
                    <Info weight="bold" className="text-primary-500 mr-1" /> 点击时间块临时修改接诊人数
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 space-y-6 no-scrollbar">
                  {Array.from(new Set([...currentDayData.am, ...currentDayData.pm]))
                    .filter((id) => {
                      const s = MOCK_STAFF.find((st) => st.id === id);
                      return s && (s.role === "doctor" || s.role === "optometrist");
                    })
                    .map((id) => {
                      const staff = MOCK_STAFF.find((s) => s.id === id)!;
                      const inAm = currentDayData.am.includes(id);
                      const inPm = currentDayData.pm.includes(id);

                      return (
                        <div key={id} className="flex items-center gap-3 bg-gray-50/70 p-2.5 rounded-2xl border border-gray-100">
                          <div className="w-16 shrink-0 flex flex-col items-center border-r border-gray-200 pr-2">
                            <div className={clsx("w-8 h-8 rounded-full text-white flex items-center justify-center text-sm font-bold mb-1", staff.color)}>
                              {staff.name.charAt(0)}
                            </div>
                            <span className="text-[10px] font-bold text-gray-700">{staff.name}</span>
                          </div>
                          <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar">
                            <span className="text-xs text-gray-500 font-bold shrink-0 w-8 text-right">上午</span>
                            {timesAm.map((time) => {
                              if (!inAm) {
                                return (
                                  <div key={time} title="暂无排班" className="shrink-0 w-16 h-14 rounded-xl border bg-gray-100 border-gray-200 text-gray-400 flex flex-col items-center justify-center">
                                    <span className="text-[10px] font-medium">{time}</span>
                                    <span className="text-[11px] font-bold">未排班</span>
                                  </div>
                                );
                              }
                              const cap = currentDayData.slots[id]?.[time];
                              if (cap === undefined) {
                                return (
                                  <div key={time} className="shrink-0 w-16 h-14 rounded-xl border bg-gray-50 border-gray-200 text-gray-400 flex flex-col items-center justify-center">
                                    <span className="text-[10px] font-medium">{time}</span>
                                    <span className="text-[11px] font-bold">—</span>
                                  </div>
                                );
                              }
                              return (
                                <div
                                  key={time}
                                  onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setPopoverState({
                                      visible: true,
                                      staffId: id,
                                      time,
                                      cap,
                                      top: Math.max(16, rect.top - 120),
                                      left: Math.max(16, rect.left),
                                    });
                                  }}
                                  className={clsx("shrink-0 w-16 h-14 rounded-xl border cursor-pointer hover:bg-primary-100 flex flex-col items-center justify-center", cap > 0 ? "bg-primary-50 border-primary-200 text-primary-700" : "bg-gray-100 border-gray-200 text-gray-400")}
                                >
                                  <span className="text-[10px] font-medium">{time}</span>
                                  <span className="text-sm font-bold">{cap === 0 ? "停诊" : `${cap}人`}</span>
                                </div>
                              );
                            })}
                            <div className="w-px h-14 bg-gray-200 shrink-0 mx-1"></div>
                            <span className="text-xs text-gray-500 font-bold shrink-0 w-8 text-right">下午</span>
                            {timesPm.map((time) => {
                              if (!inPm) {
                                return (
                                  <div key={time} title="暂无排班" className="shrink-0 w-16 h-14 rounded-xl border bg-gray-100 border-gray-200 text-gray-400 flex flex-col items-center justify-center">
                                    <span className="text-[10px] font-medium">{time}</span>
                                    <span className="text-[11px] font-bold">未排班</span>
                                  </div>
                                );
                              }
                              const cap = currentDayData.slots[id]?.[time];
                              if (cap === undefined) {
                                return (
                                  <div key={time} className="shrink-0 w-16 h-14 rounded-xl border bg-gray-50 border-gray-200 text-gray-400 flex flex-col items-center justify-center">
                                    <span className="text-[10px] font-medium">{time}</span>
                                    <span className="text-[11px] font-bold">—</span>
                                  </div>
                                );
                              }
                              return (
                                <div
                                  key={time}
                                  onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setPopoverState({
                                      visible: true,
                                      staffId: id,
                                      time,
                                      cap,
                                      top: Math.max(16, rect.top - 120),
                                      left: Math.max(16, rect.left),
                                    });
                                  }}
                                  className={clsx("shrink-0 w-16 h-14 rounded-xl border cursor-pointer hover:bg-primary-100 flex flex-col items-center justify-center", cap > 0 ? "bg-primary-50 border-primary-200 text-primary-700" : "bg-gray-100 border-gray-200 text-gray-400")}
                                >
                                  <span className="text-[10px] font-medium">{time}</span>
                                  <span className="text-sm font-bold">{cap === 0 ? "停诊" : `${cap}人`}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Capacity Popover */}
      {popoverState.visible && (
        <div
          className="fixed z-[90] bg-white border border-gray-200 rounded-xl shadow-xl p-4 w-64"
          style={{ top: popoverState.top, left: popoverState.left }}
        >
          <h5 className="font-bold text-gray-700 mb-2 text-sm">修改接诊容量</h5>
          <p className="text-xs text-gray-500 mb-4">
            {MOCK_STAFF.find((s) => s.id === popoverState.staffId)?.name} - {popoverState.time}
          </p>
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setPopoverState({ ...popoverState, cap: Math.max(0, popoverState.cap - 1) })}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold"
            >
              -
            </button>
            <input
              type="number"
              value={popoverState.cap}
              onChange={(e) => setPopoverState({ ...popoverState, cap: Math.max(0, parseInt(e.target.value) || 0) })}
              className="w-16 text-center border border-gray-200 rounded-lg py-1 font-bold text-primary-600 focus:outline-none"
              min="0"
            />
            <button
              onClick={() => setPopoverState({ ...popoverState, cap: popoverState.cap + 1 })}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold"
            >
              +
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPopoverState({ ...popoverState, visible: false })}
              className="flex-1 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={savePopover}
              className="flex-1 py-1.5 bg-primary-500 text-white rounded-lg text-xs font-bold hover:bg-primary-600"
            >
              确认
            </button>
          </div>
        </div>
      )}

      {/* Global Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-[100] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl w-[600px] max-w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Sliders weight="bold" className="text-primary-500" /> 门店排班与容量设置
              </h3>
              <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X weight="bold" className="text-xl" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-8">
              <div>
                <h4 className="font-bold text-slate-700 mb-4 border-l-4 border-primary-500 pl-2">全局营业时段</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-500">上午时段</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={settings.amStart}
                        onChange={(e) => setSettings({ ...settings, amStart: e.target.value })}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                      />
                      <span className="text-slate-400">-</span>
                      <input
                        type="time"
                        value={settings.amEnd}
                        onChange={(e) => setSettings({ ...settings, amEnd: e.target.value })}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-500">下午时段</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={settings.pmStart}
                        onChange={(e) => setSettings({ ...settings, pmStart: e.target.value })}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                      />
                      <span className="text-slate-400">-</span>
                      <input
                        type="time"
                        value={settings.pmEnd}
                        onChange={(e) => setSettings({ ...settings, pmEnd: e.target.value })}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <label className="text-sm text-slate-500">默认号源切分颗粒度</label>
                  <select
                    value={settings.duration}
                    onChange={(e) => setSettings({ ...settings, duration: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                  >
                    <option value={15}>15 分钟 / 段</option>
                    <option value={30}>30 分钟 / 段</option>
                    <option value={60}>60 分钟 / 段</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 text-sm"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setIsSettingsOpen(false);
                  alert("全局设置已保存！");
                }}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 shadow-sm text-sm"
              >
                保存全局配置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
