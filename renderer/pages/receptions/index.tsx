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
} from "@nextui-org/react";
import { SearchIcon } from "@/components/icons";
import ReceptionForm from "@/components/receptionForm";
import DefaultLayout from "@/layouts/default";
import Head from "next/head";
import type { Reception, StockMovement, Item, Supplier } from "@/types/schema";
import * as dbApi from "@/utils/api";

const useDbReceptions = () => {
  const [receptions, setReceptions] = useState<Reception[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refresh = async () => {
    setLoading(true);
    setError(null);
    const res = await dbApi.getAll<Reception>("reception");
    if (res.success) setReceptions(res.data);
    else if ("error" in res) setError(res.error);
    setLoading(false);
  };
  useEffect(() => {
    refresh();
  }, []);
  return { receptions, loading, error, refresh };
};

const useDbItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const refresh = async () => {
    const res = await dbApi.getAll<Item>("item");
    if (res.success) setItems(res.data);
  };
  useEffect(() => {
    refresh();
  }, []);
  return { items, refresh };
};

const useDbSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const refresh = async () => {
    const res = await dbApi.getAll<Supplier>("supplier");
    if (res.success) setSuppliers(res.data);
  };
  useEffect(() => {
    refresh();
  }, []);
  return { suppliers, refresh };
};

export default function ReceptionsPage() {
  const [search, setSearch] = useState("");
  const [selectionMode, setSelectionMode] = useState<"none" | "single" | "multiple">("single");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { receptions, loading, error, refresh } = useDbReceptions();
  const { items } = useDbItems();
  const { suppliers } = useDbSuppliers();
  const [editingReception, setEditingReception] = useState<Reception | null>(null);
  const [deletingReception, setDeletingReception] = useState<Reception | null>(null);
  const {
    isOpen: isDeleteConfirmOpen,
    onOpen: onDeleteConfirmOpen,
    onOpenChange: onDeleteConfirmOpenChange,
  } = useDisclosure();

  const filteredList = useMemo(() => {
    let filtered = receptions;
    if (search.trim()) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          (r.Supplier?.name?.toLowerCase() || "").includes(s) ||
          (r.notes?.toLowerCase() || "").includes(s) ||
          String(r.id).includes(s)
      );
    }
    return filtered;
  }, [receptions, search]);

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

  const CalculateQty = (mouvements: StockMovement[]) => {
    if (!mouvements) return 0;
    return mouvements.reduce((acc, m) => acc + m.quantity, 0);
  };

  const openEditModal = (reception: Reception) => {
    setEditingReception(reception);
    onOpen();
  };

  const openNewModal = () => {
    setEditingReception(null);
    onOpen();
  };

  const openDeleteConfirm = (reception: Reception) => {
    setDeletingReception(reception);
    onDeleteConfirmOpen();
  };

  const handleDelete = async () => {
    if (deletingReception) {
      const res = await dbApi.remove("reception", deletingReception.id);
      if (!res.success && "error" in res) alert("Erreur: " + res.error);
      else await refresh();
      onDeleteConfirmOpenChange();
    }
  };

  return (
    <DefaultLayout>
      <Head>
        <title>Receptions - Nextron (with-next-ui)</title>
      </Head>

      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold mb-2">Bons de réception</h1>
        <section className="flex gap-4 items-end">
          <Input
            labelPlacement="outside"
            placeholder="Recherche (fournisseur, notes, id)"
            startContent={
              <SearchIcon className="text-2xl text-default-400 pointer-events-none shrink-0" />
            }
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button color="primary" onPress={openNewModal}>
            Nouveau bon de réception
          </Button>
        </section>
        {error && <div className="text-red-500">Erreur: {error}</div>}
        <Table
          aria-label="Liste des bons de réception"
          selectionMode={selectionMode}
          showSelectionCheckboxes={false}
        >
          <TableHeader>
            <TableColumn>ID</TableColumn>
            <TableColumn>Fournisseur</TableColumn>
            <TableColumn>Quantités</TableColumn>
            <TableColumn>Date</TableColumn>
            <TableColumn>Utilisateur</TableColumn>
            <TableColumn>Notes</TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody isLoading={loading} emptyContent={"Aucune réception à afficher"}>
            {filteredList.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.Supplier?.name ?? "-"}</TableCell>
                <TableCell>{CalculateQty(r.StockMovements)}</TableCell>
                <TableCell>{new Date(r.date).toLocaleString()}</TableCell>
                <TableCell>{r.user_id ?? "-"}</TableCell>
                <TableCell>{r.notes ?? ""}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      color="primary"
                      size="sm"
                      onPress={() => openEditModal(r)}
                    >
                      Edit
                    </Button>
                    <Button
                      color="danger"
                      size="sm"
                      onPress={() => openDeleteConfirm(r)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="5xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>
                  <h2 className="text-xl font-bold">
                    {editingReception
                      ? "Modifier le bon de réception"
                      : "Nouveau bon de réception"}
                  </h2>
                </ModalHeader>
                <ModalBody>
                  <ReceptionForm
                    items={items}
                    suppliers={suppliers}
                    initial={editingReception}
                    onCancel={() => onClose()}
                    onSubmit={async (payload) => {
                      const res = editingReception
                        ? await dbApi.update<Reception>(
                            "reception",
                            editingReception.id,
                            payload
                          )
                        : await dbApi.create<Reception>("reception", payload);
                      if (!res.success && "error" in res)
                        alert("Erreur: " + res.error);
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
                    Êtes-vous sûr de vouloir supprimer la réception #
                    {deletingReception?.id}?
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
