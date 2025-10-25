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
  DateRangePicker,
  RangeValue,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  SortDescriptor
} from "@nextui-org/react";
import { SearchIcon } from "@/components/icons";
import MovementForm from "@/components/movementForm";
import DefaultLayout from "@/layouts/default";
import Head from "next/head";
import type { StockMovement, Item, User } from "@/types/schema";
import * as dbApi from "@/utils/api";
import { DateValue } from "@react-types/datepicker";
import { getLocalTimeZone } from "@internationalized/date";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import JsExcelTemplate from "js-excel-template";
import { ipcMain, ipcRenderer } from "electron";

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
  const [dateRange, setDateRange] = useState<RangeValue<DateValue> | null>(null);
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
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({ column: "date", direction: "descending" });

  const filteredList = useMemo(() => {
    let filtered = movements;
    if (typeFilter !== "TOUS") {
      filtered = filtered.filter((m) => m.type === typeFilter);
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          String(m.id).includes(s) ||
          (m.Item?.name?.toLowerCase() || "").includes(s) ||
          (m.Item?.sku?.toLowerCase() || "").includes(s) ||
          (m.type?.toLowerCase() || "").includes(s) ||
          String(m.quantity).includes(s) ||
          String(m.weight).includes(s) ||
          new Date(m.date).toLocaleString().toLowerCase().includes(s) ||
          (m.notes?.toLowerCase() || "").includes(s)
      );
    }
    if (dateRange?.start && dateRange?.end) {
        filtered = filtered.filter((m) => {
            const date = new Date(m.date);
            return date >= dateRange.start.toDate(getLocalTimeZone()) && date <= dateRange.end.toDate(getLocalTimeZone());
        });
    }
    const sorted = [...filtered].sort((a, b) => {
      const first = String(sortDescriptor.column).startsWith('Item.') ? a.Item?.[String(sortDescriptor.column).split('.')[1]] : a[sortDescriptor.column as keyof StockMovement];
      const second = String(sortDescriptor.column).startsWith('Item.') ? b.Item?.[String(sortDescriptor.column).split('.')[1]] : b[sortDescriptor.column as keyof StockMovement];
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
    return sorted;
  }, [search, typeFilter, movements, dateRange, sortDescriptor]);

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

  const handleExport = (format: "excel" | "csv" | "json") => {
    const dataToExport = filteredList.map(m => ({
      ID: m.id,
      Article: m.Item?.name,
      SKU: m.Item?.sku,
      Type: m.type,
      Quantité: m.quantity,
      Laise: m.Item?.height,
      Grammage: m.Item?.grammage,
      Poid: m.weight,
      Date: new Date(m.date).toLocaleString(),
      Notes: m.notes ?? "",
    }));

    if (format === "json") {
      const json = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      saveAs(blob, "mouvements.json");
    } else if (format === "csv") {
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, "mouvements.csv");
    } else if (format === "excel") {
     handleGenerate(dataToExport);
    }
  };
 const handleGenerate = async (data:any) => {
    // @ts-ignore
    const filePath = await window?.api?.invoke!("generate-excel",data);
    alert(`Excel file created at: ${filePath}`);
  };
  return (
    <DefaultLayout>
      <Head>
        <title>Mouvements de stock - Nextron (with-next-ui)</title>
      </Head>

      <div className="flex flex-col gap-4">
        <section className="flex justify-between gap-4 items-end">
          <h1 className="text-2xl font-bold mb-2">Mouvements de stock</h1>
          <Dropdown>
            <DropdownTrigger>
              <Button variant="bordered">Export</Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Static Actions">
              <DropdownItem onPress={() => handleExport("excel")}>Export to Excel</DropdownItem>
              <DropdownItem onPress={() => handleExport("csv")}>Export to CSV</DropdownItem>
              <DropdownItem onPress={() => handleExport("json")}>Export to JSON</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </section>
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
          <DateRangePicker 
            value={dateRange}
            onChange={setDateRange}
            size="md"
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
          sortDescriptor={sortDescriptor}
          onSortChange={setSortDescriptor}
        >
          <TableHeader>
            <TableColumn key="id">ID</TableColumn>
            <TableColumn key="Item.name" allowsSorting>Article</TableColumn>
            <TableColumn key="Item.sku" allowsSorting>SKU</TableColumn>
            <TableColumn key="type" allowsSorting>Type</TableColumn>
            <TableColumn key="quantity" allowsSorting>Quantité</TableColumn>
            <TableColumn key="weight" allowsSorting>Poid</TableColumn>
            <TableColumn key="date" allowsSorting>Date</TableColumn>
            <TableColumn key="notes">Notes</TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody isLoading={loading} emptyContent={"Aucun mouvement à afficher"}>
            {filteredList.map((m,i) => (
              <TableRow key={m.id}>
                <TableCell>{++i}</TableCell>
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
