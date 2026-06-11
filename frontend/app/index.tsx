import { ScrollView, Text } from "react-native";
import { globalStyles } from "./styles/globalStyles";

export default function Index() {
  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.text}>Hello and welcome to Safe Trade 🙈</Text>
    </ScrollView>
  );
}
