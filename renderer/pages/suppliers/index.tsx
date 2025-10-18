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
import SupplierForm from "@/components/supplierForm";
import DefaultLayout from "@/layouts/default";
import Head from "next/head";
import type { Supplier } from "@/types/schema";
import * as dbApi from "@/utils/api";

const useDbSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refresh = async () => {
    setLoading(true);
    setError(null);
    const res = await dbApi.getAll<Supplier>("supplier");
    if (res.success) setSuppliers(res.data);
    else if ("error" in res) setError(res.error);
    setLoading(false);
  };
  useEffect(() => {
    refresh();
  }, []);
  return { suppliers, loading, error, refresh };
};

export default function SuppliersPage() {
  const [search, setSearch] = useState("");
  const [selectionMode, setSelectionMode] = useState<"none" | "single" | "multiple">("single");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { suppliers, loading, error, refresh } = useDbSuppliers();
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
  const {
    isOpen: isDeleteConfirmOpen,
    onOpen: onDeleteConfirmOpen,
    onOpenChange: onDeleteConfirmOpenChange,
  } = useDisclosure();

  const filteredList = useMemo(() => {
    let filtered = suppliers;
    if (search.trim()) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          (s.name?.toLowerCase() || "").includes(search) ||
          (s.origine?.toLowerCase() || "").includes(search)
      );
    }
    return filtered;
  }, [suppliers, search]);

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

  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    onOpen();
  };

  const openNewModal = () => {
    setEditingSupplier(null);
    onOpen();
  };

  const openDeleteConfirm = (supplier: Supplier) => {
    setDeletingSupplier(supplier);
    onDeleteConfirmOpen();
  };

  const handleDelete = async () => {
    if (deletingSupplier) {
      const res = await dbApi.remove("supplier", deletingSupplier.id);
      if (!res.success && "error" in res) alert("Erreur: " + res.error);
      else await refresh();
      onDeleteConfirmOpenChange();
    }
  };

  return (
    <DefaultLayout>
      <Head>
        <title>Fournisseurs - Nextron (with-next-ui)</title>
      </Head>

      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold mb-2">Fournisseurs</h1>
        <section className="flex gap-4 items-end">
          <Input
            labelPlacement="outside"
            placeholder="Recherche (nom, origine)"
            startContent={
              <SearchIcon className="text-2xl text-default-400 pointer-events-none shrink-0" />
            }
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button color="primary" onPress={openNewModal}>
            Nouveau fournisseur
          </Button>
        </section>
        {error && <div className="text-red-500">Erreur: {error}</div>}
        <Table
          aria-label="Liste des fournisseurs"
          selectionMode={selectionMode}
          showSelectionCheckboxes={false}
        >
          <TableHeader>
            <TableColumn>ID</TableColumn>
            <TableColumn>Nom</TableColumn>
            <TableColumn>Origine</TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody isLoading={loading} emptyContent={"Aucun fournisseur à afficher"}>
            {filteredList.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.id}</TableCell>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.origine}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      color="primary"
                      size="sm"
                      onPress={() => openEditModal(s)}
                    >
                      Edit
                    </Button>
                    <Button
                      color="danger"
                      size="sm"
                      onPress={() => openDeleteConfirm(s)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>
                  <h2 className="text-xl font-bold">
                    {editingSupplier
                      ? "Modifier le fournisseur"
                      : "Nouveau fournisseur"}
                  </h2>
                </ModalHeader>
                <ModalBody>
                  <SupplierForm
                    initial={editingSupplier}
                    onCancel={() => onClose()}
                    onSubmit={async (payload) => {
                      const res = editingSupplier
                        ? await dbApi.update<Supplier>(
                            "supplier",
                            editingSupplier.id,
                            payload
                          )
                        : await dbApi.create<Supplier>("supplier", payload);
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
                    Êtes-vous sûr de vouloir supprimer le fournisseur #
                    {deletingSupplier?.id}?
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
