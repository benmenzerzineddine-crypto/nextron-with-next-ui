"use client";
import { useState } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  Select,
  SelectItem,
} from "@nextui-org/react";
import DefaultLayout from "@/layouts/default";
import Head from "next/head";
import * as dbApi from "@/utils/api";

const tables = ["user", "supplier", "location", "type", "item", "stockmovement", "transaction"];

export default function DatabasePage() {
  const [message, setMessage] = useState("");
  const { isOpen: isExportOpen, onOpen: onExportOpen, onOpenChange: onExportOpenChange } = useDisclosure();
  const { isOpen: isImportOpen, onOpen: onImportOpen, onOpenChange: onImportOpenChange } = useDisclosure();
  const [selectedTable, setSelectedTable] = useState("");

  const handleBackup = async () => {
    const res = await dbApi.backup();
    if (res.success) {
      setMessage("Database backed up");
    } else {
      setMessage(`Error backing up database: ${res.error}`);
    }
  };

  const handleExport = async () => {
    if (!selectedTable) return;
    const res = await dbApi.exportTable(selectedTable);
    if (res.success) {
      setMessage(`Table ${selectedTable} exported to ${res.data.path}`);
    } else {
      setMessage(`Error exporting table: ${res.error}`);
    }
    onExportOpenChange();
  };

  const handleImport = async () => {
    if (!selectedTable) return;
    const res = await dbApi.importTable(selectedTable);
    if (res.success) {
      setMessage(`Data imported to table ${selectedTable}`);
    } else {
      setMessage(`Error importing data: ${res.error}`);
    }
    onImportOpenChange();
  };

  return (
    <DefaultLayout>
      <Head>
        <title>Database - Nextron (with-next-ui)</title>
      </Head>

      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold mb-2">Database Management</h1>
        <section className="flex gap-4 items-end">
          <Button color="primary" onPress={onImportOpen}>Import</Button>
          <Button color="primary" onPress={onExportOpen}>Export</Button>
          <Button color="secondary" onClick={handleBackup}>Backup</Button>
        </section>
        {message && <p>{message}</p>}
      </div>

      <Modal isOpen={isExportOpen} onOpenChange={onExportOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Export Data</ModalHeader>
              <ModalBody>
                <Select
                  label="Select a table to export"
                  onChange={(e) => setSelectedTable(e.target.value)}
                >
                  {tables.map((table) => (
                    <SelectItem key={table} value={table}>
                      {table}
                    </SelectItem>
                  ))}
                </Select>
                <Button disabled={!selectedTable} onClick={handleExport}>Export</Button>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isImportOpen} onOpenChange={onImportOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Import Data</ModalHeader>
              <ModalBody>
                <Select
                  label="Select a table to import to"
                  onChange={(e) => setSelectedTable(e.target.value)}
                >
                  {tables.map((table) => (
                    <SelectItem key={table} value={table}>
                      {table}
                    </SelectItem>
                  ))}
                </Select>
                <Button disabled={!selectedTable} onClick={handleImport}>Import</Button>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </DefaultLayout>
  );
}
