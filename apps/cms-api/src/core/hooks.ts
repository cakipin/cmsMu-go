// src/core/hooks.ts
type ActionCallback = (params?: any) => void | Promise<void>;
type FilterCallback = (value: any, params?: any) => any | Promise<any>;

class HookSystem {
  private actions: Record<string, ActionCallback[]> = {};
  private filters: Record<string, FilterCallback[]> = {};

  addAction(hookName: string, callback: ActionCallback) {
    if (!this.actions[hookName]) this.actions[hookName] = [];
    this.actions[hookName].push(callback);
  }

  async doAction(hookName: string, params?: any) {
    if (!this.actions[hookName]) return;
    for (const callback of this.actions[hookName]) {
      await callback(params);
    }
  }

  addFilter(hookName: string, callback: FilterCallback) {
    if (!this.filters[hookName]) this.filters[hookName] = [];
    this.filters[hookName].push(callback);
  }

  async applyFilters(hookName: string, value: any, params?: any) {
    if (!this.filters[hookName]) return value;
    let result = value;
    for (const callback of this.filters[hookName]) {
      result = await callback(result, params);
    }
    return result;
  }
}

export const nusaHooks = new HookSystem();
