// index.tsx
// This is the main entry point of the app. It checks if the user is authenticated and redirects them
// to the appropriate page (either the protected tableData page or the Login page).
// It uses Redux to get the authentication state and Expo Router for navigation.
//
// Workflow:
// 1. On mount, checks if the app is still loading authentication state.
// 2. If loading is done, checks if a user is logged in.
//    - If logged in, redirects to the protected tableData page.
//    - If not logged in, redirects to the Login page.
// 3. Shows a loading spinner while authentication state is being determined.

import { View, Text, ActivityIndicator } from "react-native";
import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/Store/store";

const index = () => {
  const router = useRouter();
  // Get user and loading state from Redux store
  const { user, loading } = useSelector((state: RootState) => state.auth);

  // Function to handle redirection based on authentication state
  const person = () => {
    if (!loading)
      if (user) {
        router.replace("/(protected)/tableData"); // Redirect to main app if logged in
      } else {
        router.replace("/(auth)/Login"); // Redirect to login if not logged in
      }
  };

  // useEffect runs on mount and whenever loading or user changes
  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        if (user) {
          router.replace("/(protected)/tableData");
        } else {
          router.replace("/(auth)/Login");
        }
      }, 0); // Immediate redirect after loading
    }
  }, [loading, user]);

  // UI: Show loading spinner while checking auth, otherwise show redirecting text
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Text>Redirecting...</Text>
      )}
    </View>
  );
};

export default index;
