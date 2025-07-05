// SignUp.tsx
// This file handles the user registration (sign up) page. It manages the registration form, validation, and user creation logic.
// Uses react-hook-form for form state, Redux for authentication, and Expo Router for navigation.
// Shows error messages and loading indicators as needed.
//
// Workflow:
// 1. User enters registration details (name, email, gender, password, confirm password) and submits the form.
// 2. Form is validated (required fields, email format, password length, password match).
// 3. On submit, dispatches registerUser action to Redux.
// 4. Shows loading spinner while registering.
// 5. On success, saves user email to AsyncStorage and navigates to the login page.
// 6. On error, shows a toast message.

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Button,
  ActivityIndicator,
  ToastAndroid,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "@/Store/authSlice";
import type { AppDispatch, RootState } from "@/Store/store";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get("window");

// Sign up page component
const SignUp = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  // Get authentication state from Redux
  const { loading, error, user } = useSelector((state: RootState) => state.auth);

  // Setup react-hook-form for form management
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      gender: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Type for registration form inputs
  type FormData = {
    name: string;
    email: string;
    gender:string;
    password: string;
    confirmPassword: string;
  };

  const signupHandled = useRef(false);

  // Show error toast if registration fails
  useEffect(() => {
    if (error) {
      ToastAndroid.showWithGravity(
        error,
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM
      );
    }
  }, [error]);

  // On successful registration, save user email and optionally navigate
  useEffect(() => {
    if (user && !signupHandled.current) {
      signupHandled.current = true;
      if ((user as any).email) {
        AsyncStorage.setItem('currentUserEmail', (user as any).email);
      }
      ToastAndroid.showWithGravity(
        'Signup Successful',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM
      );
      // Optionally, navigate to login or protected page here
    }
  }, [user]);

  // Called when form is submitted and valid
  const onSubmit = (data: FormData) => {
    const { confirmPassword, ...userData } = data;
    dispatch(registerUser(userData)); // Dispatch registration action
    reset(); // Reset form after submission
    router.push("/Login"); // Navigate to login page
  };

  return (
   <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Register</Text>

          {/* Name input field */}
          <Text style={styles.label}>Name</Text>
          <Controller
            control={control}
            name="name"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                onChangeText={onChange}
                value={value}
                placeholderTextColor="#8a99a7"
              />
            )}
          />
          {errors.name && (
            <Text style={styles.errorText}>Name is required</Text>
          )}

          {/* Email input field */}
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
                style={styles.input}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={onChange}
                value={value}
                placeholderTextColor="#8a99a7"
              />
            )}
          />
          {errors.email && (
            <Text style={styles.errorText}>
              {errors.email.type === "required"
                ? <Text>Email is required</Text>
                : <Text>Invalid email</Text>}
            </Text>
          )}

          {/* Gender picker field */}
          <Text style={styles.label}>Gender</Text>
          <Controller
            control={control}
            name="gender"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  style={styles.picker}
                  dropdownIconColor="#23406e"
                >
                  <Picker.Item label="Select gender" value="" color="#8a99a7" />
                  <Picker.Item label="Male" value="male" />
                  <Picker.Item label="Female" value="female" />
                  <Picker.Item label="Other" value="other" />
                </Picker>
              </View>
            )}
          />
          {errors.gender && (
            <Text style={styles.errorText}>Gender is required</Text>
          )}

          {/* Password input field */}
          <Text style={styles.label}>Password</Text>
          <Controller
            control={control}
            name="password"
            rules={{ required: true, minLength: 6 }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Password (min 6 chars)"
                secureTextEntry
                onChangeText={onChange}
                value={value}
                placeholderTextColor="#8a99a7"
              />
            )}
          />
          {errors.password && (
            <Text style={styles.errorText}>
              {errors.password.type === "required"
                ? <Text>Password is required</Text>
                : <Text>Password must be at least 6 characters</Text>}
            </Text>
          )}

          {/* Confirm Password input field */}
          <Text style={styles.label}>Confirm Password</Text>
          <Controller
            control={control}
            name="confirmPassword"
            rules={{
              required: true,
              validate: (value) =>
                value === watch("password") || "Passwords do not match",
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Confirm password"
                secureTextEntry
                onChangeText={onChange}
                value={value}
                placeholderTextColor="#8a99a7"
              />
            )}
          />
          {errors.confirmPassword && (
            <Text style={styles.errorText}>
              {errors.confirmPassword.type === "required"
                ? <Text>Confirm password is required</Text>
                : <Text>Passwords do not match</Text>}
            </Text>
          )}

          {/* Register Button */}
          {loading ? (
            <ActivityIndicator size="large" color="#e53935" />
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit(onSubmit)}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
          )}

          {/* Login Link */}
          <Text style={styles.loginText}>
            Already have an account?{' '}
            <Text
              style={styles.loginLink}
              onPress={() => router.push("/Login")}
            >
              Login
            </Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: width * 0.92,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    alignItems: "stretch",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#23406e",
    textAlign: "center",
    marginBottom: 28,
    marginTop: 8,
  },
  label: {
    fontSize: 16,
    color: "#23406e",
    marginBottom: 6,
    marginTop: 10,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#f3f6f9",
    borderColor: "#dbe2ea",
    borderWidth: 1,
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 2,
    color: "#23406e",
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 13,
    marginBottom: 2,
    marginLeft: 2,
  },
  button: {
    backgroundColor: "#23406e",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 22,
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1,
  },
  loginText: {
    color: "#4f6cb7",
    fontSize: 15,
    textAlign: "center",
    marginTop: 6,
  },
  loginLink: {
    color: "#4f8cff",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  pickerContainer: {
    backgroundColor: "#f3f6f9",
    borderColor: "#dbe2ea",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 2,
    marginTop: 2,
    overflow: "hidden",
  },
  picker: {
    color: "#23406e",
    width: "100%",
  
  },
});

export default SignUp;
