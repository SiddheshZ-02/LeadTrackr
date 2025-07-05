import { Provider } from "react-redux";
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import store from "@/Store/store";
import { useDispatch, useSelector } from "react-redux";
import { loadToken } from "@/Store/authSlice";
import { RootState, AppDispatch } from "@/Store/store";
import { ToastAndroid } from "react-native";

function AppInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { token, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(loadToken());
  }, [dispatch]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (token && !user) {
        try {
          const response = await fetch("https://api.escuelajs.co/api/v1/auth/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const userData = await response.json();
          if (response.ok) {
            dispatch({ type: "auth/loginUser/fulfilled", payload: { access_token: token, user: userData } });
          }
        } catch (e) {
          ToastAndroid.showWithGravity(
            "Failed to load user profile. Please login again.",
            ToastAndroid.LONG,
            ToastAndroid.BOTTOM
          );
        }
      }
    };
    fetchProfile();
  }, [token, user, dispatch]);

  return <>{children}</>;
}

const _layout = () => {
  return (
    <Provider store={store}>
      <AppInitializer>
        <Stack>
          <Stack.Screen name='index' options={{headerShown:false}}/>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} 
          />
          <Stack.Screen name="(protected)" options={{headerShown:false}}/>
        </Stack>
      </AppInitializer>
    </Provider>
  );
};

export default _layout;
