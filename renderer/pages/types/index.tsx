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
import TypeForm from "@/components/typeForm";
import DefaultLayout from "@/layouts/default";
import Head from "next/head";
import type { Type } from "@/types/schema";
import * as dbApi from "@/utils/api";

const useDbTypes = () => {
  const [types, setTypes] = useState<Type[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refresh = async () => {
    setLoading(true);
    setError(null);
    const res = await dbApi.getAll<Type>("type");
    if (res.success) setTypes(res.data);
    else if ("error" in res) setError(res.error);
    setLoading(false);
  };
  useEffect(() => {
    refresh();
  }, []);
  return { types, loading, error, refresh };
};

export default function TypesPage() {
  const [search, setSearch] = useState("");
  const [selectionMode, setSelectionMode] = useState<"none" | "single" | "multiple">("single");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { types, loading, error, refresh } = useDbTypes();
  const [editingType, setEditingType] = useState<Type | null>(null);
  const [deletingType, setDeletingType] = useState<Type | null>(null);
  const {
    isOpen: isDeleteConfirmOpen,
    onOpen: onDeleteConfirmOpen,
    onOpenChange: onDeleteConfirmOpenChange,
  } = useDisclosure();

  const filteredList = useMemo(() => {
    let filtered = types;
    if (search.trim()) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          (t.name?.toLowerCase() || "").includes(s) ||
          (t.description?.toLowerCase() || "").includes(s)
      );
    }
    return filtered;
  }, [types, search]);

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

  const openEditModal = (type: Type) => {
    setEditingType(type);
    onOpen();
  };

  const openNewModal = () => {
    setEditingType(null);
    onOpen();
  };

  const openDeleteConfirm = (type: Type) => {
    setDeletingType(type);
    onDeleteConfirmOpen();
  };

  const handleDelete = async () => {
    if (deletingType) {
      const res = await dbApi.remove("type", deletingType.id);
      if (!res.success && "error" in res) alert("Erreur: " + res.error);
      else await refresh();
      onDeleteConfirmOpenChange();
    }
  };

  return (
    <DefaultLayout>
      <Head>
        <title>Types - Nextron (with-next-ui)</title>
      </Head>

      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold mb-2">Types</h1>
        <section className="flex gap-4 items-end">
          <Input
            labelPlacement="outside"
            placeholder="Recherche (nom, description)"
            startContent={
              <SearchIcon className="text-2xl text-default-400 pointer-events-none shrink-0" />
            }
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button color="primary" onPress={openNewModal}>
            Nouveau type
          </Button>
        </section>
        {error && <div className="text-red-500">Erreur: {error}</div>}
        <Table
          aria-label="Liste des types"
          selectionMode={selectionMode}
          showSelectionCheckboxes={false}
        >
          <TableHeader>
            <TableColumn>N°</TableColumn>
            <TableColumn>Nom</TableColumn>
            <TableColumn>Description</TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody isLoading={loading} emptyContent={"Aucun type à afficher"}>
            {filteredList.map((t,i) => (
              <TableRow key={t.id}>
                <TableCell>{++i}</TableCell>
                <TableCell>{t.name}</TableCell>
                <TableCell>{t.description}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      color="primary"
                      size="sm"
                      onPress={() => openEditModal(t)}
                    >
                      Edit
                    </Button>
                    <Button
                      color="danger"
                      size="sm"
                      onPress={() => openDeleteConfirm(t)}
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
                    {editingType ? "Modifier le type" : "Nouveau type"}
                  </h2>
                </ModalHeader>
                <ModalBody>
                  <TypeForm
                    initial={editingType}
                    onCancel={() => onClose()}
                    onSubmit={async (payload) => {
                      const res = editingType
                        ? await dbApi.update<Type>("type", editingType.id, payload)
                        : await dbApi.create<Type>("type", payload);
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
                    Êtes-vous sûr de vouloir supprimer le type #
                    {deletingType?.id}?
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
