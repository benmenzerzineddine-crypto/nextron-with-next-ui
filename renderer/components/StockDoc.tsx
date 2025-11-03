
import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import {Table, TR, TH, TD} from '@ag-media/react-pdf-table';

import type { Item, Supplier, Location } from "../types/schema";

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
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
  },
});

// Create Document Component
export default function StockDoc({
  items,
}: {
  items: Item[];
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {/* <Image style={styles.logo} src="/images/logo.png" /> */}
          <Text style={styles.title}>Stock Items</Text>
        </View>
          <Table weightings={[1,2,1,1,2,2]}>
        <TH>
            <TD>Type</TD>
            <TD>Fournisseur</TD>
            <TD>Laise (cm)</TD>
            <TD>Grammage (g/m²)</TD>
            <TD>Quantité</TD>
            <TD>Emplacement</TD>
          
        </TH>
                  {items.map((item) => (

        <TR key={item.id}>
              <TD>{item.Type?.name || ''}</TD>
              <TD>{item.Supplier?.name || ''}</TD>
              <TD>{item.height || ''}</TD>
              <TD>{item.grammage || ''}</TD>
              <TD>{item.current_quantity || 0}</TD>
              <TD>{item.Location?.name || ''}</TD>
        </TR>
                  ))}

    </Table>
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
