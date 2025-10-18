import React from "react";
import { Input, Button, Select, SelectItem } from "@nextui-org/react";
import type { User } from "../types/schema";

export default function UserForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<User>;
  onSubmit?: (s: Partial<User>) => void;
  onCancel?: () => void;
}) {
  const [name, setName] = React.useState(initial?.name ?? "");
  const [email, setEmail] = React.useState(initial?.email ?? "");
  const [role, setRole] = React.useState<User['role']>(initial?.role ?? "staff");

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name || !email) return alert("Nom et email requis");
    onSubmit?.({ ...initial, name, email, role });
  };

  return (
    <form className="w-full max-w-2xl p-4 space-y-4" onSubmit={handleSubmit}>
      <Input label="Nom" name="name" value={name} onChange={(e: any) => setName(e.target.value)} isRequired />
      <Input label="Email" name="email" value={email} onChange={(e: any) => setEmail(e.target.value)} isRequired />
      <Select
        label="Role"
        name="role"
        selectedKeys={new Set([role])}
        onSelectionChange={(s) => {
          const val = Array.from(s as Set<string>)[0] as User['role'];
          setRole(val);
        }}
      >
        <SelectItem key="admin">admin</SelectItem>
        <SelectItem key="staff">staff</SelectItem>
      </Select>

      <div className="flex gap-2 justify-end">
        <Button type="button" color="default" onPress={onCancel}>Annuler</Button>
        <Button type="submit" color="primary">Enregistrer</Button>
      </div>
    </form>
  );
}
