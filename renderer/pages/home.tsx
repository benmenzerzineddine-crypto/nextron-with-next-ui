"use client";
import { useState, useMemo, useEffect } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Button, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure, Tabs, Tab } from "@nextui-org/react";
import { SearchIcon } from "@/components/icons";
import CommandForm from "@/components/commandForm";
import DefaultLayout from "@/layouts/default";
import Head from "next/head";
import type { Item, Type, Supplier, Location } from "@/types/schema";

const mockItems: Item[] = [
  {
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
  {
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
  // ... add more items as needed
];

const Types = ["TOUS", "KRAFT", "PAPIER COUCHÉ", "TESTLINER-B", "TESTLINER-M"];

export default function HomePage() {
    const [type, setType] = useState("TOUS");
  const [search, setSearch] = useState("");
  const [selectionMode, setSelectionMode] = useState<"none" | "single" | "multiple">("single");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const filteredList = useMemo(() => {
    let filtered = mockItems;
    if (type !== "TOUS") {
      filtered = filtered.filter((item) => item.type.name === type);
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
  }, [type, search]);

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
      <h1 className="text-2xl font-bold mb-2">Stock</h1>
      <Tabs
        fullWidth
        aria-label="Filtrer par type"
        variant="solid"
        selectedKey={type}
        onSelectionChange={key => setType(String(key))}
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
        <Button color="primary" onPress={onOpen}>
          Nouvel article
        </Button>
      </section>
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
        </TableHeader>
        <TableBody>
          {filteredList.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.type.name}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>{item.sku}</TableCell>
              <TableCell>{item.supplier.name}</TableCell>
              <TableCell>{item.weight}</TableCell>
              <TableCell>{item.height}</TableCell>
              <TableCell>{item.grammage}</TableCell>
              <TableCell>{item.current_quantity}</TableCell>
              <TableCell>{item.location.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Modal size="5xl" isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Nouvel article
              </ModalHeader>
              <ModalBody>
                <CommandForm />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
        </DefaultLayout>
    );
}