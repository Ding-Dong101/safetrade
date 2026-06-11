import { StyleSheet } from "react-native";

export const colors = {
  navy: "#0F1B2D",
  amber: "#00D68F",
  white: "#f5f5f5",
};

export const globalStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.navy,
    flex: 1,
  },
  text: {
    color: colors.white,
    alignSelf: "center",
    paddingTop: 30,
  },
});
