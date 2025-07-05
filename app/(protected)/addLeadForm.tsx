// addLeadForm.tsx
// This file handles the Add/Edit Lead form page. It manages the form for creating or updating a lead.
// Uses react-hook-form for form state, Redux for state management, AsyncStorage for persistence, and Expo Router for navigation.
// Shows error messages and loading indicators as needed.
//
// Workflow:
// 1. If an 'id' is present in the route params, loads the existing lead data for editing.
// 2. Otherwise, initializes an empty form for adding a new lead.
// 3. User fills out the form and submits.
// 4. On submit, either updates the existing lead or adds a new lead in Redux and AsyncStorage.
// 5. Shows a toast message on success or error.
// 6. Navigates back to the previous page after successful submission.

import React, { useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  ToastAndroid,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { addLead, updateLead } from "../../Store/leadsSlice";
import type { Lead } from "../../Store/leadsSlice";
import uuid from "react-native-uuid";
import { SafeAreaView } from "react-native-safe-area-context";

// Add/Edit Lead form component
const AddLeadForm = () => {
  // Type for lead form data
  type LeadFormData = {
    leadName: string;
    company: string;
    email: string;
    phone: string;
    status: string;
    source: string;
    notes: string;
  };

  // Setup react-hook-form for form management
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadFormData>();

  const router = useRouter();
  const dispatch = useDispatch();
  const leads = useSelector((state: any) => state.leads.leads);
  const params = useLocalSearchParams();
  const id = params.id as string | undefined;

  // If editing, load existing lead data into the form
  useEffect(() => {
    if (id) {
      const lead = leads.find((l: Lead) => l.id === id);
      if (lead) {
        reset({
          leadName: lead.name,
          company: lead.company,
          email: lead.email,
          phone: lead.phone,
          status: lead.status,
          source: lead.source,
          notes: lead.notes,
        });
      }
    } else {
      // If adding, reset to empty form
      reset({
        leadName: "",
        company: "",
        email: "",
        phone: "",
        status: "",
        source: "",
        notes: "",
      });
    }
  }, [id, leads, reset]);

  // Helper to get the AsyncStorage key for the current user's leads
  const getLeadsKey = async () => {
    const email = await AsyncStorage.getItem("currentUserEmail");
    return `leads_${email}`;
  };

  // Called when form is submitted and valid
  const onSubmit = async (data: LeadFormData) => {
    try {
      const leadsKey = await getLeadsKey();
      let lead: Lead;
      if (id) {
        // If editing, update the existing lead
        lead = {
          id,
          name: data.leadName,
          company: data.company,
          email: data.email,
          phone: data.phone,
          status: data.status as Lead["status"],
          source: data.source as Lead["source"],
          notes: data.notes,
        };
        dispatch(updateLead(lead));
        const updated = leads.map((l: Lead) => (l.id === id ? lead : l));
        await AsyncStorage.setItem(leadsKey, JSON.stringify(updated));
      } else {
        // If adding, create a new lead
        lead = {
          id: uuid.v4() as string,
          name: data.leadName,
          company: data.company,
          email: data.email,
          phone: data.phone,
          status: data.status as Lead["status"],
          source: data.source as Lead["source"],
          notes: data.notes,
        };
        dispatch(addLead(lead));
        const existing = await AsyncStorage.getItem(leadsKey);
        const leadsArr = existing ? JSON.parse(existing) : [];
        leadsArr.push(lead);
        await AsyncStorage.setItem(leadsKey, JSON.stringify(leadsArr));
      }
      reset();
      ToastAndroid.showWithGravity(
        id ? "Lead updated!" : "Lead added!",
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM
      );
      router.back(); // Navigate back after success
    } catch (e) {
      console.error("Error saving lead:", e);
      ToastAndroid.showWithGravity(
        "Error saving lead",
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={5}
    >
      <SafeAreaView />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>{id ? "Update Lead" : "Add Lead"}</Text>
        {/* Lead Name input field */}
        <Text style={styles.label}>Lead Name</Text>
        <Controller
          control={control}
          name="leadName"
          rules={{
            required: "Lead name is required",
            minLength: {
              value: 2,
              message: "Lead name must be at least 2 characters",
            },
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Lead name"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.leadName && (
          <Text style={{ color: "red", marginBottom: 4 }}>
            {errors.leadName.message}
          </Text>
        )}
        {/* Company input field */}
        <Text style={styles.label}>Company</Text>
        <Controller
          control={control}
          name="company"
          rules={{
            required: "Company is required",
            minLength: {
              value: 2,
              message: "Company must be at least 2 characters",
            },
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Company"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.company && (
          <Text style={{ color: "red", marginBottom: 4 }}>
            {errors.company.message}
          </Text>
        )}
        {/* Email input field */}
        <Text style={styles.label}>Email</Text>
        <Controller
          control={control}
          name="email"
          rules={{
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email address",
            },
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Lead email"
              value={value}
              onChangeText={onChange}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />
        {errors.email && (
          <Text style={{ color: "red", marginBottom: 4 }}>
            {errors.email.message}
          </Text>
        )}
        <Text style={styles.label}>Phone</Text>
        <Controller
          control={control}
          name="phone"
          rules={{
            required: "Phone is required",
            pattern: {
              value: /^[0-9]{10}$/,
              message: "Enter a valid 10-digit phone number",
            },
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Phone"
              value={value}
              onChangeText={onChange}
              keyboardType="phone-pad"
            />
          )}
        />
        {errors.phone && (
          <Text style={{ color: "red", marginBottom: 4 }}>
            {errors.phone.message}
          </Text>
        )}
        <Text style={styles.label}>Status</Text>
        <Controller
          control={control}
          name="status"
          rules={{ required: "Status is required" }}
          defaultValue={""}
          render={({ field: { onChange, value } }) => (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={value}
                onValueChange={onChange}
                style={styles.picker}
                dropdownIconColor="#23406e"
              >
                <Picker.Item label="Select status" value="" color="#8a99a7" />
                <Picker.Item label="New" value="New" />
                <Picker.Item label="Contacted" value="Contacted" />
                <Picker.Item label="Qualified" value="Qualified" />
                <Picker.Item label="Lost" value="Lost" />
              </Picker>
            </View>
          )}
        />
        {errors.status && (
          <Text style={{ color: "red", marginBottom: 4 }}>
            {errors.status.message}
          </Text>
        )}
        <Text style={styles.label}>Source</Text>
        <Controller
          control={control}
          name="source"
          rules={{ required: "Source is required" }}
          defaultValue={""}
          render={({ field: { onChange, value } }) => (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={value}
                onValueChange={onChange}
                style={styles.picker}
                dropdownIconColor="#23406e"
              >
                <Picker.Item label="Select source" value="" color="#8a99a7" />
                <Picker.Item label="Website" value="Website" />
                <Picker.Item label="Referral" value="Referral" />
                <Picker.Item label="Cold Call" value="Cold Call" />
                <Picker.Item label="Social Media" value="Social Media" />
              </Picker>
            </View>
          )}
        />
        {errors.source && (
          <Text style={{ color: "red", marginBottom: 4 }}>
            {errors.source.message}
          </Text>
        )}
        <Text style={styles.label}>Notes</Text>
        <Controller
          control={control}
          name="notes"
          rules={{
            maxLength: {
              value: 200,
              message: "Notes cannot exceed 200 characters",
            },
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Notes"
              value={value}
              onChangeText={onChange}
              multiline
            />
          )}
        />
        {errors.notes && (
          <Text style={{ color: "red", marginBottom: 4 }}>
            {errors.notes.message}
          </Text>
        )}
        <View style={styles.buttonContainer}>
          <Button
            title={id ? "Update Lead" : "Add Lead"}
            onPress={handleSubmit(onSubmit)}
            color="#23406e"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    margin: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    paddingBottom:100
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
    color: "#29406E",
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    marginTop: 12,
    color: "#29406E",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    fontSize: 16,
    backgroundColor: "#f9fafb",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#f9fafb",
  },
  picker: {
    width: "100%",
  },
  buttonContainer: {
    marginTop: 24,
    borderRadius: 8,
    overflow: "hidden",
  },
});

export default AddLeadForm;
