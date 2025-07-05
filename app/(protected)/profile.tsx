// profile.tsx
// This file handles the user profile page. It displays the current user's information and provides a logout button.
// Uses Redux for authentication state, Expo Router for navigation, and supports user logout.
//
// Workflow:
// 1. Fetches the current user and authentication state from Redux.
// 2. Displays user information (name, email, avatar, gender if available).
// 3. Provides a logout button that dispatches the logout action.
// 4. On logout, navigates the user back to the login page.
// 5. Shows a message if no user data is available.

import { View, Text, Image, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/Store/store'
import { logoutUser } from '@/Store/authSlice'

// Typed dispatch hook for thunks
import { useDispatch as useReduxDispatch } from 'react-redux';
import { useRouter } from 'expo-router'
const useAppDispatch: () => AppDispatch = useReduxDispatch;
 
// User type definition
// (Extend as needed for more user fields)
type User = {
  name: string;
  email: string;
  avatar?: string;
  gender?: string;
};

// Profile page component
const Profile = () => {
  const router = useRouter();
  // Get user and authentication state from Redux
  const user = useSelector((state: RootState) => state.auth.user as User | null);
  const token = useSelector((state: RootState) => state.auth.token);
  const loading = useSelector((state: RootState) => state.auth.loading);
  const dispatch = useAppDispatch();

  // Navigate to login page after logout (when token becomes null)
  useEffect(() => {
    if (!token) {
      router.replace('/Login');
    }
  }, [token]);

  // Handles user logout
  const handleLogout = async () => {
    await dispatch(logoutUser());
    // No navigation here! Navigation is handled by useEffect above.
  };

  // If no user data, show a message
  if(!user){
    return (
       <View style={styles.container}>
    <Text style={styles.info}><Text>No user data available.</Text></Text>
  </View>
    )
  }
  return (
    <View style={styles.container}>
      {/* Show user avatar if available */}
      {user.avatar && (
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
      )}
      {/* Show user name */}
      <Text style={styles.name}>{user.name}</Text>
      {/* Show user email */}
      <Text style={styles.email}>{user.email}</Text>
      <View style={styles.buttonContainer}>
        {/* Logout button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// Styles for the profile page UI
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
    name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#888',
    marginBottom: 24,
  },
  info: {
    fontSize: 18,
    color: '#888',
  },
  buttonContainer: {
    marginTop: 24,
    width: '60%',
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#e53935',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
  },
})

export default Profile