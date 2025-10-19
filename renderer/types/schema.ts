export interface Item {
  id: number;
  created_at: string; // ISO format recommended
  updated_at: string; // ISO format recommended
  name: string;
  type_id: number;
  Type: Type;
  description?: string;
  sku: string;
  supplier_id?: number;
  Supplier?: Supplier;
  StockMovements?: StockMovement[];
  height: number;
  grammage: number;
  location_id?: number;
  Location: Location; // Include full location details
  current_quantity: number;
}

export interface Type {
  id: number;
  name: string;
  description?: string;
  Items: Item[]; // Items of this type
}

export interface StockMovement {
  id: number;
  item_id: number;
  Item: Item; // Include full item details
  type: "IN" | "OUT";
  quantity: number;
  weight?: number; // Optional weight of the movement
  date: string; // ISO format recommended
  user_id?: number;
  notes?: string;
  reception_id?: number;
}
export interface Reception {
  id: number;
  mouvement_id: number;
  StockMovements: StockMovement[]; // Include full movement details
  supplier_id: number;
  Supplier: Supplier;
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
  Items: Item[]; // Items provided by this supplier
}
export interface Location {
  id: number;
  name: string;
  description?: string;
  Items: Item[]; // Items stored in this location
}
