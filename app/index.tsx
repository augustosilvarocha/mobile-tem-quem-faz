import { StyleSheet, View } from "react-native";
import { WelcomeHeader } from "@/components/organisms/WelcomeHeader";
import { WelcomeActions } from "@/components/organisms/WelcomeActions";
import { colors } from "@/theme";

export default function Welcome() {
  return (
    <View style={styles.container}>
      <WelcomeHeader />
      <WelcomeActions />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
});