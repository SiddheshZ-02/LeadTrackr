// Login.tsx
// This file handles the user login page. It manages the login form, validation, and authentication logic.
// Uses react-hook-form for form state, Redux for authentication, and Expo Router for navigation.
// Shows error messages and loading indicators as needed.
//
// Workflow:
// 1. User enters email and password and submits the form.
// 2. Form is validated (email format, password length).
// 3. On submit, dispatches loginUser action to Redux.
// 4. Shows loading spinner while authenticating.
// 5. On success, saves user email to AsyncStorage and navigates to the main table page.
// 6. On error, shows a toast message.

import {
  View,
  Text,
  TextInput,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Button,
  ActivityIndicator,
  ToastAndroid,
} from "react-native";
import React, { useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "@/Store/authSlice";
import type { AppDispatch, RootState } from "@/Store/store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { height, width } = Dimensions.get("window");

// Login page component
const Login = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Get authentication state from Redux
  // Define the expected user type
  type UserType = {
    email: string;
    // add other user properties if needed
    [key: string]: any;
  };

  const { loading, error, token, user } = useSelector(
    (state: RootState) => state.auth as {
      loading: boolean;
      error: string | null;
      token: string | null;
      user: UserType | null;
    }
  );

  // Setup react-hook-form for form management
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Type for login form inputs
  type LoginFormInputs = {
    email: string;
    password: string;
  };

  // Called when form is submitted and valid
  const onSubmit = (data: LoginFormInputs) => {
    dispatch(loginUser(data)); // Dispatch login action
  };

  // Show error toast if login fails
  useEffect(() => {
    if (error) {
      ToastAndroid.showWithGravity(
        error,
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM
      );
      dispatch(clearError()); // Clear error after showing
    }
  }, [error, dispatch]);

  const loginHandled = useRef(false);

  useEffect(() => {
    if (token && !loginHandled.current) {
      loginHandled.current = true;
      if (user && user.email) {
        AsyncStorage.setItem("currentUserEmail", user.email);
      }
      ToastAndroid.showWithGravity(
        "Login Successful",
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM
      );
      router.replace("/tableData");
    }
    // Reset loginHandled if user logs out or token is cleared
    if (!token && !user) {
      loginHandled.current = false;
    }
  }, [token,user]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Dismiss keyboard when tapping outside */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <View style={styles.card}>
            <Text style={styles.title}>Log In</Text>
            {/* Email input field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <Controller
                control={control}
                name="email"
                rules={{
                  required: true,
                  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onChangeText={onChange}
                    value={value}
                    placeholderTextColor="#A0A0A0"
                  />
                )}
              />
              {errors.email && (
                <Text style={styles.errorText}>
                  {errors.email.type === "required" ? (
                    <Text>Email is required</Text>
                  ) : (
                    <Text>Invalid email</Text>
                  )}
                </Text>
              )}
            </View>

            {/* Password input field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <Controller
                name="password"
                control={control}
                rules={{ required: true, minLength: 6 }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, errors.password && styles.inputError]}
                    placeholder="Enter your password"
                    secureTextEntry
                    onChangeText={onChange}
                    value={value}
                    placeholderTextColor="#A0A0A0"
                  />
                )}
              />
              {errors.password && (
                <Text style={styles.errorText}>
                  {errors.password.type === "required" ? (
                    <Text>Password is required</Text>
                  ) : (
                    <Text>Password must be at least 6 characters</Text>
                  )}
                </Text>
              )}
            </View>

            {/* Show loading spinner while authenticating */}
            {loading ? (
              <ActivityIndicator size="large" color="#e53935" />
            ) : (
              <TouchableOpacity
                style={styles.button}
                onPress={handleSubmit(onSubmit)}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            )}

            {/* Show error message if present */}
            {error && (
              <Text style={[styles.errorText, { textAlign: "center" }]}>
                <Text>{error}</Text>
              </Text>
            )}

            {/* Link to registration page */}
            <Text
              style={styles.registerText}
              onPress={() => router.push("/SignUp")}
            >
              Don't have an account?{" "}
              <Text style={styles.registerLink}>Register</Text>
            </Text>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

// Styles for the login page UI
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6fbfd",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: width * 0.9,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#247ba0",
    marginBottom: 32,
    letterSpacing: 1,
  },
  inputGroup: {
    width: "100%",
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#e3f2f6",
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e3f2f6",
    color: "#222",
  },
  inputError: {
    borderColor: "#e74c3c",
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 13,
    marginTop: 4,
  },
  button: {
    backgroundColor: "#247ba0",
    borderRadius: 10,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 18,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1,
  },
  registerText: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
  },
  registerLink: {
    color: "#247ba0",
    fontWeight: "bold",
  },
});

export default Login;
