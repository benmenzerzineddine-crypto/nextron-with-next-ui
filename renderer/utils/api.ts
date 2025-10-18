
// Typed CRUD API utility for renderer
type ModelName = 'user' | 'supplier' | 'location' | 'type' | 'item' | 'stockmovement' | 'reception';

type ApiResult<T> = { success: true; data: T } | { success: false; error: string };

const api = (window as any).api;


export async function create<T>(model: ModelName, data: any): Promise<ApiResult<T>> {
  return api.invoke(`${model}:create`, data);
}
export async function getAll<T>(model: ModelName): Promise<ApiResult<T[]>> {
  return api.invoke(`${model}:getAll`);
}
export async function getById<T>(model: ModelName, id: number): Promise<ApiResult<T>> {
  return api.invoke(`${model}:getById`, id);
}
export async function update<T>(model: ModelName, id: number, data: any): Promise<ApiResult<T>> {
  return api.invoke(`${model}:update`, { id, data });
}
export async function remove(model: ModelName, id: number): Promise<ApiResult<null>> {
  return api.invoke(`${model}:delete`, id);
}

export async function getItemBySku<T>(sku: string): Promise<ApiResult<T>> {
  return api.invoke('item:getBySku', sku);
}