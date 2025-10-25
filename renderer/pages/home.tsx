"use client";
import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import DefaultLayout from "@/layouts/default";
import Head from "next/head";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { Item, Supplier, Location, User, StockMovement } from "@/types/schema";
import * as dbApi from "@/utils/api";

const useDbStats = () => {
  const [stats, setStats] = useState({
    items: 0,
    suppliers: 0,
    locations: 0,
    users: 0,
    movements: [],
    lowStockItems: [],
  });
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const [itemsRes, suppliersRes, locationsRes, usersRes, movementsRes] = await Promise.all([
      dbApi.getAll<Item>("item"),
      dbApi.getAll<Supplier>("supplier"),
      dbApi.getAll<Location>("location"),
      dbApi.getAll<User>("user"),
      dbApi.getAll<StockMovement>("stockmovement"),
    ]);

    if (itemsRes.success && suppliersRes.success && locationsRes.success && usersRes.success && movementsRes.success) {
      const items = itemsRes.data;
      const movements = movementsRes.data;

      const lowStockItems = items.filter(item => {
        const currentQuantity = item.StockMovements?.reduce((acc, m) => acc + m.quantity, 0) ?? 0;
        return currentQuantity < (item.reorderLevel ?? 0);
      });

      setStats({
        items: items.length,
        suppliers: suppliersRes.data.length,
        locations: locationsRes.data.length,
        users: usersRes.data.length,
        movements,
        lowStockItems,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  return { stats, loading };
};

export default function HomePage() {
  const { stats, loading } = useDbStats();

  const movementData = useMemo(() => {
    const data = stats.movements.reduce((acc, m) => {
      const date = new Date(m.date).toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = { date, IN: 0, OUT: 0 };
      }
      if (m.type === "IN") {
        acc[date].IN += m.quantity;
      } else {
        acc[date].OUT += m.quantity;
      }
      return acc;
    }, {});
    return Object.values(data).slice(-30);
  }, [stats.movements]);

  return (
    <DefaultLayout>
      <Head>
        <title>Home - Nextron (with-next-ui)</title>
      </Head>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>Total Items</CardHeader>
          <CardBody>{loading ? "Loading..." : stats.items}</CardBody>
        </Card>
        <Card>
          <CardHeader>Total Suppliers</CardHeader>
          <CardBody>{loading ? "Loading..." : stats.suppliers}</CardBody>
        </Card>
        <Card>
          <CardHeader>Total Locations</CardHeader>
          <CardBody>{loading ? "Loading..." : stats.locations}</CardBody>
        </Card>
        <Card>
          <CardHeader>Total Users</CardHeader>
          <CardBody>{loading ? "Loading..." : stats.users}</CardBody>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>Stock Movements (Last 30 Days)</CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={movementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="IN" fill="#82ca9d" />
                <Bar dataKey="OUT" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>Low Stock Items</CardHeader>
          <CardBody>
            <Table aria-label="Low stock items">
              <TableHeader>
                <TableColumn>Item</TableColumn>
                <TableColumn>SKU</TableColumn>
                <TableColumn>Current Quantity</TableColumn>
                <TableColumn>Reorder Level</TableColumn>
              </TableHeader>
              <TableBody isLoading={loading} emptyContent={"No low stock items"}>
                {stats.lowStockItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>{item.StockMovements?.reduce((acc, m) => acc + m.quantity, 0) ?? 0}</TableCell>
                    <TableCell>{item.reorderLevel}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>
    </DefaultLayout>
  );
}
