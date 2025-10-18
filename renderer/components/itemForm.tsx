import React from "react";
import { Input, Button, Select, SelectItem } from "@nextui-org/react";
import type { Item, Type, Supplier, Location } from "../types/schema";

export default function ItemForm({
  initial,
  types = [],
  suppliers = [],
  locations = [],
  onSubmit,
  onCancel,
}: {
  initial?: Partial<Item>;
  types?: Partial<Type>[];
  suppliers?: Partial<Supplier>[];
  locations?: Partial<Location>[];
  onSubmit?: (s: Partial<Item>) => void;
  onCancel?: () => void;
}) {
  const [name, setName] = React.useState(initial?.name ?? "");
  const [description, setDescription] = React.useState(initial?.description ?? "");
  const [sku, setSku] = React.useState(initial?.sku ?? "");
  const [typeId, setTypeId] = React.useState<string | undefined>(initial?.Type?.id ? String(initial.Type.id) : undefined);
  const [supplierId, setSupplierId] = React.useState<string | undefined>(initial?.Supplier?.id ? String(initial.Supplier.id) : undefined);
  const [locationId, setLocationId] = React.useState<string | undefined>(initial?.Location?.id ? String(initial.Location.id) : undefined);
  const [height, setHeight] = React.useState<string | undefined>(initial?.height ? String(initial.height) : undefined);
  const [grammage, setGrammage] = React.useState<string | undefined>(initial?.grammage ? String(initial.grammage) : undefined);
  const [currentQuantity, setCurrentQuantity] = React.useState<string | undefined>("0");

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name || !sku) return alert("Nom et SKU requis");
    onSubmit?.({
      ...initial,
      name,
      description,
      sku,
  // Associations are passed as partial objects with just the id.
  Type: typeId ? ({ id: Number(typeId) } as unknown as Type) : undefined,
  Supplier: supplierId ? ({ id: Number(supplierId) } as unknown as Supplier) : undefined,
  Location: locationId ? ({ id: Number(locationId) } as unknown as Location) : undefined,
      height: height ? Number(height) : undefined,
      grammage: grammage ? Number(grammage) : undefined,
    });
  };

  return (
    <form className="w-full max-w-4xl p-4 space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input label="Nom" name="name" value={name} onChange={(e: any) => setName(e.target.value)} isRequired />
        <Input label="SKU" name="sku" value={sku} onChange={(e: any) => setSku(e.target.value)} isRequired />
        <Select label="Type" name="type_id" selectedKeys={typeId ? new Set([typeId]) : new Set()} onSelectionChange={(s) => setTypeId(Array.from(s as Set<string>)[0])}>
          {types.map((t) => (
            <SelectItem key={String(t.id)}>{t.name}</SelectItem>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Select label="Fournisseur" name="supplier_id" selectedKeys={supplierId ? new Set([supplierId]) : new Set()} onSelectionChange={(s) => setSupplierId(Array.from(s as Set<string>)[0])}>
          {suppliers.map((s) => (
            <SelectItem key={String(s.id)}>{s.name}</SelectItem>
          ))}
        </Select>
        <Select label="Emplacement" name="location_id" selectedKeys={locationId ? new Set([locationId]) : new Set()} onSelectionChange={(s) => setLocationId(Array.from(s as Set<string>)[0])}>
          {locations.map((l) => (
            <SelectItem key={String(l.id)}>{l.name}</SelectItem>
          ))}
        </Select>
        <Input label="Hauteur (cm)" name="height" type="number" value={height ?? ""} onChange={(e: any) => setHeight(e.target.value)} />
        <Input label="Grammage (g/m²)" name="grammage" type="number" value={grammage ?? ""} onChange={(e: any) => setGrammage(e.target.value)} />
        <Input label="Quantité actuelle" name="current_quantity" type="number" value={currentQuantity ?? ""} isReadOnly />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" color="default" onPress={onCancel}>Annuler</Button>
        <Button type="submit" color="primary">Enregistrer</Button>
      </div>
    </form>
  );
}
