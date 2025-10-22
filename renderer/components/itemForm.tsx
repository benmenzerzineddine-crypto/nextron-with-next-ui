import React from "react";
import { Input, Button, Select, SelectItem, Autocomplete, AutocompleteItem } from "@nextui-org/react";
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
  onSubmit?: (s: Partial<Item> & { currentWeight?: number }) => void;
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
  const [currentQuantity, setCurrentQuantity] = React.useState<string | undefined>(initial?.current_quantity ? String(initial.current_quantity) : "0");
  const [currentWeight, setCurrentWeight] = React.useState<string | undefined>("0");

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name || !sku) return alert("Nom et SKU requis");
    onSubmit?.({
      ...initial,
      name,
      description,
      sku,
      // Associations are passed as partial objects with just the id.
      type_id: Number(typeId),
      supplier_id: Number(supplierId),
      location_id: Number(locationId),
      height: height ? Number(height) : undefined,
      grammage: grammage ? Number(grammage) : undefined,
      current_quantity: currentQuantity ? Number(currentQuantity) : 0,
      currentWeight: currentWeight ? Number(currentWeight) : 0,
    });
  };

  return (
    <form className="w-full max-w-4xl p-4 space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input label="Nom" name="name" value={name} onChange={(e: any) => setName(e.target.value)} isRequired />
        <Input label="SKU" name="sku" value={sku} onChange={(e: any) => setSku(e.target.value)} isRequired />
        <Autocomplete label="Type" name="type_id" selectedKey={typeId} onSelectionChange={(s) => setTypeId(Array.from(s as string)[0])} listboxProps={{emptyContent:"Aucun résultat trouvé."}}>
          {types.map((t) => (
            <AutocompleteItem key={String(t.id)}>{t.name}</AutocompleteItem>
          ))}
        </Autocomplete>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Autocomplete label="Fournisseur" name="supplier_id" selectedKey={supplierId} onSelectionChange={(s) => setSupplierId(s as string)} listboxProps={{emptyContent:"Aucun résultat trouvé."}}>
          {suppliers.map((s) => (
            <AutocompleteItem key={String(s.id)}>{s.name}</AutocompleteItem>
          ))}
        </Autocomplete>
        <Autocomplete label="Emplacement" name="location_id" selectedKey={locationId} onSelectionChange={(s) => setLocationId(Array.from(s as string)[0])} listboxProps={{emptyContent:"Aucun résultat trouvé."}}>
          {locations.map((l) => (
            <AutocompleteItem key={String(l.id)}>{l.name}</AutocompleteItem>
          ))}
        </Autocomplete>
        <Input label="Hauteur (cm)" name="height" type="number" value={height ?? ""} onChange={(e: any) => setHeight(e.target.value)} />
        <Input label="Grammage (g/m²)" name="grammage" type="number" value={grammage ?? ""} onChange={(e: any) => setGrammage(e.target.value)} />
        <Input
          label="Quantité actuelle"
          name="current_quantity"
          type="number"
          value={currentQuantity ?? ""}
          onChange={(e: any) => setCurrentQuantity(e.target.value)}
          isReadOnly={!!initial?.id}
        />
        <Input
          label="Poids actuel (kg)"
          name="current_weight"
          type="number"
          value={currentWeight ?? ""}
          onChange={(e: any) => setCurrentWeight(e.target.value)}
          isReadOnly={!!initial?.id}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" color="default" onPress={onCancel}>Annuler</Button>
        <Button type="submit" color="primary">Enregistrer</Button>
      </div>
    </form>
  );
}