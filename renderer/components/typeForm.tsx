import React from "react";
import { Input, Button } from "@nextui-org/react";
import type { Type } from "../types/schema";

export default function TypeForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<Type>;
  onSubmit?: (s: Partial<Type>) => void;
  onCancel?: () => void;
}) {
  const [name, setName] = React.useState(initial?.name ?? "");
  const [shortName, setShortName] = React.useState(initial?.shortName ?? "");
  const [description, setDescription] = React.useState(initial?.description ?? "");

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name) return alert("Nom requis");
    onSubmit?.({ ...initial, name, shortName, description });
  };

  return (
    <form className="w-full max-w-2xl p-4 space-y-4" onSubmit={handleSubmit}>
      <Input label="Nom" name="name" value={name} onChange={(e: any) => setName(e.target.value)} isRequired />
      <Input label="Nom court" name="shortName" value={shortName} onChange={(e: any) => setShortName(e.target.value)} />
      <Input label="Description" name="description" value={description} onChange={(e: any) => setDescription(e.target.value)} />

      <div className="flex gap-2 justify-end">
        <Button type="button" color="default" onPress={onCancel}>Annuler</Button>
        <Button type="submit" color="primary">Enregistrer</Button>
      </div>
    </form>
  );
}
