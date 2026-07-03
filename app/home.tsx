import { StyleSheet, View } from "react-native";
import { AppText } from "@/components/atoms/AppText";
import { colors } from "@/theme";

export default function Home() {
  return (
    <View style={styles.container}>
      <AppText variant="title" color={colors.primary}>
        Home
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.primary,
  },
});