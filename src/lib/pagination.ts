/** 分页与数值工具（表格页共用） */

/** 把数值限制在 [min, max] 区间内 */
export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/** 生成分页按钮序列，超过 7 页时用省略号折叠中间页码 */
export function getPageItems(totalPages: number, currentPage: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, idx) => idx + 1);
  const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const clipped = Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
  const out: Array<number | "ellipsis"> = [];
  for (let index = 0; index < clipped.length; index++) {
    const prev = clipped[index - 1];
    const cur = clipped[index];
    if (index > 0 && prev != null && cur - prev > 1) out.push("ellipsis");
    out.push(cur);
  }
  return out;
}
