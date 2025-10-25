import React from "react";
import { Input, Button } from "@nextui-org/react";
import type { Supplier } from "../types/schema";

export default function SupplierForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<Supplier>;
  onSubmit?: (s: Partial<Supplier>) => void;
  onCancel?: () => void;
}) {
  const [name, setName] = React.useState(initial?.name ?? "");
  const [shortName, setShortName] = React.useState(initial?.shortName ?? "");
  const [origine, setOrigine] = React.useState(initial?.origine ?? "");

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name) return alert("Nom requis");
    onSubmit?.({ ...initial, name, shortName, origine });
  };

  return (
    <form className="w-full max-w-2xl p-4 space-y-4" onSubmit={handleSubmit}>
      <Input label="Nom" name="name" value={name} onChange={(e: any) => setName(e.target.value)} isRequired />
      <Input label="Nom court" name="shortName" value={shortName} onChange={(e: any) => setShortName(e.target.value)} />
      <Input label="Origine" name="origine" value={origine} onChange={(e: any) => setOrigine(e.target.value)} />

      <div className="flex gap-2 justify-end">
        <Button type="button" color="default" onPress={onCancel}>Annuler</Button>
        <Button type="submit" color="primary">Enregistrer</Button>
      </div>
    </form>
  );
}
