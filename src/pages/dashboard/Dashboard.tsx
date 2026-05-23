import {
  ArrowUpRight,
  DotsThree,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

type TimeRangeValue = "7d" | "1m" | "3m" | "1y";

function formatNumber(value: number) {
  return value.toLocaleString("zh-CN");
}

export default function Dashboard() {
  const timeRangeOptions: Array<{ value: TimeRangeValue; label: string }> = useMemo(
    () => [
      { value: "7d", label: "7天内" },
      { value: "1m", label: "一个月" },
      { value: "3m", label: "三个月" },
      { value: "1y", label: "一年" },
    ],
    []
  );

  const [storeRange, setStoreRange] = useState<TimeRangeValue>("1m");
  const [crmRange, setCrmRange] = useState<TimeRangeValue>("1m");

  const storeMetrics = useMemo(() => {
    const mapping: Record<
      TimeRangeValue,
      {
        revenue: number;
        deals: number;
        goalTarget: number;
        goalAchieved: number;
      }
    > = {
      "7d": { revenue: 3087, deals: 78, goalTarget: 18000, goalAchieved: 12800 },
      "1m": { revenue: 12087, deals: 326, goalTarget: 68000, goalAchieved: 50901 },
      "3m": { revenue: 35820, deals: 920, goalTarget: 180000, goalAchieved: 152300 },
      "1y": { revenue: 142800, deals: 3820, goalTarget: 720000, goalAchieved: 621000 },
    };
    const current = mapping[storeRange];
    const percent = current.goalTarget <= 0 ? 0 : Math.round((current.goalAchieved / current.goalTarget) * 100);
    return { ...current, goalPercent: Math.max(0, Math.min(100, percent)) };
  }, [storeRange]);

  const crmMetrics = useMemo(() => {
    const mapping: Record<
      TimeRangeValue,
      {
        customerTotal: number;
        newCustomers: number;
        pendingFollowups: number;
        bookings: number;
      }
    > = {
      "7d": { customerTotal: 3482, newCustomers: 36, pendingFollowups: 37, bookings: 214 },
      "1m": { customerTotal: 3482, newCustomers: 128, pendingFollowups: 142, bookings: 892 },
      "3m": { customerTotal: 3482, newCustomers: 356, pendingFollowups: 412, bookings: 2460 },
      "1y": { customerTotal: 3482, newCustomers: 1380, pendingFollowups: 1300, bookings: 9800 },
    };
    return mapping[crmRange];
  }, [crmRange]);

  const barData = {
    labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    datasets: [
      {
        label: "配镜",
        data: [35, 42, 30, 45, 58, 72, 65, 48, 40, 55, 62, 80],
        backgroundColor: "#3b82f6", // theme-500
        borderRadius: 4,
        barThickness: 24,
      },
      {
        label: "验光",
        data: [20, 25, 22, 30, 35, 40, 45, 30, 25, 30, 35, 45],
        backgroundColor: "#bfdbfe", // theme-200
        borderRadius: 4,
        barThickness: 24,
      },
    ],
  };

  const barOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        grid: { borderDash: [4, 4], drawBorder: false },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  const doughnutData = {
    labels: ["满意", "中规中矩", "不满意"],
    datasets: [
      {
        data: [65, 25, 10],
        backgroundColor: ["#3b82f6", "#bfdbfe", "#e5e7eb"],
        borderWidth: 0,
        cutout: "75%",
        circumference: 260,
        rotation: 230,
        borderRadius: 20,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-none">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-gray-900 font-bold text-lg">门店指标</h3>
          <select
            value={storeRange}
            onChange={(e) => setStoreRange(e.target.value as TimeRangeValue)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:border-primary-500 outline-none bg-white text-gray-700 font-bold"
          >
            {timeRangeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-primary-500 rounded-2xl p-4 lg:p-6 2xl:p-8 relative overflow-hidden card-shadow flex flex-col justify-between group transition hover:translate-y-[-2px]">
            <div className="flex justify-between items-start mb-6 lg:mb-8 2xl:mb-10 relative z-10">
              <div className="flex items-center justify-center">
                <p className="text-2xl text-white font-bold">营收</p>
              </div>
              <div className="bg-white/20 text-white text-md font-bold px-2 py-1 rounded-md flex items-center gap-1">
                <ArrowUpRight weight="bold" /> +17%
              </div>
            </div>
            <div>
              <p className="text-4xl font-bold text-white tracking-tight">¥ {formatNumber(storeMetrics.revenue)}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 lg:p-6 2xl:p-8 card-shadow flex flex-col justify-between transition hover:translate-y-[-2px]">
            <div className="flex justify-between items-start mb-6 lg:mb-8 2xl:mb-10 relative z-10">
              <div className="flex items-center justify-center text-gray-900">
                <p className="text-2xl text-gray-900 font-bold">成交单数</p>
              </div>
              <div className="bg-primary-50 text-primary-600 text-md font-bold px-2 py-1 rounded-md flex items-center gap-1">
                <ArrowUpRight weight="bold" /> +8%
              </div>
            </div>
            <div>
              <p className="text-4xl font-bold text-gray-900 tracking-tight">
                {formatNumber(storeMetrics.deals)} <span className="text-sm font-normal text-gray-400">单</span>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 lg:p-6 2xl:p-8 card-shadow flex flex-col justify-between transition hover:translate-y-[-2px]">
            <div className="flex justify-between items-center mb-4 lg:mb-6 2xl:mb-8 relative z-10">
              <p className="text-2xl text-gray-900 font-bold">销售目标</p>
              <DotsThree weight="bold" className="text-gray-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 mb-4 lg:mb-6 2xl:mb-8 tracking-tight">
                ¥ {formatNumber(storeMetrics.goalAchieved)}{" "}
                <span className="text-sm text-gray-400 font-normal">/ ¥{formatNumber(storeMetrics.goalTarget)}</span>
              </p>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div className="bg-primary-500 h-full rounded-full" style={{ width: `${storeMetrics.goalPercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-none">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-gray-900 font-bold text-lg">客户档案指标</h3>
          <select
            value={crmRange}
            onChange={(e) => setCrmRange(e.target.value as TimeRangeValue)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:border-primary-500 outline-none bg-white text-gray-700 font-bold"
          >
            {timeRangeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-4 lg:p-6 card-shadow flex flex-col justify-between transition hover:translate-y-[-2px]">
            <div className="flex justify-between items-start">
              <p className="text-md text-gray-500 font-bold">客户总数</p>
              <div className="bg-primary-50 text-primary-600 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                <ArrowUpRight weight="bold" /> +6%
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-gray-900 tracking-tight">{formatNumber(crmMetrics.customerTotal)}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 lg:p-6 card-shadow flex flex-col justify-between transition hover:translate-y-[-2px]">
            <div className="flex justify-between items-start">
              <p className="text-md text-gray-500 font-bold">新增客户</p>
              <div className="bg-primary-50 text-primary-600 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                <ArrowUpRight weight="bold" /> +9%
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-gray-900 tracking-tight">{formatNumber(crmMetrics.newCustomers)}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 lg:p-6 card-shadow flex flex-col justify-between transition hover:translate-y-[-2px]">
            <div className="flex justify-between items-start">
              <p className="text-md text-gray-500 font-bold">待回访</p>
              <div className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                <ArrowUpRight weight="bold" /> +9%
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-gray-900 tracking-tight">{formatNumber(crmMetrics.pendingFollowups)}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 lg:p-6 card-shadow flex flex-col justify-between transition hover:translate-y-[-2px]">
            <div className="flex justify-between items-start">
              <p className="text-md text-gray-500 font-bold">预约人数</p>
              <div className="bg-primary-50 text-primary-600 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                <ArrowUpRight weight="bold" /> +11%
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-gray-900 tracking-tight">{formatNumber(crmMetrics.bookings)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        <div className="bg-white rounded-2xl p-6 card-shadow flex flex-col justify-between h-full">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-900 font-bold text-2xl">客户满意度</h3>
                <p className="text-gray-400 text-md mt-1">最高正面反馈</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <DotsThree weight="bold" className="text-xl" />
              </button>
            </div>
          </div>

          <div className="flex-1 relative flex items-center justify-center my-2">
            <div className="w-48 h-40 lg:w-64 lg:h-48 xl:w-80 xl:h-64 relative flex items-center justify-center">
              <Doughnut data={doughnutData} options={doughnutOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-4 pointer-events-none">
                <p className="text-3xl font-bold text-gray-900 tracking-tight">250</p>
                <p className="text-gray-400 text-xs mt-1">答复数</p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-4 mb-6">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-primary-500"></span>
              <span className="text-md font-bold text-gray-600">满意</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-primary-200"></span>
              <span className="text-md font-bold text-gray-600">中规中矩</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-gray-200"></span>
              <span className="text-md font-bold text-gray-600">不满意</span>
            </div>
          </div>

          {/* Stats & Description */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 bg-gray-50 rounded-full p-1 pr-4 w-full">
              <div className="bg-primary-100 text-primary-600 text-xs font-bold px-3 py-2 rounded-full flex items-center gap-1 whitespace-nowrap">
                <ArrowUpRight weight="bold" /> +12%
              </div>
              <span className="text-md text-gray-500 font-medium truncate">
                客户满意度 (CSAT): 4.7/5
              </span>
            </div>
            <p className="text-center text-lg font-bold text-gray-900">卓越的支持和快速的响应</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-7 card-shadow lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-gray-900 font-bold text-2xl">营收趋势分析</h3>
            <div className="flex bg-gray-100 p-0.5 rounded-lg">
              <button className="px-3 py-1 bg-white shadow-sm rounded-md text-xs font-bold text-gray-900">月视图</button>
              <button className="px-3 py-1 text-xs text-gray-500">年视图</button>
            </div>
          </div>
          <div className="flex-1 relative w-full h-full min-h-[240px]">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
