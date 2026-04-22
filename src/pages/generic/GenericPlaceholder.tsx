
import { useLocation } from "react-router";
import { menuConfig } from "../../config/menu";
import { Wrench, Check } from "@phosphor-icons/react";

export function GenericPlaceholder() {
  const location = useLocation();

  let title = "页面标题";
  let features: string[] = [];
  let IconComponent = Wrench;

  for (const item of menuConfig) {
    const sub = item.subs.find((s) => location.pathname === s.path);
    if (sub) {
      title = sub.label;
      features = sub.features || [];
      IconComponent = item.icon;
      break;
    }
  }

  return (
    <div className="h-full flex flex-col items-center justify-center text-center">
      <div className="w-24 h-24 bg-white shadow-sm border border-gray-100 rounded-2xl flex items-center justify-center mb-6">
        <IconComponent weight="duotone" className="text-5xl text-primary-500" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500 max-w-md mb-8 text-sm">
        此模块的二级页面已构建完毕，等待填充具体业务组件。
      </p>

      {features.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-3xl w-full text-left relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary-500"></div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Check weight="bold" /> 本页面包含功能模块
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary-200 transition group"
              >
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-100 text-primary-500 group-hover:bg-primary-50 group-hover:scale-110 transition">
                  <Check weight="bold" />
                </div>
                <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900">
                  {f}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
