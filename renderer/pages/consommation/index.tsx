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
import ReceptionForm from "@/components/receptionForm";
import DefaultLayout from "@/layouts/default";
import Head from "next/head";
import type { StockMovement } from "@/types/schema";

const mockConsommation: StockMovement[] = [
  {
    id: 2,
    item_id: 2,
    item: {
      id: 2,
      created_at: "2025-10-02T10:00:00Z",
      updated_at: "2025-10-10T12:00:00Z",
      name: "Papier couché brillant A2",
      type_id: 2,
      type: { id: 2, name: "PAPIER COUCHÉ", description: "Papier couché", items: [] },
      description: "Papier couché brillant A2",
      sku: "COUCHE-002",
      supplier_id: 2,
      supplier: { id: 2, name: "France Papier", origine: "FR", items: [] },
      weight: 34.5,
      height: 100,
      grammage: 115,
      current_quantity: 300,
      locationid: 2,
      location: { id: 2, name: "Entrepôt B", description: "Secondaire", items: [] },
    },
    type: "OUT",
    quantity: 50,
    weight: 34.5,
    date: "2025-10-11T11:00:00Z",
    user_id: 2,
    notes: "Consommation atelier",
  },
  {
    id: 3,
    item_id: 1,
    item: {
      id: 1,
      created_at: "2025-10-01T10:00:00Z",
      updated_at: "2025-10-10T12:00:00Z",
      name: "Papier brun haute résistance",
      type_id: 1,
      type: { id: 1, name: "KRAFT", description: "Papier kraft", items: [] },
      description: "Papier brun haute résistance",
      sku: "KRAFT-001",
      supplier_id: 1,
      supplier: { id: 1, name: "Algérie Papier", origine: "DZ", items: [] },
      weight: 45,
      height: 120,
      grammage: 90,
      current_quantity: 500,
      locationid: 1,
      location: { id: 1, name: "Entrepôt A", description: "Principal", items: [] },
    },
    type: "OUT",
    quantity: 20,
    weight: 12,
    date: "2025-10-12T12:00:00Z",
    user_id: 1,
  },
];

export default function ConsommationPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("TOUS");
  const [selectionMode, setSelectionMode] = useState<"none" | "single" | "multiple">("single");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const filteredList = useMemo(() => {
    let filtered = mockConsommation;
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
  }, [search, typeFilter]);

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

    return (
        <DefaultLayout>
            <Head>
                <title>Home - Nextron (with-next-ui)</title>
            </Head>

    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold mb-2">Consommation</h1>
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
        <Button color="primary" onPress={onOpen}>
          Nouvelle consommation
        </Button>
      </section>
      <Table
        aria-label="Liste des consommations"
        selectionMode={selectionMode}
        showSelectionCheckboxes={false}
      >
        <TableHeader>
          <TableColumn>ID</TableColumn>
          <TableColumn>Article</TableColumn>
          <TableColumn>Type</TableColumn>
          <TableColumn>Quantité</TableColumn>
          <TableColumn>Poids (kg)</TableColumn>
          <TableColumn>Date</TableColumn>
          <TableColumn>Utilisateur</TableColumn>
          <TableColumn>Notes</TableColumn>
        </TableHeader>
        <TableBody>
          {filteredList.map((m) => (
            <TableRow key={m.id}>
              <TableCell>{m.id}</TableCell>
              <TableCell>{m.item.name}</TableCell>
              <TableCell>{m.item.type.name}</TableCell>
              <TableCell>{m.quantity}</TableCell>
              <TableCell>{m.weight ?? "-"}</TableCell>
              <TableCell>{new Date(m.date).toLocaleString()}</TableCell>
              <TableCell>{m.user_id ?? "-"}</TableCell>
              <TableCell>{m.notes ?? ""}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Modal size="2xl" isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Nouvelle consommation
              </ModalHeader>
              <ModalBody>
                {/* TODO: Add Consommation form here */}
                <div>Formulaire de consommation à venir…</div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
        </DefaultLayout>
    );
}