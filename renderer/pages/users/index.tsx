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
import UserForm from "@/components/userForm";
import DefaultLayout from "@/layouts/default";
import Head from "next/head";
import type { User } from "@/types/schema";
import * as dbApi from "@/utils/api";

const useDbUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refresh = async () => {
    setLoading(true);
    setError(null);
    const res = await dbApi.getAll<User>("user");
    if (res.success) setUsers(res.data);
    else if ("error" in res) setError(res.error);
    setLoading(false);
  };
  useEffect(() => {
    refresh();
  }, []);
  return { users, loading, error, refresh };
};

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [selectionMode, setSelectionMode] = useState<"none" | "single" | "multiple">("single");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { users, loading, error, refresh } = useDbUsers();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const {
    isOpen: isDeleteConfirmOpen,
    onOpen: onDeleteConfirmOpen,
    onOpenChange: onDeleteConfirmOpenChange,
  } = useDisclosure();

  const filteredList = useMemo(() => {
    let filtered = users;
    if (search.trim()) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          (u.name?.toLowerCase() || "").includes(s) ||
          (u.email?.toLowerCase() || "").includes(s) ||
          (u.role?.toLowerCase() || "").includes(s)
      );
    }
    return filtered;
  }, [users, search]);

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

  const openEditModal = (user: User) => {
    setEditingUser(user);
    onOpen();
  };

  const openNewModal = () => {
    setEditingUser(null);
    onOpen();
  };

  const openDeleteConfirm = (user: User) => {
    setDeletingUser(user);
    onDeleteConfirmOpen();
  };

  const handleDelete = async () => {
    if (deletingUser) {
      const res = await dbApi.remove("user", deletingUser.id);
      if (!res.success && "error" in res) alert("Erreur: " + res.error);
      else await refresh();
      onDeleteConfirmOpenChange();
    }
  };

  return (
    <DefaultLayout>
      <Head>
        <title>Utilisateurs - Nextron (with-next-ui)</title>
      </Head>

      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold mb-2">Utilisateurs</h1>
        <section className="flex gap-4 items-end">
          <Input
            labelPlacement="outside"
            placeholder="Recherche (nom, email, rôle)"
            startContent={
              <SearchIcon className="text-2xl text-default-400 pointer-events-none shrink-0" />
            }
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button color="primary" onPress={openNewModal}>
            Nouvel utilisateur
          </Button>
        </section>
        {error && <div className="text-red-500">Erreur: {error}</div>}
        <Table
          aria-label="Liste des utilisateurs"
          selectionMode={selectionMode}
          showSelectionCheckboxes={false}
        >
          <TableHeader>
            <TableColumn>ID</TableColumn>
            <TableColumn>Nom</TableColumn>
            <TableColumn>Email</TableColumn>
            <TableColumn>Rôle</TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody isLoading={loading} emptyContent={"Aucun utilisateur à afficher"}>
            {filteredList.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.id}</TableCell>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      color="primary"
                      size="sm"
                      onPress={() => openEditModal(u)}
                    >
                      Edit
                    </Button>
                    <Button
                      color="danger"
                      size="sm"
                      onPress={() => openDeleteConfirm(u)}
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
                    {editingUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
                  </h2>
                </ModalHeader>
                <ModalBody>
                  <UserForm
                    initial={editingUser}
                    onCancel={() => onClose()}
                    onSubmit={async (payload) => {
                      const res = editingUser
                        ? await dbApi.update<User>("user", editingUser.id, payload)
                        : await dbApi.create<User>("user", payload);
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
                    Êtes-vous sûr de vouloir supprimer l'utilisateur #
                    {deletingUser?.id}?
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
