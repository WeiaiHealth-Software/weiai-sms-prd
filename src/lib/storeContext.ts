// 门店上下文：全局角色「进入某门店工作区」时记录当前门店
//
// 门店角色（店长 / 店员 / 视光师）固定使用账号绑定的门店；
// 开发者与超级管理员可在门店列表中进入任意门店，本文件仅保存该选择。

const CURRENT_STORE_KEY = "weiai.currentStore";
const STORE_CONTEXT_EVENT = "weiai-store-context-change";

function notify() {
  window.dispatchEvent(new Event(STORE_CONTEXT_EVENT));
}

export function getCurrentStoreId(): string | null {
  return localStorage.getItem(CURRENT_STORE_KEY);
}

export function setCurrentStoreId(storeId: string | null) {
  if (storeId) {
    localStorage.setItem(CURRENT_STORE_KEY, storeId);
  } else {
    localStorage.removeItem(CURRENT_STORE_KEY);
  }
  notify();
}

/** 订阅当前门店变化 */
export function subscribeStoreContext(listener: () => void) {
  window.addEventListener(STORE_CONTEXT_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(STORE_CONTEXT_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

export { STORE_CONTEXT_EVENT };
