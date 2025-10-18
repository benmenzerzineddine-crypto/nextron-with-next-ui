"use client";
import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  Tabs,
  Tab,
} from "@nextui-org/react";
import { SearchIcon } from "@/components/icons";
import MovementForm from "@/components/movementForm";
import DefaultLayout from "@/layouts/default";
import Head from "next/head";
import type { StockMovement, Item, User } from "@/types/schema";
import * as dbApi from "@/utils/api";

const useDbMovements = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refresh = async () => {
    setLoading(true);
    setError(null);
    const res = await dbApi.getAll<StockMovement>("stockmovement");
    if (res.success) setMovements(res.data);
    else if ("error" in res) setError(res.error);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);
  return { movements, loading, error, refresh };
};

const useDbItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const refresh = async () => {
    const res = await dbApi.getAll<Item>("item");
    if (res.success) setItems(res.data);
  };
  useEffect(() => { refresh(); }, []);
  return { items, refresh };
};

const useDbUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const refresh = async () => {
    const res = await dbApi.getAll<User>("user");
    if (res.success) setUsers(res.data);
  };
  useEffect(() => { refresh(); }, []);
  return { users, refresh };
};

export default function MouvementsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("TOUS");
  const [selectionMode, setSelectionMode] = useState<"none" | "single" | "multiple">("single");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { movements, loading, error, refresh } = useDbMovements();
  const { items } = useDbItems();
  const { users } = useDbUsers();
  const [editingMovement, setEditingMovement] = useState<StockMovement | null>(null);
  const [deletingMovement, setDeletingMovement] = useState<StockMovement | null>(null);
  const {
    isOpen: isDeleteConfirmOpen,
    onOpen: onDeleteConfirmOpen,
    onOpenChange: onDeleteConfirmOpenChange,
  } = useDisclosure();

  const filteredList = useMemo(() => {
    let filtered = movements;
    if (typeFilter !== "TOUS") {
      filtered = filtered.filter((m) => m.type === typeFilter);
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          String(m.item_id).includes(s) ||
          String(m.quantity).includes(s) ||
          (m.notes?.toLowerCase() || "").includes(s)
      );
    }
    return filtered;
  }, [search, typeFilter, movements]);

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

  const openEditModal = (movement: StockMovement) => {
    setEditingMovement(movement);
    onOpen();
  };

  const openNewModal = () => {
    setEditingMovement(null);
    onOpen();
  };

  const openDeleteConfirm = (movement: StockMovement) => {
    setDeletingMovement(movement);
    onDeleteConfirmOpen();
  };

  const handleDelete = async () => {
    if (deletingMovement) {
      const res = await dbApi.remove("stockmovement", deletingMovement.id);
      if (!res.success && "error" in res) alert("Erreur: " + res.error);
      else await refresh();
      onDeleteConfirmOpenChange();
    }
  };

  return (
    <DefaultLayout>
      <Head>
        <title>Mouvements de stock - Nextron (with-next-ui)</title>
      </Head>

      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold mb-2">Mouvements de stock</h1>
        <Tabs
          fullWidth
          aria-label="Filtrer par type"
          variant="solid"
          selectedKey={typeFilter}
          onSelectionChange={(key) => setTypeFilter(String(key))}
          className="mb-2"
        >
          <Tab key="TOUS" title="TOUS" />
          <Tab key="IN" title="Entrée (IN)" />
          <Tab key="OUT" title="Sortie (OUT)" />
        </Tabs>
        <section className="flex gap-4 items-end">
          <Input
            labelPlacement="outside"
            placeholder="Recherche (article, quantité, notes)"
            startContent={<SearchIcon className="text-2xl text-default-400 pointer-events-none shrink-0" />}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button color="primary" onPress={openNewModal}>
            Nouveau mouvement
          </Button>
        </section>
        {error && <div className="text-red-500">Erreur: {error}</div>}
        <Table
          aria-label="Liste des mouvements de stock"
          selectionMode={selectionMode}
          showSelectionCheckboxes={false}
        >
          <TableHeader>
            <TableColumn>ID</TableColumn>
            <TableColumn>Article</TableColumn>
            <TableColumn>SKU</TableColumn>
            <TableColumn>Type</TableColumn>
            <TableColumn>Quantité</TableColumn>
            <TableColumn>Weight</TableColumn>
            <TableColumn>Date</TableColumn>
            <TableColumn>Notes</TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody isLoading={loading} emptyContent={"Aucun mouvement à afficher"}>
            {filteredList.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{m.id}</TableCell>
                <TableCell>{m.Item?.name}</TableCell>
                <TableCell>{m.Item?.sku}</TableCell>
                <TableCell>{m.type}</TableCell>
                <TableCell>{m.quantity}</TableCell>
                <TableCell>{m.weight}</TableCell>
                <TableCell>{new Date(m.date).toLocaleString()}</TableCell>
                <TableCell>{m.notes ?? ""}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      color="primary"
                      size="sm"
                      onPress={() => openEditModal(m)}
                    >
                      Edit
                    </Button>
                    <Button
                      color="danger"
                      size="sm"
                      onPress={() => openDeleteConfirm(m)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Modal size="2xl" isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  {editingMovement ? "Modifier le mouvement" : "Nouveau mouvement"}
                </ModalHeader>
                <ModalBody>
                  <MovementForm
                    initial={editingMovement}
                    items={items}
                    users={users}
                    onCancel={() => onClose()}
                    onSubmit={async (payload) => {
                      const res = editingMovement
                        ? await dbApi.update<StockMovement>(
                            "stockmovement",
                            editingMovement.id,
                            payload
                          )
                        : await dbApi.create<StockMovement>("stockmovement", payload);
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
                    Êtes-vous sûr de vouloir supprimer le mouvement #
                    {deletingMovement?.id}?
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