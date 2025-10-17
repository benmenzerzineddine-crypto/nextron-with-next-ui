export interface Item {
  id: number;
  created_at: string; // ISO format recommended
  updated_at: string; // ISO format recommended
  name: string;
  type_id: number;
  type: Type;
  description?: string;
  sku: string;
  supplier_id?: number;
  supplier?: Supplier;
  weight: number;
  height: number;
  grammage: number;
  current_quantity: number;
  locationid?: number;
  location: Location; // Include full location details
}

export interface Type {
  id: number;
  name: string;
  description?: string;
  items: Item[]; // Items of this type
}

export interface StockMovement {
  id: number;
  item_id: number;
  item: Item; // Include full item details
  type: "IN" | "OUT";
  quantity: number;
  weight?: number; // Optional weight of the movement
  date: string; // ISO format recommended
  user_id?: number;
  notes?: string;
}
export interface Reception {
  id: number;
  mouvement_id: number;
  mouvement: StockMovement[]; // Include full movement details
  supplier: string;
  quantity: number;
  date: string; // ISO format recommended
  user_id?: number;
  notes?: string;
}
export interface User {
  id: number;
  name: string;
  role: "admin" | "staff";
  email: string;
  password_hash: string;
}
export interface Supplier {
  id: number;
  name: string;
  origine: string;
  items: Item[]; // Items provided by this supplier
}
export interface Location {
  id: number;
  name: string;
  description?: string;
  items: Item[]; // Items stored in this location
}
