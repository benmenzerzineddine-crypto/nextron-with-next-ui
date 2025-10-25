import React from "react";
import { Autocomplete, AutocompleteItem, Button, Card, CardBody, Input, Select, SelectItem } from "@nextui-org/react";
import type { StockMovement, Item, User } from "../types/schema";

const ItemSelectionForm = ({
  items = [],
  selectedItem,
  onItemSelect,
}: {
  items: Partial<Item>[];
  selectedItem?: Partial<Item>;
  onItemSelect: (item: Partial<Item>) => void;
}) => {
  const [itemId, setItemId] = React.useState<string | undefined>(selectedItem?.id ? String(selectedItem.id) : undefined);

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-end">
        <Autocomplete
        allowsCustomValue
          label="Article"
          placeholder="Rechercher un article"
          selectedKey={itemId}
          onSelectionChange={(key) => {
            const newItemId = key as string;
            setItemId(newItemId);
            const selected = items.find(it => String(it.id) === newItemId);
            if (selected) {
              onItemSelect(selected);
            }
          }}
          listboxProps={{
            emptyContent: "Aucun résultat trouvé.",
          }}
          
        >
          {items.map((it) => (
            <AutocompleteItem textValue={it.sku + it.name} key={String(it.id)}>{it.sku} | {it.name}</AutocompleteItem>
          ))}
        </Autocomplete>
      </div>
      {selectedItem && (
        <Card>
          <CardBody>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-small text-default-500">Référence</p>
                <p>{selectedItem.name}</p>
              </div>
              <div>
                <p className="text-small text-default-500">Type</p>
                <p>{selectedItem.Type?.name}</p>
              </div>
              <div>
                <p className="text-small text-default-500">Stock actuel</p>
                <p>{selectedItem.StockMovements?.reduce((acc, m) => acc + m.quantity, 0) ?? 0
                }</p>
              </div>
              <div>
                <p className="text-small text-default-500">Emplacement</p>
                <p>{selectedItem.Location?.name}</p>
              </div>
              <div>
                <p className="text-small text-default-500">Fournisseur</p>
                <p>{selectedItem.Supplier?.name}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

const MovementDetailsForm = ({
  users = [],
  selectedItem,
  initial,
  onSubmit,
  onBack,
}: {
  users: Partial<User>[];
  selectedItem: Partial<Item>;
  initial?: Partial<StockMovement>;
  onSubmit: (data: Partial<StockMovement>) => void;
  onBack: () => void;
}) => {
  const [userId, setUserId] = React.useState<string | undefined>(initial?.user_id ? String(initial.user_id) : undefined);
  const [type, setType] = React.useState<string>(initial?.type ?? "IN");
  const [quantity, setQuantity] = React.useState<string | undefined>(initial?.quantity ? String(initial.quantity) : undefined);
  const [weight, setWeight] = React.useState<string | undefined>(initial?.weight ? String(initial.weight) : undefined);
  const [date, setDate] = React.useState(initial?.date ? new Date(initial.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = React.useState<string>(initial?.notes || "");

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!quantity) return alert("Quantité requise");
    const movementType = type === "IN" ? "IN" : "OUT";
    const Quantity = (Number(quantity) < 0 ? Number(quantity.split('-')[1]): Number(quantity));
    const Weight = (Number(weight) < 0 ? Number(weight.split('-')[1]): Number(weight))
    const adjustedQuantity = movementType === "IN" ? Quantity: -Number(Quantity);
    const adjustedWeight = movementType === "IN" ? Weight: -Number(Weight);
    onSubmit({
      ...initial,
      item_id: selectedItem.id,
      user_id: userId ? Number(userId) : undefined,
      type: type as StockMovement['type'],
      quantity: adjustedQuantity,
      weight: adjustedWeight,
      date,
      notes,
    });
  };

  // Auto-calculate weight when quantity changes


  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Select label="Type" name="type" selectedKeys={new Set([type])} onSelectionChange={(s) => setType(Array.from(s as Set<string>)[0])}>
          <SelectItem key="IN">IN</SelectItem>
          <SelectItem key="OUT">OUT</SelectItem>
        </Select>
        <Input label="Quantité" name="quantity" type="number" value={quantity ?? ""} onChange={(e: any) => setQuantity(e.target.value)} isRequired />
        <Input label="Poids total (kg)" name="weight" type="number" value={weight ?? ""} onChange={(e: any) => setWeight(e.target.value)} />
      </div>

      <Select label="Utilisateur" name="user_id" selectedKeys={userId ? new Set([userId]) : new Set()} onSelectionChange={(s) => setUserId(Array.from(s as Set<string>)[0])}>
        {users.map((u) => (
          <SelectItem key={String(u.id)}>{u.name}</SelectItem>
        ))}
      </Select>

      <Input label="Date" name="date" type="date" value={date} onChange={(e: any) => setDate(e.target.value)} />
      
      <Input
        label="Notes"
        name="notes"
        placeholder="Notes optionnelles"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div className="flex gap-2 justify-end">
        <Button type="button" color="default" onPress={onBack}>Retour</Button>
        <Button type="submit" color="primary">Enregistrer</Button>
      </div>
    </form>
  );
};

export default function MovementForm({
  initial,
  items = [],
  users = [],
  onSubmit,
  onCancel,
}: {
  initial?: Partial<StockMovement>;
  items?: Partial<Item>[];
  users?: Partial<User>[];
  onSubmit?: (s: Partial<StockMovement>) => void;
  onCancel?: () => void;
}) {
  const [selectedItem, setSelectedItem] = React.useState<Partial<Item> | undefined>(
    initial?.item_id ? items.find(i => i.id === initial.item_id) : undefined
  );
  const [step, setStep] = React.useState<'item' | 'details'>('item');
  console.log(selectedItem)
  return (
    <div className="w-full max-w-2xl p-4 space-y-4">
      {step === 'item' ? (
        <>
          <ItemSelectionForm
            items={items}
            selectedItem={selectedItem}
            onItemSelect={(item) => setSelectedItem(item)}
          />
          <div className="flex gap-2 justify-end">
            <Button color="default" onPress={onCancel}>Annuler</Button>
            <Button 
              color="primary" 
              onPress={() => setStep('details')}
              isDisabled={!selectedItem}
            >
              Suivant
            </Button>
          </div>
        </>
      ) : (
        selectedItem && (
          <MovementDetailsForm
            users={users}
            selectedItem={selectedItem}
            initial={initial}
            onSubmit={(data) => onSubmit?.(data)}
            onBack={() => setStep('item')}
          />
        )
      )}
    </div>
  );
}

