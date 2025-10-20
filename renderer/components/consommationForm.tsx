import React from "react";
import { Button, Input, Autocomplete, AutocompleteItem, Modal, ModalContent, ModalHeader, ModalBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import type { Transaction, StockMovement, Item, Type, Location } from "../types/schema";

type MovementRow = { item_id?: number; quantity: number; weight?: number; };

export default function ConsommationForm({
  initial,
  items = [],
  locations = [],
  onSubmit,
  onCancel,
}: {
  initial?: Partial<Transaction>;
  items?: Item[];
  locations?: Location[];
  onSubmit?: (r: Partial<Transaction>) => void;
  onCancel?: () => void;
}) {
  const [locationId, setLocationId] = React.useState(initial?.location_id);
  const [date, setDate] = React.useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = React.useState(initial?.notes ?? "");
  const [movements, setMovements] = React.useState<MovementRow[]>(
    (initial?.Mouvement?.map((m) => ({ item_id: m.item_id, quantity: m.quantity, weight: (m as any).weight })) as MovementRow[]) ??
      [{ item_id: items[0]?.id, quantity: 0, weight: undefined }]
  );

  const addRow = () => setMovements((s) => [...s, { item_id: items[0]?.id, quantity: 0, weight: undefined }]);
  const removeRow = (idx: number) => setMovements((s) => s.filter((_, i) => i !== idx));
  const updateRow = (idx: number, k: keyof MovementRow, v: any) =>
    setMovements((s) => s.map((r, i) => (i === idx ? { ...r, [k]: v } : r)));

  // Modal state for adding/editing a movement
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [editRow, setEditRow] = React.useState<MovementRow>({ item_id: items[0]?.id, quantity: 1, weight: undefined });

  const openModalForAdd = () => {
    setEditRow({ item_id: items[0]?.id, quantity: 1, weight: undefined });
    setEditingIndex(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (idx: number) => {
    setEditRow(movements[idx]);
    setEditingIndex(idx);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const saveEditRow = () => {
    // basic validation
    if (!editRow.item_id) return alert("Sélectionnez un article");
    if (!editRow.quantity || editRow.quantity <= 0) return alert("Quantité invalide");
    if (editingIndex === null) {
      setMovements((s) => [...s, editRow]);
    } else {
      setMovements((s) => s.map((r, i) => (i === editingIndex ? editRow : r)));
    }
    closeModal();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    // Basic validation
    if (!locationId) return alert("Emplacement est requis");
    if (!date) return alert("Date est requise");
    if (movements.length === 0) return alert("Ajoutez au moins un mouvement");
    for (const m of movements) {
      if (!m.item_id) return alert("Sélectionnez un article pour chaque mouvement");
      if (!m.quantity || m.quantity <= 0) return alert("La quantité doit être > 0");
    }

    const payload: Partial<Transaction> = {
      location_id: locationId,
      date,
      notes,
      type: "CONSOMMATION",
      StockMovements: movements.map((m, i) => ({
        id: i + 1,
        item_id: m.item_id ?? 0,
        type: "OUT",
        quantity: m.quantity,
        weight: m.weight,
        date,
      })) as unknown as StockMovement[],
    };

    onSubmit?.(payload);
  };

  return (
    <form className="w-full max-w-4xl p-6 space-y-6 bg-gray-50 dark:bg-slate-900/40 rounded-lg" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Autocomplete
          label="Emplacement"
          name="location"
          defaultItems={locations.map((s) => ({ key: String(s.id), label: s.name }))}
          selectedKey={locationId ? String(locationId) : ""}
          onSelectionChange={(key) => setLocationId(Number(key))}
          isRequired
        >
          {(item: any) => <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>}
        </Autocomplete>
        <Input label="Date" name="date" type="date" value={date} onChange={(e: any) => setDate(e.target.value)} isRequired />
        <Input label="Notes" name="notes" value={notes} onChange={(e: any) => setNotes(e.target.value)} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Mouvements</h4>
          <div className="flex gap-2">
            <Button type="button" color="secondary" onPress={() => openModalForAdd()}>
              + Ajouter un article
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableColumn>Article</TableColumn>
            <TableColumn>Quantité</TableColumn>
            <TableColumn>Poids (kg)</TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody>
            {movements.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{items.find((it) => it.id === row.item_id)?.name ?? "(personnalisé)"}</TableCell>
                <TableCell>{row.quantity}</TableCell>
                <TableCell>{row.weight ?? ""}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button type="button" color="default" onPress={() => openModalForEdit(idx)}>
                      Éditer
                    </Button>
                    <Button type="button" color="danger" onPress={() => removeRow(idx)}>
                      Suppr
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" color="default" onPress={onCancel}>
          Annuler
        </Button>
        <Button type="submit" color="primary">
          Enregistrer consommation
        </Button>
      </div>
      <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen} size="2xl">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-2">
            <h3 className="text-lg font-medium">{editingIndex === null ? "Ajouter un article" : "Éditer le mouvement"}</h3>
          </ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1 gap-3">
              <Autocomplete
                allowsCustomValue
                className="w-full"
                defaultItems={items.map((it) => ({ key: String(it.id), label: `${it.name} (SKU: ${it.sku})`, id: it.id }))}
                label="Article"
                variant="bordered"
                value={editRow.item_id ? String(editRow.item_id) : ""}
                onValueChange={(val: any) => setEditRow((r) => ({ ...r, item_id: val === "" ? undefined : Number(val) }))}
              >
                {(item: any) => <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>}
              </Autocomplete>

              <div className="grid grid-cols-2 gap-3">
                <Input label="Quantité" type="number" value={String(editRow.quantity ?? "")} onChange={(e: any) => setEditRow((r) => ({ ...r, quantity: Number(e.target.value) }))} />
                <Input label="Poids (kg)" type="number" value={String(editRow.weight ?? "")} onChange={(e: any) => setEditRow((r) => ({ ...r, weight: e.target.value === "" ? undefined : Number(e.target.value) }))} />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" color="default" onPress={closeModal}>
                  Annuler
                </Button>
                <Button type="button" color="primary" onPress={saveEditRow}>
                  Enregistrer
                </Button>
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </form>
  );
}