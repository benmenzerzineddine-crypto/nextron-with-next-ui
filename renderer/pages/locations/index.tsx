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
import LocationForm from "@/components/locationForm";
import DefaultLayout from "@/layouts/default";
import Head from "next/head";
import type { Location } from "@/types/schema";
import * as dbApi from "@/utils/api";

const useDbLocations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refresh = async () => {
    setLoading(true);
    setError(null);
    const res = await dbApi.getAll<Location>("location");
    if (res.success) setLocations(res.data);
    else if ("error" in res) setError(res.error);
    setLoading(false);
  };
  useEffect(() => {
    refresh();
  }, []);
  return { locations, loading, error, refresh };
};

export default function LocationsPage() {
  const [search, setSearch] = useState("");
  const [selectionMode, setSelectionMode] = useState<"none" | "single" | "multiple">("single");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { locations, loading, error, refresh } = useDbLocations();
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [deletingLocation, setDeletingLocation] = useState<Location | null>(null);
  const {
    isOpen: isDeleteConfirmOpen,
    onOpen: onDeleteConfirmOpen,
    onOpenChange: onDeleteConfirmOpenChange,
  } = useDisclosure();

  const filteredList = useMemo(() => {
    let filtered = locations;
    if (search.trim()) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          (l.name?.toLowerCase() || "").includes(s) ||
          (l.description?.toLowerCase() || "").includes(s)
      );
    }
    return filtered;
  }, [locations, search]);

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

  const openEditModal = (location: Location) => {
    setEditingLocation(location);
    onOpen();
  };

  const openNewModal = () => {
    setEditingLocation(null);
    onOpen();
  };

  const openDeleteConfirm = (location: Location) => {
    setDeletingLocation(location);
    onDeleteConfirmOpen();
  };

  const handleDelete = async () => {
    if (deletingLocation) {
      const res = await dbApi.remove("location", deletingLocation.id);
      if (!res.success && "error" in res) alert("Erreur: " + res.error);
      else await refresh();
      onDeleteConfirmOpenChange();
    }
  };

  return (
    <DefaultLayout>
      <Head>
        <title>Emplacements - Nextron (with-next-ui)</title>
      </Head>

      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold mb-2">Emplacements</h1>
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
            Nouvel emplacement
          </Button>
        </section>
        {error && <div className="text-red-500">Erreur: {error}</div>}
        <Table
          aria-label="Liste des emplacements"
          selectionMode={selectionMode}
          showSelectionCheckboxes={false}
        >
          <TableHeader>
            <TableColumn>ID</TableColumn>
            <TableColumn>Nom</TableColumn>
            <TableColumn>Description</TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody isLoading={loading} emptyContent={"Aucun emplacement à afficher"}>
            {filteredList.map((l) => (
              <TableRow key={l.id}>
                <TableCell>{l.id}</TableCell>
                <TableCell>{l.name}</TableCell>
                <TableCell>{l.description}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      color="primary"
                      size="sm"
                      onPress={() => openEditModal(l)}
                    >
                      Edit
                    </Button>
                    <Button
                      color="danger"
                      size="sm"
                      onPress={() => openDeleteConfirm(l)}
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
                    {editingLocation ? "Modifier l'emplacement" : "Nouvel emplacement"}
                  </h2>
                </ModalHeader>
                <ModalBody>
                  <LocationForm
                    initial={editingLocation}
                    onCancel={() => onClose()}
                    onSubmit={async (payload) => {
                      const res = editingLocation
                        ? await dbApi.update<Location>(
                            "location",
                            editingLocation.id,
                            payload
                          )
                        : await dbApi.create<Location>("location", payload);
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
                    Êtes-vous sûr de vouloir supprimer l'emplacement #
                    {deletingLocation?.id}?
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
