import React from "react";
import { router, Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

const _layout = () => {
  return (
    <Tabs
      tabBar={(props) => {
        return (
          <View
            style={{
              height: "6%",
              width: "50%",
              backgroundColor: "#247ba0",
              borderRadius: 100,
              position: "absolute",
              bottom: 10,
              left: "25%",
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "space-evenly",
            }}
          >
            <TouchableOpacity
              onPress={() => router.push("/(protected)/tableData")}
            >
              <MaterialIcons name="leaderboard" size={30} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                router.push("/(protected)/profile");
              }}
              style={{ position: "relative" }}
            >
              <FontAwesome name="user-circle-o" size={30} color="white" />
            </TouchableOpacity>
          </View>
        );
      }}
    >
      <Tabs.Screen
        name="tableData"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => {
            return focused ? (
              <MaterialIcons name="leaderboard" size={24} color="#23406e" />
            ) : (
              <MaterialIcons name="leaderboard" size={24} color="#247ba0" />
            );
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerTitle: "My Profile",
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "#247ba0",
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            height: 90,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4,
            elevation: 4,
          },
          headerTitleStyle: {
            color: "#fff",
            fontWeight: "bold",
            fontSize: 22,
            letterSpacing: 1,
          },
        }}
      />
      <Tabs.Screen
        name="addLeadForm"
        options={{ headerShown: false, href: null }}
      />
    </Tabs>
  );
};

export default _layout;
