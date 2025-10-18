"use client";
import { useState, useMemo, useEffect } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Button, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure, Tabs, Tab } from "@nextui-org/react";
import { SearchIcon } from "@/components/icons";
import ItemForm from "@/components/itemForm";
import DefaultLayout from "@/layouts/default";
import Head from "next/head";
import type { Item, Type, Supplier, Location } from "@/types/schema";
import * as dbApi from "@/utils/api";

// Items, types, suppliers, locations from DB
const useDbItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refresh = async () => {
    setLoading(true);
    setError(null);
    const res = await dbApi.getAll<Item>("item");
  if (res.success) setItems(res.data);
  else if ('error' in res) setError(res.error);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);
  return { items, loading, error, refresh };
};

const Types = ["TOUS", "KRAFT", "PAPIER COUCHÉ", "TESTLINER-B", "TESTLINER-M"];

export default function StockPage() {
  const [type, setType] = useState("TOUS");
  const [search, setSearch] = useState("");
  const [selectionMode, setSelectionMode] = useState<"none" | "single" | "multiple">("single");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { items, loading, error, refresh } = useDbItems();
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);
  const {
    isOpen: isDeleteConfirmOpen,
    onOpen: onDeleteConfirmOpen,
    onOpenChange: onDeleteConfirmOpenChange,
  } = useDisclosure();

  // Derive options for selects
  const typesOptions = useMemo(() => Array.from(new Map(items.map((it) => [it.Type?.id!, it.Type!])).values()) as Type[], [items]);
  const suppliersOptions = useMemo(() => Array.from(new Map(items.map((it) => [it.Supplier?.id!, it.Supplier!])).values()) as Supplier[], [items]);
  const locationsOptions = useMemo(() => Array.from(new Map(items.map((it) => [it.Location?.id!, it.Location!])).values()) as Location[], [items]);

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

  const handleCalculateQuantity = (movements: any[]) => {
    if (!movements) return 0;
    return movements.reduce((acc, m) => acc + m.quantity, 0);
  };

  const handleCalculateWeight = (movements: any[]) => {
    if (!movements) return 0;
    return movements.reduce((acc, m) => acc + (m.weight || 0), 0);
  }

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
          {Types.map((t) => (
            <Tab key={t} title={t} />
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
            <TableColumn>Poids (kg)</TableColumn>
            <TableColumn>Largeur (cm)</TableColumn>
            <TableColumn>Grammage (g/m²)</TableColumn>
            <TableColumn>Quantité</TableColumn>
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
                <TableCell>{handleCalculateQuantity(item.Mouvements)}</TableCell>
                <TableCell>{item.height}</TableCell>
                <TableCell>{item.grammage}</TableCell>
                <TableCell>{handleCalculateQuantity(item.Mouvements)}</TableCell>
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
                    types={typesOptions}
                    suppliers={suppliersOptions}
                    locations={locationsOptions}
                    onCancel={() => onClose()}
                    onSubmit={async (payload) => {
                      const res = editingItem
                        ? await dbApi.update<Item>("item", editingItem.id, payload)
                        : await dbApi.create<Item>("item", payload);
                      if (!res.success && "error" in res) alert("Erreur: " + res.error);
                      else await refresh();
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