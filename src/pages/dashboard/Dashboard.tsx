import {
  ArrowUpRight,
  ArrowDownRight,
  DotsThree,
} from "@phosphor-icons/react";
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

export default function Dashboard() {
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
      {/* KPI 卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 flex-none">
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
            <p className="text-4xl font-bold text-white tracking-tight">¥ 12,087</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 lg:p-6 2xl:p-8 card-shadow flex flex-col justify-between transition hover:translate-y-[-2px]">
          <div className="flex justify-between items-start mb-6 lg:mb-8 2xl:mb-10 relative z-10">
            <div className="flex items-center justify-center text-gray-900">
              <p className="text-2xl text-gray-900 font-bold">本月预约量</p>
            </div>
            <div className="text-red-600 bg-red-50 text-md font-bold px-2 py-1 rounded-md flex items-center gap-1">
              <ArrowDownRight weight="bold" /> -12%
            </div>
          </div>
          <div>
            <p className="text-4xl font-bold text-gray-900 tracking-tight">
              892 <span className="text-sm font-normal text-gray-400">人次</span>
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
              ¥ 50,901 <span className="text-sm text-gray-400 font-normal">/ ¥68k</span>
            </p>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div className="bg-primary-500 h-full rounded-full" style={{ width: "75%" }}></div>
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
                <p className="text-gray-400 text-xs mt-1">本月答复</p>
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
          <div className="flex-1 relative w-full h-full min-h-[300px]">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
