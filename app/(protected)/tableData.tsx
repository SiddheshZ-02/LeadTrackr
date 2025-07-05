// tableData.tsx
// This file handles the main leads table page. It displays a paginated, searchable list of leads for the current user.
// Uses Redux for state management, AsyncStorage for persistence, and Expo Router for navigation.
// Allows adding, editing, deleting, and updating the status of leads.
//
// Workflow:
// 1. On mount, fetches the user's leads from AsyncStorage and loads them into Redux.
// 2. Displays a search bar to filter leads by name, company, or email.
// 3. Shows a paginated table of leads with actions for edit, delete, and status change.
// 4. Allows adding a new lead via a button.
// 5. Handles refreshing, pagination, and all lead actions with updates to Redux and AsyncStorage.

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  FlatList,
} from "react-native";
import { DataTable, Button, TextInput } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { setLeads, updateLead, deleteLead } from "../../Store/leadsSlice";
import type { Lead } from "../../Store/leadsSlice";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";

// Main leads table page component
const TableData = () => {
  // Get leads from Redux
  const leads = useSelector((state: any) => state.leads.leads);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [itemsPerPage] = useState(10);

  // Helper to get the AsyncStorage key for the current user's leads
  const getLeadsKey = async () => {
    const email = await AsyncStorage.getItem("currentUserEmail");
    return `leads_${email}`;
  };

  // Fetch leads from AsyncStorage and load into Redux
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const leadsKey = await getLeadsKey();
      const storedLeads = await AsyncStorage.getItem(leadsKey);
      if (storedLeads) {
        const parsed = JSON.parse(storedLeads);
        dispatch(setLeads(parsed));
      } else {
        dispatch(setLeads([]));
      }
    } catch (e) {
      dispatch(setLeads([]));
    }
    setLoading(false);
    setRefreshing(false);
  };

  // On mount, fetch leads
  useEffect(() => {
    fetchLeads();
  }, []);

  // Navigate to add lead form
  const handleAddLead = () => {
    router.push("/(protected)/addLeadForm");
  };

  // Delete a lead and update Redux and AsyncStorage
  const handleDelete = async (id: string) => {
    const leadsKey = await getLeadsKey();
    dispatch(deleteLead(id));
    const updated = leads.filter((l: Lead) => l.id !== id);
    await AsyncStorage.setItem(leadsKey, JSON.stringify(updated));
  };

  // Change the status of a lead and update Redux and AsyncStorage
  const handleStatusChange = async (lead: Lead, newStatus: Lead["status"]) => {
    const leadsKey = await getLeadsKey();
    const updatedLead = { ...lead, status: newStatus };
    dispatch(updateLead(updatedLead));
    const updated = leads.map((l: Lead) =>
      l.id === lead.id ? updatedLead : l
    );
    await AsyncStorage.setItem(leadsKey, JSON.stringify(updated));
  };

  // Edit a lead (navigate to addLeadForm with id param)
  const handleEdit = (lead: Lead) => {
    router.push({
      pathname: "/(protected)/addLeadForm",
      params: { id: lead.id },
    });
  };

  // Refresh the leads list
  const onRefresh = () => {
    setRefreshing(true);
    fetchLeads();
  };

  // Filter leads by search query
  const filteredLeads = leads.filter((lead: Lead) => {
    const q = search.toLowerCase();
    return (
      lead.name?.toLowerCase().includes(q) ||
      lead.company?.toLowerCase().includes(q) ||
      lead.email?.toLowerCase().includes(q)
    );
  });

  // Pagination logic
  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, filteredLeads.length);
  const paginatedLeads = filteredLeads.slice(from, to);

  return (
    <View style={styles.safeArea}>
      <SafeAreaView />
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          {/* Add Lead button */}
          <Button
            mode="contained"
            onPress={handleAddLead}
            style={styles.addButton}
            labelStyle={styles.addButtonText}
            icon={() => <MaterialIcons name="add" size={20} color="#fff" />}
          >
            Add Lead
          </Button>
          {/* Search bar */}
          <TextInput
            placeholder="Search by name, company, or email"
            value={search}
            onChangeText={setSearch}
            style={styles.searchBar}
            mode="outlined"
            left={<TextInput.Icon icon="magnify" />}
            theme={{ colors: { primary: Colors.light.tint } }}
          />
          <Text style={styles.heading}>Leads</Text>
          {/* Show loading text while leads are loading */}
          {loading ? (
            <Text style={styles.loadingText}>Loading leads...</Text>
          ) : (
            <View style={styles.tableContainer}>
              <ScrollView
                horizontal
                style={styles.horizontalScroll}
                contentContainerStyle={{ minWidth: 700 }}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }
              >
                <DataTable>
                  {/* Table header */}
                  <DataTable.Header style={styles.tableHeader}>
                    <DataTable.Title style={styles.serialColumn}>
                      <Text style={styles.tableHeaderText}>S.No</Text>
                    </DataTable.Title>
                    <DataTable.Title style={styles.nameColumn}>
                      <Text style={styles.tableHeaderText}>Name</Text>
                    </DataTable.Title>
                    <DataTable.Title style={styles.companyColumn}>
                      <Text style={styles.tableHeaderText}>Company</Text>
                    </DataTable.Title>
                    <DataTable.Title style={styles.emailColumn}>
                      <Text style={styles.tableHeaderText}>Email</Text>
                    </DataTable.Title>
                    <DataTable.Title style={styles.phoneColumn}>
                      <Text style={styles.tableHeaderText}>Phone</Text>
                    </DataTable.Title>
                    <DataTable.Title style={styles.statusColumn}>
                      <Text style={styles.tableHeaderText}>Status</Text>
                    </DataTable.Title>
                    <DataTable.Title style={styles.sourceColumn}>
                      <Text style={styles.tableHeaderText}>Source</Text>
                    </DataTable.Title>
                    <DataTable.Title style={styles.notesColumn}>
                      <Text style={styles.tableHeaderText}>Notes</Text>
                    </DataTable.Title>
                    <DataTable.Title style={styles.actionsColumn}>
                      <Text style={styles.tableHeaderText}>Actions</Text>
                    </DataTable.Title>
                  </DataTable.Header>
                  {/* Table rows: Render paginated leads */}
                  <FlatList
                    data={paginatedLeads}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item: lead, index }) => (
                      <DataTable.Row key={lead.id} style={styles.tableRow}>
                        {/* Serial number */}
                        <DataTable.Cell style={styles.serialColumn}>
                          <Text
                            style={styles.tableCellText}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {from + index + 1}
                          </Text>
                        </DataTable.Cell>
                        {/* Name */}
                        <DataTable.Cell style={styles.nameColumn}>
                          <Text
                            style={styles.tableCellText}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {String(lead.name ?? "")}
                          </Text>
                        </DataTable.Cell>
                        {/* Company */}
                        <DataTable.Cell style={styles.companyColumn}>
                          <Text
                            style={styles.tableCellText}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {String(lead.company ?? "")}
                          </Text>
                        </DataTable.Cell>
                        {/* Email */}
                        <DataTable.Cell style={styles.emailColumn}>
                          <Text
                            style={styles.tableCellText}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {String(lead.email ?? "")}
                          </Text>
                        </DataTable.Cell>
                        {/* Phone */}
                        <DataTable.Cell style={styles.phoneColumn}>
                          <Text
                            style={styles.tableCellText}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {String(lead.phone ?? "")}
                          </Text>
                        </DataTable.Cell>
                        {/* Status */}
                        <DataTable.Cell style={styles.statusColumn}>
                          <Text
                            style={styles.tableCellText}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {String(lead.status ?? "")}
                          </Text>
                        </DataTable.Cell>
                        {/* Source */}
                        <DataTable.Cell style={styles.sourceColumn}>
                          <Text
                            style={styles.tableCellText}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {String(lead.source ?? "")}
                          </Text>
                        </DataTable.Cell>
                        {/* Notes */}
                        <DataTable.Cell style={styles.notesColumn}>
                          <Text
                            style={styles.tableCellText}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {String(lead.notes ?? "")}
                          </Text>
                        </DataTable.Cell>
                        {/* Actions */}
                        <DataTable.Cell style={styles.actionsColumn}>
                          <View style={styles.actionCell}>
                            <Button
                              mode="contained"
                              style={styles.iconButton}
                              onPress={() => handleEdit(lead)}
                              labelStyle={styles.actionButtonText}
                            >
                              <MaterialIcons
                                name="edit"
                                size={18}
                                color="#fff"
                              />
                            </Button>
                            <Button
                              mode="contained"
                              style={styles.iconButtonDelete}
                              onPress={() => handleDelete(lead.id)}
                              labelStyle={styles.actionButtonText}
                            >
                              <MaterialIcons
                                name="delete"
                                size={18}
                                color="#fff"
                              />
                            </Button>
                          </View>
                        </DataTable.Cell>
                      </DataTable.Row>
                    )}
                  />
                </DataTable>
              </ScrollView>
              {filteredLeads.length > 0 && (
                <DataTable.Pagination
                  page={page}
                  numberOfPages={Math.ceil(filteredLeads.length / itemsPerPage)}
                  onPageChange={setPage}
                  label={`${from + 1}-${to} of ${filteredLeads.length}`}
                  showFastPaginationControls
                  numberOfItemsPerPageList={[10]}
                  numberOfItemsPerPage={itemsPerPage}
                  selectPageDropdownLabel={"Rows per page"}
                  style={styles.pagination}
                />
              )}
            </View>
          )}
          {!loading && filteredLeads.length === 0 && (
            <Text style={styles.noDataText}>No leads found</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginBottom: 70,
  },
  card: {
    flex: 1,
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    marginTop: 0,
    marginBottom: 5,
    justifyContent: "space-between",
  },
  addButton: {
    alignSelf: "flex-start",
    backgroundColor: "#23406e",
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#23406e",
    marginBottom: 24,
    alignSelf: "center",
    letterSpacing: 1,
  },
  loadingText: {
    color: "#23406e",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 24,
  },
  noDataText: {
    color: "#e74c3c",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 24,
  },
  tableHeader: {
    backgroundColor: "#f3f6f9",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableHeaderText: {
    color: "#23406e",
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "center",
  },
  tableRow: {
    backgroundColor: "#fff",
    borderBottomColor: "#dbe2ea",
    borderBottomWidth: 1,
    paddingVertical: 14,
    minHeight: 64,
  },
  tableCellText: {
    color: "#23406e",
    fontSize: 14,
    paddingHorizontal: 8,
    textAlign: "center",
  },
  tableScrollWrapper: {
    flex: 1,
    minHeight: 0,
  },
  tableContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "space-between",
  },
  horizontalScroll: {
    width: "100%",
    flex: 1,
  },
  verticalScroll: {
    maxHeight: "70%",
  },
  actionCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingLeft: 4,
  },
  searchBar: {
    marginBottom: 20,
    backgroundColor: "#f3f6f9",
    borderRadius: 30,
  },
  iconButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 6,
    minWidth: 48,
    height: 40,
    justifyContent: "center",
    marginRight: 0,
    elevation: 2,
  },
  iconButtonDelete: {
    backgroundColor: "#e74c3c",
    borderRadius: 6,
    minWidth: 48,
    height: 40,
    justifyContent: "center",
    elevation: 2,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  serialColumn: { minWidth: 60, maxWidth: 80, flex: 0.5 },
  nameColumn: { minWidth: 120, maxWidth: 160, flex: 1 },
  companyColumn: { minWidth: 100, maxWidth: 140, flex: 1 },
  emailColumn: { minWidth: 200, maxWidth: 300, flex: 2 },
  phoneColumn: { minWidth: 110, maxWidth: 130, flex: 1 },
  statusColumn: { minWidth: 110, maxWidth: 130, flex: 1 },
  sourceColumn: { minWidth: 100, maxWidth: 120, flex: 1 },
  notesColumn: { minWidth: 140, maxWidth: 200, flex: 2 },
  actionsColumn: {
    minWidth: 120,
    maxWidth: 140,
    flex: 1.2,
    justifyContent: "center",
  },
  pagination: {
    backgroundColor: "#f3f6f9",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingVertical: 8,
    marginTop: 10,
    alignSelf: "stretch",
  },
});

export default TableData;
