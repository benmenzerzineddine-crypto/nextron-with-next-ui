
import React from "react";
import { Input, Button, Select, SelectItem } from "@nextui-org/react";

export default function CommandForm() {
  const [submitted, setSubmitted] = React.useState<any>(null);

  const Types = ["KRAFT", "PAPIER COUCHÉ", "TESTLINER-B", "TESTLINER-M", "FLOUTING"];

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
          name="type"
          placeholder="Sélectionner le type"
        >
          {Types.map((type) => (
            <SelectItem key={type}>{type}</SelectItem>
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
        <Input
          label="Fournisseur"
          name="supplier"
          placeholder="Nom du fournisseur (optionnel)"
        />
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
        <Input
          label="Emplacement (ID)"
          name="location_id"
          type="number"
          placeholder="ID de l'emplacement (optionnel)"
        />
      </div>
      <Button type="submit" color="primary" className="mt-4 self-end">
        Ajouter commande
      </Button>
    </form>
  );
}

