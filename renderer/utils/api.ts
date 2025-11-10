// Typed CRUD API utility for renderer
type ModelName = 'user' | 'supplier' | 'location' | 'type' | 'item' | 'stockmovement' | 'transaction';

type ApiResult<T> = { success: true; data: T } | { success: false; error: string };

export async function create<T>(model: ModelName, data: any): Promise<ApiResult<T>> {
  const api = (window as any).api;
  if (!api) throw new Error("window.api n'est pas défini");
  return api.invoke(`${model}:create`, data);
}

export async function createConsommation<T>(data: any): Promise<ApiResult<T>> {
  const api = (window as any).api;
  if (!api) throw new Error("window.api n'est pas défini");
  return api.invoke('consommation:create', data);
}
export async function getAll<T>(model: ModelName): Promise<ApiResult<T[]>> {
  const api = (window as any).api;
  if (!api) throw new Error("window.api n'est pas défini");
  return api.invoke(`${model}:getAll`);
}
export async function getById<T>(model: ModelName, id: number): Promise<ApiResult<T>> {
  const api = (window as any).api;
  if (!api) throw new Error("window.api n'est pas défini");
  return api.invoke(`${model}:getById`, id);
}
export async function update<T>(model: ModelName, id: number, data: any): Promise<ApiResult<T>> {
  const api = (window as any).api;
  if (!api) throw new Error("window.api n'est pas défini");
  return api.invoke(`${model}:update`, { id, data });
}
export async function remove(model: ModelName, id: number): Promise<ApiResult<null>> {
  const api = (window as any).api;
  if (!api) throw new Error("window.api n'est pas défini");
  return api.invoke(`${model}:delete`, id);
}

export async function getItemBySku<T>(sku: string): Promise<ApiResult<T>> {
  const api = (window as any).api;
  if (!api) throw new Error("window.api n'est pas défini");
  return api.invoke('item:getBySku', sku);
}

export async function backup(): Promise<ApiResult<{ path: string }>> {
    const api = (window as any).api;
    if (!api) throw new Error("window.api n'est pas défini");
    return api.invoke('db:backup');
}

export async function exportTable(tableName: string): Promise<ApiResult<{ path: string }>> {
    const api = (window as any).api;
    if (!api) throw new Error("window.api n'est pas défini");
    return api.invoke('db:export', tableName);
}

export async function importTable(tableName: string): Promise<ApiResult<null>> {
    const api = (window as any).api;
    if (!api) throw new Error("window.api n'est pas défini");
    return api.invoke('db:import', tableName);
}