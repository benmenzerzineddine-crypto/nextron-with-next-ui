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
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Selection,
  Card,
  CardBody,
  Accordion,
  AccordionItem,
  Progress,
  ModalFooter,
} from "@nextui-org/react";
import { ChevronDownIcon, SearchIcon } from "@/components/icons";
import ItemForm from "@/components/itemForm";
import DefaultLayout from "@/layouts/default";
import Head from "next/head";
import type {
  Item,
  Type,
  Supplier,
  Location,
  StockMovement,
} from "@/types/schema";
import * as dbApi from "@/utils/api";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import StockDoc from "@/components/StockDoc";
import { PDFViewer } from "@react-pdf/renderer";

const useDbItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refresh = async () => {
    setLoading(true);
    setError(null);
    const res = await dbApi.getAll<Item>("item");
    if (res.success) setItems(res.data);
    else if ("error" in res) setError(res.error);
    setLoading(false);
  };
  useEffect(() => {
    refresh();
  }, []);
  return { items, loading, error, refresh };
};

const useDbTypes = () => {
  const [types, setTypes] = useState<Type[]>([]);
  const refresh = async () => {
    const res = await dbApi.getAll<Type>("type");
    if (res.success) setTypes(res.data);
  };
  useEffect(() => {
    refresh();
  }, []);
  return { types, refresh };
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

const useDbLocations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const refresh = async () => {
    const res = await dbApi.getAll<Location>("location");
    if (res.success) setLocations(res.data);
  };
  useEffect(() => {
    refresh();
  }, []);
  return { locations, refresh };
};

export default function StockPage() {
  const [type, setType] = useState("TOUS");
  const [search, setSearch] = useState("");
  const [selectionMode, setSelectionMode] = useState<
    "none" | "single" | "multiple"
  >("single");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { items, loading, error, refresh } = useDbItems();
  const { types } = useDbTypes();
  const { suppliers } = useDbSuppliers();
  const { locations } = useDbLocations();
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);
  const {
    isOpen: isDeleteConfirmOpen,
    onOpen: onDeleteConfirmOpen,
    onOpenChange: onDeleteConfirmOpenChange,
  } = useDisclosure();
  const {
    isOpen: isInfoModalOpen,
    onOpen: onInfoModalOpen,
    onOpenChange: onInfoModalOpenChange,
  } = useDisclosure();

  const {
    isOpen: isPrintModalOpen,
    onOpen: onPrintModalOpen,
    onOpenChange: onPrintModalOpenChange,
  } = useDisclosure();

  const [infoData, setInfoData] = useState<any[]>([]);

  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));

  const filteredList = useMemo(() => {
    let filtered = items;
    if (type !== "TOUS") {
      filtered = filtered.filter((item) => item.Type.name === type);
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
    console.log(filtered);
    return filtered;
  }, [type, search, items]);

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

  const openEditModal = (item: Item) => {
    setEditingItem(item);
    onOpen();
  };

  const openNewModal = () => {
    setEditingItem(null);
    onOpen();
  };

  const openDeleteConfirm = (item: Item) => {
    setDeletingItem(item);
    onDeleteConfirmOpen();
  };

  const handleDelete = async () => {
    if (deletingItem) {
      const res = await dbApi.remove("item", deletingItem.id);
      if (!res.success && "error" in res) alert("Erreur: " + res.error);
      else await refresh();
      onDeleteConfirmOpenChange();
    }
  };

  const CalculateQty = (mouvements: StockMovement[]) => {
    return mouvements.reduce((acc, m) => acc + m.quantity, 0);
  };
  const CalculateWeight = (mouvements: StockMovement[]) => {
    if (!mouvements) return 0;
    return mouvements.reduce((acc, m) => acc + m.weight, 0);
  };

  const handleExport = (format: "excel" | "csv" | "json") => {
    const dataToExport = filteredList.map((item, index) => ({
      ID: ++index,
      Nom: item.name,
      Type: item.Type?.name,
      Description: item.description,
      SKU: item.sku,
      Fournisseur: item.Supplier?.name,
      Laise: item.height,
      Grammage: item.grammage,
      Quantité: CalculateQty(item.StockMovements),
      Poid: CalculateWeight(item.StockMovements),
      Emplacement: item.Location?.name,
    }));

    if (format === "json") {
      const json = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      saveAs(blob, "stock.json");
    } else if (format === "csv") {
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, "stock.csv");
    } else if (format === "excel") {
      const args = { file: "Items", data: dataToExport };
      handleGenerate(args);
    }
  };

  const handleGenerate = async (data: any) => {
    // @ts-ignore
    const result = await window?.api?.invoke!("generate-excel", data);
    if (result.success) {
      alert(`Excel file created at: ${result.path}`);
    } else {
      if (result.error !== "Save dialog canceled") {
        alert(`Error creating Excel file: ${result.error}`);
      }
    }
  };

  const handleImport = (format: "excel" | "csv" | "json") => {
    // Import Data From File
    const input = document.createElement("input");
    input.type = "file";
    input.accept =
      format === "excel" ? ".xlsx, .xls" : format === "csv" ? ".csv" : ".json";
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      if (format === "excel" || format === "csv") {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
      reader.onload = async (e) => {
        const data = e.target?.result;
        if (!data) return;
        let importedData: any[] = [];
        if (format === "json") {
          importedData = JSON.parse(data as string);
        } else if (format === "csv" || format === "excel") {
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          importedData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        }

        for (const row of importedData) {
          const type = types.find((t) => t.name === row.Type);
          const supplier = suppliers.find((s) => s.name === row.Fournisseur);
          const location = locations.find((l) => l.name === row.Emplacement);

          const itemPayload = {
            name: row.Nom,
            type_id: type?.id,
            description: row.Description,
            sku: row.SKU,
            supplier_id: supplier?.id,
            height: row.Laise,
            grammage: row.Grammage,
            location_id: location?.id,
          };

          await dbApi.create<Item>("item", itemPayload);
        }
        await refresh();
      };
    };
    input.click();
  };
  useEffect(() => {
    // convert map into array
    const SelectedItems = Array.from(selectedKeys);
    if (SelectedItems.length > 1) {
    }
  }, [selectedKeys]);

  const selectedItems = useMemo(() => {
    if (selectedKeys === "all") {
      return items;
    }
    const selectedIds = new Set(
      Array.from(selectedKeys).map((key) => Number(key))
    );
    return items.filter((item) => selectedIds.has(item.id));
  }, [selectedKeys, items]);

  const handleBulkDelete = async () => {
    const deletePromises = selectedItems.map((item) =>
      dbApi.remove("item", item.id)
    );
    const results = await Promise.all(deletePromises);
    const errors = results.filter((res) => !res.success);
    if (errors.length > 0) {
      alert(`Erreur lors de la suppression de ${errors.length} article(s).`);
    }
    await refresh();
    setSelectedKeys(new Set([]));
  };

  const handleEditSelected = () => {
    if (selectedItems.length === 1) {
      openEditModal(selectedItems[0]);
    }
  };
  const AddValues = (Items: Item[]) => {
    const grouped: { [key: string]: Item[] } = {};
    Items.forEach((item) => {
      const key = `${item.name}-${item.height}-${item.grammage}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });

    return Object.values(grouped).map((group) => {
      const firstItem = group[0];
      const totalQuantity = group.reduce(
        (sum, item) => sum + CalculateQty(item.StockMovements),
        0
      );
      const totalWeight = group.reduce(
        (sum, item) => sum + CalculateWeight(item.StockMovements),
        0
      );
      return {
        ...firstItem,
        totalQuantity,
        totalWeight,
        itemsInGroup: group.length,
      };
    });
  };

  const GroupedByType = (Items: Item[]) => {
    const grouped: { [key: string]: Item[] } = {};
    Items.forEach((item) => {
      const key = item.Type?.name || "Unknown";
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });

    return Object.entries(grouped).map(([typeName, items]) => ({
      typeName,
      items,
    }));
  };

  const getInformation = async (IDs: number[]) => {
    const Items = IDs.map((id) => {
      const item = items.find((item) => item.id === id);
      if (item) {
        return item;
      }
    }).filter(Boolean); // Filter out any undefined items
    const addValues = AddValues(Items as Item[]); // This function seems to be grouping items by name, height, and grammage
    const groupedByType = GroupedByType(addValues as Item[]);
    console.log(groupedByType);
    setInfoData(groupedByType);
    onInfoModalOpen();
  };

  const SelectAll = (event: KeyboardEvent) => {
    if (event.ctrlKey && event.key.toLocaleLowerCase() === "a") {
      event.preventDefault();
      const allKeys = new Set(filteredList.map((m) => m.id.toString()));
      setSelectedKeys(allKeys);
    }
  };

  return (
    <DefaultLayout>
      <Head>
        <title>Stock - Nextron (with-next-ui)</title>
      </Head>

      <div
        className="flex flex-col gap-4"
        onKeyDown={(event) => SelectAll(event.nativeEvent)}
      >
        <section className="flex justify-between gap-4 items-end">
          <h1 className="text-2xl font-bold mb-2">Stock</h1>
          <div className="flex gap-4">
            <Dropdown>
              <DropdownTrigger>
                <Button endContent={<ChevronDownIcon />} variant="bordered">
                  Importer
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Static Actions">
                <DropdownItem onPress={() => handleImport("excel")}>
                  Importer vers Excel
                </DropdownItem>
                <DropdownItem onPress={() => handleImport("csv")}>
                  Importer vers CSV
                </DropdownItem>
                <DropdownItem onPress={() => handleImport("json")}>
                  Importer vers JSON
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger>
                <Button endContent={<ChevronDownIcon />} variant="bordered">
                  Exporter
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Static Actions">
                <DropdownItem onPress={() => handleExport("excel")}>
                  Exporter vers Excel
                </DropdownItem>
                <DropdownItem onPress={() => handleExport("csv")}>
                  Exporter vers CSV
                </DropdownItem>
                <DropdownItem onPress={() => handleExport("json")}>
                  Exporter vers JSON
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </section>
        <Tabs
          fullWidth
          aria-label="Filtrer par type"
          variant="solid"
          selectedKey={type}
          onSelectionChange={(key) => setType(String(key))}
          className="mb-2"
        >
          <Tab key="TOUS" title="TOUS" />
          {types.map((t) => (
            <Tab key={t.name} title={t.name} />
          ))}
        </Tabs>
        <section className="flex gap-4 items-end">
          <Input
            labelPlacement="outside"
            placeholder="Recherche (nom, description, SKU)"
            startContent={
              <SearchIcon className="text-2xl text-default-400 pointer-events-none shrink-0" />
            }
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button color="primary" onPress={openNewModal}>
            Nouvel article
          </Button>
        </section>

        {error && <div className="text-red-500">Erreur: {error}</div>}
        <Table
          aria-label="Liste des articles (bobines)"
          selectionMode={selectionMode}
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
          selectionBehavior="replace"
        >
          <TableHeader>
            <TableColumn>N°</TableColumn>
            <TableColumn>Nom</TableColumn>
            <TableColumn>Type</TableColumn>
            <TableColumn>Description</TableColumn>
            <TableColumn>SKU</TableColumn>
            <TableColumn>Fournisseur</TableColumn>
            <TableColumn>Laise (cm)</TableColumn>
            <TableColumn>Grammage (g/m²)</TableColumn>
            <TableColumn>Quantité</TableColumn>
            <TableColumn>Poid</TableColumn>
            <TableColumn>Emplacement</TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody
            isLoading={loading}
            emptyContent={"Aucun article à afficher"}
          >
            {filteredList.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{++index}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.Type?.name}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.sku}</TableCell>
                <TableCell>{item.Supplier?.name}</TableCell>
                <TableCell>{item.height}</TableCell>
                <TableCell>{item.grammage}</TableCell>
                <TableCell>{CalculateQty(item.StockMovements)}</TableCell>
                <TableCell>{CalculateWeight(item.StockMovements)}</TableCell>
                <TableCell>{item.Location?.name}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      color="primary"
                      size="sm"
                      onPress={() => openEditModal(item)}
                    >
                      Modifier
                    </Button>
                    <Button
                      color="danger"
                      size="sm"
                      onPress={() => openDeleteConfirm(item)}
                    >
                      Supprimer
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Modal size="5xl" isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  {editingItem ? "Modifier l'article" : "Nouvel article"}
                </ModalHeader>
                <ModalBody>
                  <ItemForm
                    initial={editingItem}
                    types={types}
                    suppliers={suppliers}
                    locations={locations}
                    onCancel={() => onClose()}
                    onSubmit={async (payload) => {
                      if (editingItem) {
                        const res = await dbApi.update<Item>(
                          "item",
                          editingItem.id,
                          payload
                        );
                        if (!res.success && "error" in res)
                          alert("Erreur: " + res.error);
                        else await refresh();
                      } else {
                        const res = await dbApi.create<Item>("item", payload);
                        if (res.success) {
                          if (
                            payload.current_quantity &&
                            payload.current_quantity > 0
                          ) {
                            const mouvementPayload: any = {
                              item_id: res.data.id,
                              type: "IN",
                              quantity: payload.current_quantity,
                              weight: payload.currentWeight
                                ? payload.currentWeight
                                : 0,
                              date: new Date().toISOString(),
                              notes: "Initial Value",
                            };
                            await dbApi.create(
                              "stockmovement",
                              mouvementPayload
                            );
                          }
                          await refresh();
                        } else if ("error" in res) {
                          alert("Erreur: " + res.error);
                        }
                      }
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
                    Êtes-vous sûr de vouloir supprimer l'article #
                    {deletingItem?.id}?
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
        {selectedItems.length > 1 && (
          <Card className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-auto">
            <CardBody>
              <div className="flex items-center gap-4">
                <p className="text-sm">
                  {selectedItems.length} article(s) séléctionné(s)
                </p>
                {selectedItems.length === 1 && (
                  <Button
                    color="primary"
                    size="sm"
                    onPress={handleEditSelected}
                  >
                    Modifier
                  </Button>
                )}
                <Button
                  color="success"
                  size="sm"
                  onPress={() =>
                    getInformation(
                      Array.from(selectedKeys).map((key) => Number(key))
                    )
                  }
                >
                  Info
                </Button>
                <Button
                  color="primary"
                  size="sm"
                  onPress={onPrintModalOpen}
                >
                  Imprimer
                </Button>
                <Button color="danger" size="sm" onPress={handleBulkDelete}>
                  Supprimer la séléction
                </Button>
              </div>
            </CardBody>
          </Card>
        )}
        <Modal
          isOpen={isInfoModalOpen}
          onOpenChange={onInfoModalOpenChange}
          className="h-dvh absolute right-0"
        >
          <ModalContent className="rounded-none m-0 p-0 sm:mx-0">
            {(onClose) => (
              <>
                <ModalHeader>Information sur la séléction</ModalHeader>
                <ModalBody>
                  <Accordion
                    variant="splitted"
                    selectionMode="multiple"
                    defaultExpandedKeys={["0"]}
                  >
                    {infoData.map((group, index) => (
                      <AccordionItem
                        key={index}
                        aria-label={group.typeName}
                        title={group.typeName}
                      >
                        <div className="flex flex-col gap-4">
                          <Progress
                            className="max-w-md"
                            color="primary"
                            label="Nombre d'Articles"
                            maxValue={100}
                            showValueLabel={true}
                            valueLabel={group.items.length}
                            size="sm"
                            value={100}
                          />
                          <Progress
                            className="max-w-md"
                            color="success"
                            label="Nombre de Bobines"
                            maxValue={100}
                            showValueLabel={true}
                            valueLabel={group.items.reduce(
                              (acc: number, item) => acc + item.totalQuantity,
                              0
                            )}
                            size="sm"
                            value={100}
                          />
                          <Progress
                            className="max-w-md"
                            color="warning"
                            label="Poids Total (kg)"
                            maxValue={100}
                            showValueLabel={true}
                            valueLabel={group.items.reduce(
                              (acc: number, item) => acc + item.totalWeight,
                              0
                            )}
                            size="sm"
                            value={100}
                          />
                        </div>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </ModalBody>
                <ModalFooter>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button color="primary" onPress={onClose}>
                      Fermer
                    </Button>
                  </div>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
        <Modal
          isOpen={isPrintModalOpen}
          size="full"
          onOpenChange={onPrintModalOpenChange}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Fiche de Stock - Matiere Premiere
                </ModalHeader>
                <ModalBody className="h-dvh">
                    <PDFViewer height={"100%"}>
                  <StockDoc items={selectedItems}/>

                    </PDFViewer>

                </ModalBody>
                
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </DefaultLayout>
  );
}
