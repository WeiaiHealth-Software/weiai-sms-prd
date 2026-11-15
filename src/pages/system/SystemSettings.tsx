import { useEffect, useState } from "react";
import { CheckCircle, FloppyDisk, Gear, LockKey, PlugsConnected } from "@phosphor-icons/react";
import { STORES } from "../../lib/org";

interface SystemSettingsForm {
  systemName: string;
  defaultLanguage: string;
  timezone: string;
  passwordMinLength: number;
  loginFailLock: number;
  sessionTimeout: number;
  smsProvider: string;
  smsSign: string;
  ossBucket: string;
}

const INITIAL_FORM: SystemSettingsForm = {
  systemName: "惟爱门店管理系统",
  defaultLanguage: "简体中文",
  timezone: "Asia/Shanghai",
  passwordMinLength: 8,
  loginFailLock: 5,
  sessionTimeout: 120,
  smsProvider: "阿里云短信",
  smsSign: "惟爱眼科",
  ossBucket: "weiai-prod",
};

export default function SystemSettings() {
  const [form, setForm] = useState<SystemSettingsForm>(INITIAL_FORM);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const timer = window.setTimeout(() => setSaved(false), 2400);
    return () => window.clearTimeout(timer);
  }, [saved]);

  const update = <K extends keyof SystemSettingsForm>(key: K, value: SystemSettingsForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex flex-none items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 card-shadow">
        <div className="text-sm text-gray-600">
          系统设置为<span className="font-bold text-gray-900">全局配置</span>，对所有门店生效；
          门店地址、营业时间、联系方式等请在门店资料中维护。
        </div>
        <button
          onClick={() => setSaved(true)}
          className="flex items-center rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-600"
        >
          <FloppyDisk weight="bold" className="mr-2" /> 保存设置
        </button>
      </div>

      {saved && (
        <div className="flex flex-none items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
          <CheckCircle weight="fill" /> 设置已保存（演示环境仅保存在当前页面状态）
        </div>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto xl:grid-cols-2">
        {/* 通用参数 */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 card-shadow">
          <div className="flex items-center gap-2">
            <Gear weight="duotone" className="text-lg text-primary-500" />
            <h3 className="text-sm font-bold text-gray-900">通用参数</h3>
          </div>
          <div className="mt-4 space-y-4">
            <Field label="系统名称">
              <input
                value={form.systemName}
                onChange={(event) => update("systemName", event.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="默认语言">
                <select
                  value={form.defaultLanguage}
                  onChange={(event) => update("defaultLanguage", event.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary-500 focus:outline-none"
                >
                  <option value="简体中文">简体中文</option>
                  <option value="English">English</option>
                </select>
              </Field>
              <Field label="系统时区">
                <select
                  value={form.timezone}
                  onChange={(event) => update("timezone", event.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary-500 focus:outline-none"
                >
                  <option value="Asia/Shanghai">Asia/Shanghai</option>
                  <option value="Asia/Hong_Kong">Asia/Hong_Kong</option>
                </select>
              </Field>
            </div>
            <div className="rounded-xl bg-gray-50 px-3 py-2.5 text-xs text-gray-500">
              当前系统已创建 {STORES.length} 家门店，门店维度资料在「门店管理 → 门店列表」中维护。
            </div>
          </div>
        </section>

        {/* 登录安全 */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 card-shadow">
          <div className="flex items-center gap-2">
            <LockKey weight="duotone" className="text-lg text-primary-500" />
            <h3 className="text-sm font-bold text-gray-900">登录安全策略</h3>
          </div>
          <div className="mt-4 space-y-4">
            <Field label="密码最小长度">
              <input
                type="number"
                value={form.passwordMinLength}
                onChange={(event) => update("passwordMinLength", Number(event.target.value))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </Field>
            <Field label="登录失败锁定次数">
              <input
                type="number"
                value={form.loginFailLock}
                onChange={(event) => update("loginFailLock", Number(event.target.value))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </Field>
            <Field label="会话超时（分钟）">
              <input
                type="number"
                value={form.sessionTimeout}
                onChange={(event) => update("sessionTimeout", Number(event.target.value))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </Field>
            <div className="rounded-xl bg-gray-50 px-3 py-2.5 text-xs text-gray-500">
              账号停用与权限变更均会写入日志，可在「系统管理 → 日志管理」中追溯。
            </div>
          </div>
        </section>

        {/* 集成配置 */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 card-shadow xl:col-span-2">
          <div className="flex items-center gap-2">
            <PlugsConnected weight="duotone" className="text-lg text-primary-500" />
            <h3 className="text-sm font-bold text-gray-900">集成配置</h3>
          </div>
          <p className="mt-1 text-xs text-gray-400">密钥类信息仅做脱敏展示，修改需由开发者在部署环境配置。</p>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <Field label="短信服务商">
              <input
                value={form.smsProvider}
                onChange={(event) => update("smsProvider", event.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </Field>
            <Field label="短信签名">
              <input
                value={form.smsSign}
                onChange={(event) => update("smsSign", event.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </Field>
            <Field label="对象存储 Bucket">
              <input
                value={form.ossBucket}
                onChange={(event) => update("ossBucket", event.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </Field>
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-gray-500">{label}</label>
      {children}
    </div>
  );
}
