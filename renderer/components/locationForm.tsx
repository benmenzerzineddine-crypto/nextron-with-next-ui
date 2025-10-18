import React from "react";
import { Input, Button } from "@nextui-org/react";
import type { Location } from "../types/schema";

export default function LocationForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<Location>;
  onSubmit?: (s: Partial<Location>) => void;
  onCancel?: () => void;
}) {
  const [name, setName] = React.useState(initial?.name ?? "");
  const [description, setDescription] = React.useState(initial?.description ?? "");

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name) return alert("Nom requis");
    onSubmit?.({ ...initial, name, description });
  };

  return (
    <form className="w-full max-w-2xl p-4 space-y-4" onSubmit={handleSubmit}>
      <Input label="Nom" name="name" value={name} onChange={(e: any) => setName(e.target.value)} isRequired />
      <Input label="Description" name="description" value={description} onChange={(e: any) => setDescription(e.target.value)} />

      <div className="flex gap-2 justify-end">
        <Button type="button" color="default" onPress={onCancel}>Annuler</Button>
        <Button type="submit" color="primary">Enregistrer</Button>
      </div>
    </form>
  );
}
