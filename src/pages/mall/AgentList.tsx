import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import clsx from "clsx";
import { Plus, SlidersHorizontal, Trash, Users } from "@phosphor-icons/react";
import Select, { type SelectOption } from "../../components/form/Select";
import StatusTag, { type StatusTone } from "../../components/product/StatusTag";
import {
  agentLevelConfigs,
  getLevelRate,
  getLevelBadgeClass,
  getLevelBadgeClassByIndex,
  getLevelConditionText,
  getAgentSettleSummary,
  initialAgents,
  initialAgentOrders,
  initialWithdraws,
  type Agent,
  type AgentLevel,
  type AgentLevelConfig,
  type AgentStatus,
} from "./agentData";

type StatusFilter = "全部状态" | AgentStatus;
type LevelFilter = "全部等级" | AgentLevel;

type AgentDraft = {
  name: string;
  phone: string;
  level: AgentLevel;
  commissionRate: string;
  status: AgentStatus;
  remark: string;
};

/** 等级配置弹窗的草稿行：数值统一用字符串承载，便于输入中间态 */
type LevelDraft = {
  level: string;
  rate: string;
  minOrders: string;
  minAmount: string;
  desc: string;
  /** 记录原始等级名，用于保存时判断是否发生过重命名 */
  originalLevel: string;
};

const statusFilterOptions: SelectOption[] = ["全部状态", "启用", "停用"].map((item) => ({ value: item, label: item }));

const statusOptions: SelectOption[] = [
  { value: "启用", label: "启用" },
  { value: "停用", label: "停用" },
];

const agentStatusTone: Record<AgentStatus, StatusTone> = {
  启用: "success",
  停用: "neutral",
};

/** 把配置转成弹窗草稿 */
function toLevelDraft(config: AgentLevelConfig): LevelDraft {
  return {
    level: config.level,
    rate: String(config.rate),
    minOrders: String(config.minOrders),
    minAmount: String(config.minAmount),
    desc: config.desc,
    originalLevel: config.level,
  };
}

const inputClass =
  "mt-3 h-14 w-full rounded-[24px] border border-slate-200 bg-white px-5 text-base font-semibold text-slate-700 outline-none placeholder:font-medium placeholder:text-slate-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-100";

function money(value: number) {
  return `¥${value.toFixed(2)}`;
}

/** 新建代理商的初始草稿：默认落在最低梯队 */
function makeAgentDraft(configs: AgentLevelConfig[]): AgentDraft {
  const first = configs[0];
  return {
    name: "",
    phone: "",
    level: first?.level ?? "",
    commissionRate: String(first?.rate ?? 0),
    status: "启用",
    remark: "",
  };
}

export default function AgentList() {
  const navigate = useNavigate();

  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [levelConfigs, setLevelConfigs] = useState<AgentLevelConfig[]>(agentLevelConfigs);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("全部状态");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("全部等级");
  const [keyword, setKeyword] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AgentDraft>(() => makeAgentDraft(agentLevelConfigs));

  const [configOpen, setConfigOpen] = useState(false);
  const [configDraft, setConfigDraft] = useState<LevelDraft[]>(() => agentLevelConfigs.map(toLevelDraft));

  const levelOptions = useMemo<SelectOption[]>(
    () => levelConfigs.map((config) => ({ value: config.level, label: `${config.level}（默认 ${config.rate}%）` })),
    [levelConfigs]
  );

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return agents.filter((agent) => {
      if (statusFilter !== "全部状态" && agent.status !== statusFilter) return false;
      if (levelFilter !== "全部等级" && agent.level !== levelFilter) return false;
      if (kw && !`${agent.id} ${agent.name} ${agent.phone} ${agent.remark}`.toLowerCase().includes(kw)) return false;
      return true;
    });
  }, [agents, keyword, levelFilter, statusFilter]);

  const levelCount = useMemo(() => {
    const base: Record<string, number> = {};
    for (const config of levelConfigs) base[config.level] = 0;
    for (const agent of agents) base[agent.level] = (base[agent.level] ?? 0) + 1;
    return base;
  }, [agents, levelConfigs]);

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setDraft(makeAgentDraft(levelConfigs));
  }

  function openCreate() {
    setDraft(makeAgentDraft(levelConfigs));
    setEditingId(null);
    setModalOpen(true);
  }

  function openEdit(agent: Agent) {
    setDraft({
      name: agent.name,
      phone: agent.phone,
      level: agent.level,
      commissionRate: String(agent.commissionRate),
      status: agent.status,
      remark: agent.remark,
    });
    setEditingId(agent.id);
    setModalOpen(true);
  }

  /** 选择等级时，联动带出该等级的默认分成比例 */
  function changeLevel(level: AgentLevel) {
    setDraft((prev) => ({ ...prev, level, commissionRate: String(getLevelRate(level, levelConfigs)) }));
  }

  function saveAgent() {
    const name = draft.name.trim();
    const phone = draft.phone.trim();
    const rate = Number(draft.commissionRate);
    const rateValid = draft.commissionRate.trim() !== "" && !Number.isNaN(rate) && rate >= 0 && rate <= 100;
    if (!name || !phone || !rateValid) return;

    if (editingId) {
      setAgents((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? { ...item, name, phone, level: draft.level, commissionRate: rate, status: draft.status, remark: draft.remark }
            : item
        )
      );
    } else {
      setAgents((prev) => [
        ...prev,
        {
          id: `AGT-${String(prev.length + 1).padStart(3, "0")}`,
          name,
          phone,
          level: draft.level,
          commissionRate: rate,
          status: draft.status,
          remark: draft.remark,
          createdAt: new Date().toISOString().slice(0, 10),
        },
      ]);
    }
    closeModal();
  }

  function toggleStatus(agent: Agent) {
    setAgents((prev) =>
      prev.map((item) => (item.id === agent.id ? { ...item, status: item.status === "启用" ? "停用" : "启用" } : item))
    );
  }

  // —— 代理等级配置 ——
  function openConfig() {
    setConfigDraft(levelConfigs.map(toLevelDraft));
    setConfigOpen(true);
  }

  function updateConfigDraft(index: number, patch: Partial<LevelDraft>) {
    setConfigDraft((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function addLevelDraft() {
    setConfigDraft((prev) => [
      ...prev,
      { level: "", rate: "10", minOrders: "0", minAmount: "0", desc: "", originalLevel: "" },
    ]);
  }

  function removeLevelDraft(index: number) {
    setConfigDraft((prev) => prev.filter((_, i) => i !== index));
  }

  const configNames = configDraft.map((item) => item.level.trim());
  const configValid =
    configDraft.length > 0 &&
    !configNames.some((name) => !name) &&
    new Set(configNames).size === configNames.length &&
    configDraft.every((item) => {
      const rate = Number(item.rate);
      const orders = Number(item.minOrders);
      const amount = Number(item.minAmount);
      return (
        item.rate.trim() !== "" &&
        !Number.isNaN(rate) &&
        rate >= 0 &&
        rate <= 100 &&
        item.minOrders.trim() !== "" &&
        !Number.isNaN(orders) &&
        orders >= 0 &&
        item.minAmount.trim() !== "" &&
        !Number.isNaN(amount) &&
        amount >= 0
      );
    });

  function saveConfig() {
    if (!configValid) return;
    const next: AgentLevelConfig[] = configDraft.map((item) => ({
      level: item.level.trim(),
      rate: Number(item.rate),
      minOrders: Number(item.minOrders),
      minAmount: Number(item.minAmount),
      desc: item.desc.trim(),
    }));

    // 等级重命名：把原等级名映射到新等级名
    const renameMap = new Map<string, string>();
    for (const item of configDraft) {
      const nextName = item.level.trim();
      if (item.originalLevel && item.originalLevel !== nextName) renameMap.set(item.originalLevel, nextName);
    }
    const fallbackLevel = next[0]?.level ?? "";
    setAgents((prev) =>
      prev.map((agent) => {
        let level = renameMap.get(agent.level) ?? agent.level;
        if (!next.some((config) => config.level === level)) level = fallbackLevel;
        return level === agent.level ? agent : { ...agent, level };
      })
    );

    setLevelConfigs(next);
    if (levelFilter !== "全部等级" && !next.some((config) => config.level === levelFilter)) setLevelFilter("全部等级");
    setConfigOpen(false);
  }

  const rateValid =
    draft.commissionRate.trim() !== "" &&
    !Number.isNaN(Number(draft.commissionRate)) &&
    Number(draft.commissionRate) >= 0 &&
    Number(draft.commissionRate) <= 100;

  const modal =
    modalOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/35 px-4 py-8"
            onClick={closeModal}
          >
            <div
              className="w-full max-w-[680px] max-h-[90vh] overflow-y-auto rounded-[32px] bg-white px-8 py-7 shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[20px] font-bold leading-8 text-gray-900">
                    {editingId ? "编辑代理商" : "新增代理商"}
                  </div>
                  <div className="mt-1 text-sm font-medium leading-6 text-slate-500">
                    代理商等级决定默认分成比例，可按实际情况单独调整。
                  </div>
                </div>
                <button
                  className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200"
                  onClick={closeModal}
                >
                  关闭
                </button>
              </div>

              <div className="mt-7 space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <div className="text-sm font-semibold text-slate-500">代理商名称</div>
                    <input
                      value={draft.name}
                      onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="例如：张丽（眼科咨询师）"
                      className="mt-3 h-14 w-full rounded-[24px] border border-slate-200 bg-white px-5 text-base font-semibold text-slate-700 outline-none placeholder:font-medium placeholder:text-slate-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-500">联系手机号</div>
                    <input
                      value={draft.phone}
                      onChange={(e) => setDraft((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="请输入手机号"
                      className="mt-3 h-14 w-full rounded-[24px] border border-slate-200 bg-white px-5 text-base font-semibold text-slate-700 outline-none placeholder:font-medium placeholder:text-slate-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-500">代理商等级</div>
                    <Select
                      value={draft.level}
                      onChange={(value) => changeLevel(value as AgentLevel)}
                      options={levelOptions}
                      className="mt-3"
                      triggerClassName="h-14 rounded-[24px] px-5 text-base font-semibold"
                      dropdownClassName="rounded-[24px]"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-500">分成比例（%）</div>
                    <input
                      value={draft.commissionRate}
                      inputMode="decimal"
                      onChange={(e) => setDraft((prev) => ({ ...prev, commissionRate: e.target.value }))}
                      placeholder="0 ~ 100"
                      className="mt-3 h-14 w-full rounded-[24px] border border-slate-200 bg-white px-5 text-base font-semibold text-slate-700 outline-none placeholder:font-medium placeholder:text-slate-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                    />
                    <div className="mt-1.5 text-xs text-slate-400">
                      选择等级后自动带出默认比例 {getLevelRate(draft.level, levelConfigs)}%，可手动修改。
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-500">状态</div>
                    <Select
                      value={draft.status}
                      onChange={(value) => setDraft((prev) => ({ ...prev, status: value as AgentStatus }))}
                      options={statusOptions}
                      className="mt-3"
                      triggerClassName="h-14 rounded-[24px] px-5 text-base font-semibold"
                      dropdownClassName="rounded-[24px]"
                    />
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-slate-500">备注</div>
                  <textarea
                    value={draft.remark}
                    rows={3}
                    onChange={(e) => setDraft((prev) => ({ ...prev, remark: e.target.value }))}
                    placeholder="渠道来源、合作方式等说明"
                    className="mt-3 w-full rounded-[24px] border border-slate-200 bg-white px-5 py-3 text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-base font-semibold text-slate-600 hover:bg-slate-50"
                  onClick={closeModal}
                >
                  取消
                </button>
                <button
                  className="rounded-2xl bg-primary-500 px-5 py-2.5 text-base font-semibold text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-primary-300"
                  disabled={!draft.name.trim() || !draft.phone.trim() || !rateValid}
                  onClick={saveAgent}
                >
                  确认保存
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  // —— 代理等级配置弹窗 ——
  const configModal =
    configOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/35 px-4 py-8"
            onClick={() => setConfigOpen(false)}
          >
            <div
              className="flex w-full max-w-[880px] max-h-[90vh] flex-col overflow-hidden rounded-[32px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-8 py-6">
                <div>
                  <div className="text-[20px] font-bold leading-8 text-gray-900">代理等级配置</div>
                  <div className="mt-1 text-sm font-medium leading-6 text-slate-500">
                    配置各梯队的升级门槛与默认分成比例；代理商同时满足门槛后自动升级到对应等级。
                  </div>
                </div>
                <button
                  className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200"
                  onClick={() => setConfigOpen(false)}
                >
                  关闭
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-8 py-6">
                {configDraft.map((item, index) => {
                  const conditionText = getLevelConditionText({
                    level: item.level,
                    rate: 0,
                    minOrders: Number(item.minOrders) || 0,
                    minAmount: Number(item.minAmount) || 0,
                    desc: "",
                  });
                  return (
                    <div key={index} className="rounded-[24px] border border-gray-100 bg-slate-50/60 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-semibold text-slate-500">第 {index + 1} 梯队</span>
                          <span
                            className={clsx(
                              "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                              getLevelBadgeClassByIndex(index)
                            )}
                          >
                            {item.level.trim() || "未命名等级"}
                          </span>
                        </div>
                        <button
                          className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-medium text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
                          disabled={configDraft.length <= 1}
                          onClick={() => removeLevelDraft(index)}
                          title={configDraft.length <= 1 ? "至少保留一个梯队" : "删除该梯队"}
                        >
                          <Trash weight="bold" className="h-4 w-4" />
                          删除
                        </button>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div>
                          <div className="text-sm font-semibold text-slate-500">等级名称</div>
                          <input
                            value={item.level}
                            onChange={(e) => updateConfigDraft(index, { level: e.target.value })}
                            placeholder="例如：金牌代理"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-500">默认分成比例（%）</div>
                          <input
                            value={item.rate}
                            inputMode="decimal"
                            onChange={(e) => updateConfigDraft(index, { rate: e.target.value })}
                            placeholder="0 ~ 100"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-500">分销成单数（≥ 单）</div>
                          <input
                            value={item.minOrders}
                            inputMode="numeric"
                            onChange={(e) => updateConfigDraft(index, { minOrders: e.target.value })}
                            placeholder="0 表示无门槛"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-500">累计分销金额（≥ 元）</div>
                          <input
                            value={item.minAmount}
                            inputMode="numeric"
                            onChange={(e) => updateConfigDraft(index, { minAmount: e.target.value })}
                            placeholder="0 表示无门槛，如 100000"
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="text-sm font-semibold text-slate-500">说明</div>
                        <input
                          value={item.desc}
                          onChange={(e) => updateConfigDraft(index, { desc: e.target.value })}
                          placeholder="该梯队的定位说明，如：稳定出单的渠道合作方"
                          className={inputClass}
                        />
                      </div>

                      <div className="mt-3 text-xs text-slate-400">升级条件预览：{conditionText}</div>
                    </div>
                  );
                })}

                <button
                  className="inline-flex w-full items-center justify-center gap-2 rounded-[24px] border border-dashed border-slate-300 bg-white py-3.5 text-sm font-semibold text-primary-600 hover:border-primary-300 hover:bg-primary-50/60"
                  onClick={addLevelDraft}
                >
                  <Plus weight="bold" className="h-4 w-4" />
                  新增梯队
                </button>
              </div>

              <div className="flex justify-end gap-4 border-t border-gray-100 px-8 py-5">
                <button
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-base font-semibold text-slate-600 hover:bg-slate-50"
                  onClick={() => setConfigOpen(false)}
                >
                  取消
                </button>
                <button
                  className="rounded-2xl bg-primary-500 px-5 py-2.5 text-base font-semibold text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-primary-300"
                  disabled={!configValid}
                  onClick={saveConfig}
                >
                  保存配置
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="min-h-full flex flex-col gap-4">
      {/* 等级配置概览：点击按等级筛选 */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {levelConfigs.map((config, index) => {
          const active = levelFilter === config.level;
          return (
            <button
              key={config.level}
              onClick={() => setLevelFilter(active ? "全部等级" : config.level)}
              className={clsx(
                "rounded-2xl border p-4 text-left transition",
                active ? "border-primary-300 bg-primary-50/70 shadow-sm" : "border-gray-100 bg-white card-shadow hover:border-gray-200"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={clsx("inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold", getLevelBadgeClassByIndex(index))}>
                  {config.level}
                </span>
                <span className={clsx("text-lg font-bold", active ? "text-primary-600" : "text-slate-800")}>
                  {config.rate}%
                </span>
              </div>
              <div className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">{config.desc}</div>
              <div className="mt-2 text-xs font-medium text-primary-500">{getLevelConditionText(config)}</div>
              <div className="mt-1 text-xs font-medium text-slate-500">{levelCount[config.level] ?? 0} 位代理商</div>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl card-shadow border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <div className="flex flex-col gap-3 p-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <Users weight="duotone" className="h-5 w-5 text-primary-500" />
                共 {agents.length} 位代理商
              </div>
              <Select
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as StatusFilter)}
                options={statusFilterOptions}
                className="min-w-[128px]"
                triggerClassName="h-[46px] rounded-2xl border-gray-200 px-4"
              />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索代理商名称 / 手机号"
                className="h-[46px] w-full max-w-[280px] rounded-2xl border border-gray-200 bg-white px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                onClick={openConfig}
              >
                <SlidersHorizontal weight="bold" className="h-4 w-4" />
                等级配置
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-2xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-600 active:bg-primary-700"
                onClick={openCreate}
              >
                <Plus weight="bold" className="h-4 w-4" />
                新增代理商
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1140px] table-fixed text-center">
            <colgroup>
              <col className="w-[18%]" />
              <col className="w-[10%]" />
              <col className="w-[9%]" />
              <col className="w-[10%]" />
              <col className="w-[13%]" />
              <col className="w-[13%]" />
              <col className="w-[8%]" />
              <col className="w-[19%]" />
            </colgroup>
            <thead className="bg-gray-50 text-xs uppercase tracking-[0.18em] text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">代理商</th>
                <th className="px-4 py-3 text-center font-semibold">等级</th>
                <th className="px-4 py-3 text-center font-semibold">分成比例</th>
                <th className="px-4 py-3 text-center font-semibold">分销订单</th>
                <th className="px-4 py-3 text-center font-semibold">累计分成</th>
                <th className="px-4 py-3 text-center font-semibold">可提现</th>
                <th className="px-4 py-3 text-center font-semibold">状态</th>
                <th className="px-4 py-3 text-center font-semibold">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filtered.map((agent) => {
                const summary = getAgentSettleSummary(agent.id, initialAgentOrders, initialWithdraws);
                return (
                  <tr key={agent.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-left">
                      <div className="font-semibold text-gray-900">{agent.name}</div>
                      <div className="mt-0.5 text-xs text-gray-400">
                        {agent.id} · {agent.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={clsx("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", getLevelBadgeClass(agent.level, levelConfigs))}>
                        {agent.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-gray-700">{agent.commissionRate}%</span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{summary.orderCount} 单</td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-800">{money(summary.totalCommission)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-primary-600">{money(summary.withdrawable)}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusTag status={agent.status} tone={agentStatusTone[agent.status]} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
                        <button
                          className="rounded-md bg-primary-50 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-100 hover:text-primary-700"
                          onClick={() => navigate(`/mall/agent/${agent.id}`)}
                        >
                          详情
                        </button>
                        <button className="text-sm font-medium text-primary-500 hover:text-primary-600" onClick={() => openEdit(agent)}>
                          编辑
                        </button>
                        <button
                          className={clsx(
                            "text-sm font-medium",
                            agent.status === "启用" ? "text-orange-500 hover:text-orange-600" : "text-emerald-600 hover:text-emerald-700"
                          )}
                          onClick={() => toggleStatus(agent)}
                        >
                          {agent.status === "启用" ? "停用" : "启用"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-sm text-gray-400">
                    暂无符合条件的代理商
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm text-gray-500">
          <div>共 {filtered.length} 位代理商</div>
        </div>
      </div>

      {modal}
      {configModal}
    </div>
  );
}
