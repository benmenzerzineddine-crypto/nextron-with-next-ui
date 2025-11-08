import React from "react";
import { Page, Text, View, Document, StyleSheet, Image} from "@react-pdf/renderer";
import { Table, TR, TH, TD } from "@ag-media/react-pdf-table";

import type { StockMovement } from "../types/schema";

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
    height: "100%",
  },
  header: {
    flexDirection: "column",
    marginBottom: 20,
  },
  logo: {
    width: "100%",
    height: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 10,
  }
});

// Create Document Component
export default function MouvementDoc({ items }: { items: StockMovement[] }) {
  return (
    <Document author="KDA EMBALLAGE" title="Mouvement de Stock - Matiere Premiere">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image style={styles.logo} src="/images/header.png" />
          <Text style={styles.title}>Fiche de Stock - Matiere Premiere</Text>
        </View>
        <View>
          <Table weightings={[4, 3, 2, 2, 2]} tdStyle={{fontSize:12,textAlign:'center',justifyContent:'center',padding:5}}>
            <TH>
              <TD>Article</TD>
              <TD>SKU</TD>
              <TD>Quantité</TD>
              <TD>Poid</TD>
              <TD>Date</TD>
            </TH>
            {items.map((item) => (
              <TR key={item.id}>
                <TD>{item.Item?.name || ""}</TD>
                <TD>{item.Item?.sku || ""}</TD>
                <TD>{item.quantity || ""}</TD>
                <TD>{item.weight || ""}</TD>
                <TD>{new Date(item.date).toLocaleDateString() || ""}</TD>
              </TR>
            ))}
          </Table>
        </View>
        {/* Table Header */}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}
