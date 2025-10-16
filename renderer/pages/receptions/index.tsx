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

type StockMovement = {
  id: number;
  item_id: number;
  item: { id: number; name: string; sku: string; type: string };
  type: "IN" | "OUT";
  quantity: number;
  weight?: number;
  date: string;
  user_id?: number;
  notes?: string;
};

type Reception = {
  id: number;
  mouvements: StockMovement[];
  supplier: string;
  date: string;
  user_id?: number;
  notes?: string;
};

const mockReceptions: Reception[] = [
  {
    id: 1,
    mouvements: [
      {
        id: 1,
        item_id: 1,
        item: {
          id: 1,
          name: "Papier brun haute résistance",
          sku: "KRAFT-001",
          type: "KRAFT",
        },
        type: "IN",
        quantity: 100,
        weight: 45,
        date: "2025-10-10T10:00:00Z",
        user_id: 1,
        notes: "Réception fournisseur",
      },
      {
        id: 2,
        item_id: 2,
        item: {
          id: 2,
          name: "Papier couché brillant A2",
          sku: "COUCHE-002",
          type: "PAPIER COUCHÉ",
        },
        type: "IN",
        quantity: 50,
        weight: 34.5,
        date: "2025-10-10T10:00:00Z",
        user_id: 1,
        notes: "Réception partielle",
      },
    ],
    supplier: "Algérie Papier",
    date: "2025-10-10T10:00:00Z",
    user_id: 1,
    notes: "Réception fournisseur",
  },
  {
    id: 2,
    mouvements: [
      {
        id: 3,
        item_id: 3,
        item: {
          id: 3,
          name: "Papier testliner blanc",
          sku: "TESTB-003",
          type: "TESTLINER-B",
        },
        type: "IN",
        quantity: 200,
        weight: 70,
        date: "2025-10-13T09:00:00Z",
        user_id: 2,
        notes: "Réapprovisionnement",
      },
    ],
    supplier: "France Papier",
    date: "2025-10-13T09:00:00Z",
    user_id: 2,
    notes: "Réapprovisionnement",
  },
];
export default function StockPage() {
    const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("TOUS");
  const [selectionMode, setSelectionMode] = useState<
    "none" | "single" | "multiple"
  >("single");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const filteredList = useMemo(() => {
    let filtered = mockReceptions;
    if (typeFilter !== "TOUS") {
      filtered = filtered.filter((r) =>
        r.mouvements.some((m) => m.type === typeFilter)
      );
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.mouvements.some((m) => String(m.quantity).includes(s)) ||
          (
            r.notes?.toLowerCase() ||
            r.supplier.toLocaleLowerCase() ||
            String(r.id) ||
            ""
          ).includes(s)
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

  const CalculateQty = (mouvements: StockMovement[]) => {
    return mouvements.reduce((acc, m) => acc + m.quantity, 0);
  };
    return (
        <DefaultLayout>
            <Head>
                <title>Home - Nextron (with-next-ui)</title>
            </Head>

  <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold mb-2">Bons de réception</h1>
      <section className="flex gap-4 items-end">
        <Input
          labelPlacement="outside"
          placeholder="Recherche (article, quantité, notes)"
          startContent={
            <SearchIcon className="text-2xl text-default-400 pointer-events-none shrink-0" />
          }
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button color="primary" onPress={onOpen}>
          Nouveau bon de réception
        </Button>
      </section>
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
        </TableHeader>
        <TableBody>
          {filteredList.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.id}</TableCell>
              <TableCell>{r.supplier}</TableCell>
              <TableCell>{CalculateQty(r.mouvements)}</TableCell>
              <TableCell>{new Date(r.date).toLocaleString()}</TableCell>
              <TableCell>{r.user_id ?? "-"}</TableCell>
              <TableCell>{r.notes ?? ""}</TableCell>
            </TableRow>
          ))}
          
        </TableBody>
      </Table>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="5xl">
        <ModalContent>
          <ModalHeader>
            <h2 className="text-xl font-bold">Nouveau bon de réception</h2>
          </ModalHeader>
          <ModalBody>
            <ReceptionForm/>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
        </DefaultLayout>
    );
}
