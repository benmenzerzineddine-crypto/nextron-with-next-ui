import React from "react";
import { Input, Button, Select, SelectItem } from "@nextui-org/react";
import type { Type, Supplier, Location } from "../types/schema";

export default function CommandForm() {
  const [submitted, setSubmitted] = React.useState<any>(null);

  const Types: Partial<Type>[] = [{ id: 1, name: "KRAFT" }, { id: 2, name: "PAPIER COUCHÉ" }, { id: 3, name: "TESTLINER-B" }, { id: 4, name: "TESTLINER-M" }, { id: 5, name: "FLOUTING" }];
  const Suppliers: Partial<Supplier>[] = [{ id: 1, name: "Algérie Papier" }, { id: 2, name: "France Papier" }];
  const Locations: Partial<Location>[] = [{ id: 1, name: "Entrepôt A" }, { id: 2, name: "Entrepôt B" }];

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    console.log(data)
    setSubmitted(data);
  };

  return (
    <form className="w-full max-w-5xl py-4 flex flex-col gap-4" onSubmit={onSubmit}>
      <div className="w-full p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
        <Input
          isRequired
          label="Nom"
          name="name"
          placeholder="Nom de l'article"
        />
        <Select
          isRequired
          label="Type"
          name="type_id"
          placeholder="Sélectionner le type"
        >
          {Types.map((type) => (
            <SelectItem key={type.id!}>{type.name}</SelectItem>
          ))}
        </Select>
        <Input
          label="Description"
          name="description"
          placeholder="Description du papier (optionnel)"
        />
        <Input
          isRequired
          label="SKU"
          name="sku"
          placeholder="Code SKU"
        />
        <Select
          label="Fournisseur"
          name="supplier_id"
          placeholder="Nom du fournisseur (optionnel)"
        >
          {Suppliers.map((supplier) => (
            <SelectItem key={supplier.id!}>{supplier.name}</SelectItem>
          ))}
        </Select>
        <Input
          isRequired
          label="Poids (kg)"
          name="weight"
          type="number"
          placeholder="ex: 45"
        />
        <Input
          isRequired
          label="Largeur (cm)"
          name="height"
          type="number"
          placeholder="ex: 120"
        />
        <Input
          isRequired
          label="Grammage (g/m²)"
          name="grammage"
          type="number"
          placeholder="ex: 90"
        />
        <Input
          isRequired
          label="Quantité actuelle"
          name="current_quantity"
          type="number"
          placeholder="ex: 500"
        />
        <Select
          label="Emplacement"
          name="location_id"
          placeholder="ID de l'emplacement (optionnel)"
        >
          {Locations.map((location) => (
            <SelectItem key={location.id!}>{location.name}</SelectItem>
          ))}
        </Select>
      </div>
      <Button type="submit" color="primary" className="mt-4 self-end">
        Ajouter commande
      </Button>
    </form>
  );
}