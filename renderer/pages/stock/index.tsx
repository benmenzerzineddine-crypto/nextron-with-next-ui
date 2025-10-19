"use client";
import { useState, useMemo, useEffect } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Button, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure, Tabs, Tab } from "@nextui-org/react";
import { SearchIcon } from "@/components/icons";
import ItemForm from "@/components/itemForm";
import DefaultLayout from "@/layouts/default";
import Head from "next/head";
import type { Item, Type, Supplier, Location, StockMovement } from "@/types/schema";
import * as dbApi from "@/utils/api";

const useDbItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refresh = async () => {
    setLoading(true);
    setError(null);
    const res = await dbApi.getAll<Item>("item");
    if (res.success) setItems(res.data);
    else if ("error" in res) setError(res.error);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);
  return { items, loading, error, refresh };
};

const useDbTypes = () => {
  const [types, setTypes] = useState<Type[]>([]);
  const refresh = async () => {
    const res = await dbApi.getAll<Type>("type");
    if (res.success) setTypes(res.data);
  };
  useEffect(() => { refresh(); }, []);
  return { types, refresh };
};

const useDbSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const refresh = async () => {
    const res = await dbApi.getAll<Supplier>("supplier");
    if (res.success) setSuppliers(res.data);
  };
  useEffect(() => { refresh(); }, []);
  return { suppliers, refresh };
};

const useDbLocations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const refresh = async () => {
    const res = await dbApi.getAll<Location>("location");
    if (res.success) setLocations(res.data);
  };
  useEffect(() => { refresh(); }, []);
  return { locations, refresh };
};

export default function StockPage() {
  const [type, setType] = useState("TOUS");
  const [search, setSearch] = useState("");
  const [selectionMode, setSelectionMode] = useState<"none" | "single" | "multiple">("single");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { items, loading, error, refresh } = useDbItems();
  const { types } = useDbTypes();
  const { suppliers } = useDbSuppliers();
  const { locations } = useDbLocations();
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);
  const {
    isOpen: isDeleteConfirmOpen,
    onOpen: onDeleteConfirmOpen,
    onOpenChange: onDeleteConfirmOpenChange,
  } = useDisclosure();

  const filteredList = useMemo(() => {
    let filtered = items;
    if (type !== "TOUS") {
      filtered = filtered.filter((item) => item.Type.name === type);
    }
    if (search.trim() !== "") {
      const s = search.toLocaleLowerCase();
      filtered = filtered.filter(
        (item) =>
          (item.name?.toLocaleLowerCase() || "").includes(s) ||
          (item.description?.toLocaleLowerCase() || "").includes(s) ||
          (item.sku?.toLocaleLowerCase() || "").includes(s)
      );
    }
    console.log(filtered)
    return filtered;
  }, [type, search, items]);

  useEffect(() => {
    const handleKeyDown = () => setSelectionMode("multiple");
    const handleKeyUp = () => setSelectionMode("single");
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const openEditModal = (item: Item) => {
    setEditingItem(item);
    onOpen();
  };

  const openNewModal = () => {
    setEditingItem(null);
    onOpen();
  };

  const openDeleteConfirm = (item: Item) => {
    setDeletingItem(item);
    onDeleteConfirmOpen();
  };

  const handleDelete = async () => {
    if (deletingItem) {
      const res = await dbApi.remove("item", deletingItem.id);
      if (!res.success && "error" in res) alert("Erreur: " + res.error);
      else await refresh();
      onDeleteConfirmOpenChange();
    }
  };

  const CalculateQty = (mouvements: StockMovement[]) => {
    return mouvements.reduce((acc, m) => acc + m.quantity, 0);
  };
  const CalculateWeight = (mouvements: StockMovement[]) => {
    if (!mouvements) return 0;
    return mouvements.reduce((acc, m) => acc + m.weight, 0);
  };
  return (
    <DefaultLayout>
      <Head>
        <title>Stock - Nextron (with-next-ui)</title>
      </Head>

      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold mb-2">Stock</h1>
        <Tabs
          fullWidth
          aria-label="Filtrer par type"
          variant="solid"
          selectedKey={type}
          onSelectionChange={(key) => setType(String(key))}
          className="mb-2"
        >
          <Tab key="TOUS" title="TOUS" />
          {types.map((t) => (
            <Tab key={t.name} title={t.name} />
          ))}
        </Tabs>
        <section className="flex gap-4 items-end">
          <Input
            labelPlacement="outside"
            placeholder="Recherche (nom, description, SKU)"
            startContent={<SearchIcon className="text-2xl text-default-400 pointer-events-none shrink-0" />}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button color="primary" onPress={openNewModal}>
            Nouvel article
          </Button>
        </section>
        {error && <div className="text-red-500">Erreur: {error}</div>}
        <Table
          aria-label="Liste des articles (bobines)"
          selectionMode={selectionMode}
          showSelectionCheckboxes={false}
        >
          <TableHeader>
            <TableColumn>ID</TableColumn>
            <TableColumn>Nom</TableColumn>
            <TableColumn>Type</TableColumn>
            <TableColumn>Description</TableColumn>
            <TableColumn>SKU</TableColumn>
            <TableColumn>Fournisseur</TableColumn>
            <TableColumn>Largeur (cm)</TableColumn>
            <TableColumn>Grammage (g/m²)</TableColumn>
            <TableColumn>Quantité</TableColumn>
            <TableColumn>Poid</TableColumn>
            <TableColumn>Emplacement</TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody isLoading={loading} emptyContent={"Aucun article à afficher"}>
            {filteredList.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.Type?.name}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.sku}</TableCell>
                <TableCell>{item.Supplier?.name}</TableCell>
                <TableCell>{item.height}</TableCell>
                <TableCell>{item.grammage}</TableCell>
                <TableCell>{CalculateQty(item.StockMovements)}</TableCell>
                <TableCell>{CalculateWeight(item.StockMovements)}</TableCell>
                <TableCell>{item.Location?.name}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      color="primary"
                      size="sm"
                      onPress={() => openEditModal(item)}
                    >
                      Edit
                    </Button>
                    <Button
                      color="danger"
                      size="sm"
                      onPress={() => openDeleteConfirm(item)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Modal size="5xl" isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  {editingItem ? "Modifier l'article" : "Nouvel article"}
                </ModalHeader>
                <ModalBody>
                  <ItemForm
                    initial={editingItem}
                    types={types}
                    suppliers={suppliers}
                    locations={locations}
                    onCancel={() => onClose()}
                    onSubmit={async (payload) => {
                      if (editingItem) {
                        const res = await dbApi.update<Item>("item", editingItem.id, payload);
                        if (!res.success && "error" in res) alert("Erreur: " + res.error);
                        else await refresh();
                      } else {
                        const res = await dbApi.create<Item>("item", payload);
                        if (res.success) {
                          if (payload.current_quantity && payload.current_quantity > 0) {
                            const mouvementPayload: any = {
                              item_id: res.data.id,
                              type: "IN",
                              quantity: payload.current_quantity,
                              weight: payload.currentWeight ? payload.currentWeight : 0,
                              date: new Date().toISOString(),
                              notes: "Initial Value",
                            };
                            await dbApi.create("stockmovement", mouvementPayload);
                          }
                          await refresh();
                        } else if ("error" in res) {
                          alert("Erreur: " + res.error);
                        }
                      }
                      onClose();
                    }}
                  />
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>
        <Modal
          isOpen={isDeleteConfirmOpen}
          onOpenChange={onDeleteConfirmOpenChange}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>Confirmer la suppression</ModalHeader>
                <ModalBody>
                  <p>
                    Êtes-vous sûr de vouloir supprimer l'article #
                    {deletingItem?.id}?
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button color="default" onPress={onClose}>
                      Annuler
                    </Button>
                    <Button color="danger" onPress={handleDelete}>
                      Supprimer
                    </Button>
                  </div>
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </DefaultLayout>
  );
}