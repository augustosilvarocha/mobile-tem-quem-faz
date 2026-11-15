import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, radius, spacing } from "@/theme";

export function SkeletonBlock({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.block, style]} />;
}

type Layout = "providers" | "categories" | "categoryOptions" | "profile" | "form" | "portfolio";

export function LoadingSkeleton({ layout }: { layout: Layout }) {
  const grid = layout === "categories" || layout === "categoryOptions" || layout === "portfolio";
  const count = grid ? 6 : layout === "providers" ? 3 : 1;
  return (
    <View accessible accessibilityLabel="Carregando conteúdo" accessibilityState={{ busy: true }} style={styles.container}>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={grid ? styles.grid : styles.stack}>
        {Array.from({ length: count }, (_, index) => (
          <View key={index} style={[styles.card, grid && styles.tile]}>
            {layout === "providers" ? <>
              <View style={styles.row}>
                <SkeletonBlock style={styles.avatar} />
                <View style={styles.info}><SkeletonBlock style={styles.title} /><SkeletonBlock /><SkeletonBlock style={styles.short} /></View>
              </View>
              <SkeletonBlock style={styles.button} />
            </> : layout === "profile" ? <>
              <SkeletonBlock style={styles.profileAvatar} />
              <SkeletonBlock style={styles.title} /><SkeletonBlock /><SkeletonBlock style={styles.short} />
              <SkeletonBlock style={styles.description} /><SkeletonBlock style={styles.button} />
            </> : layout === "form" ? <>
              {Array.from({ length: 5 }, (_, field) => <View key={field} style={styles.stack}><SkeletonBlock style={styles.short} /><SkeletonBlock style={styles.field} /></View>)}
            </> : <>
              <SkeletonBlock style={layout === "categoryOptions" ? styles.option : styles.image} />
              {layout !== "categoryOptions" && <SkeletonBlock style={styles.short} />}
            </>}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%" },
  block: { height: 16, width: "100%", borderRadius: radius.sm, backgroundColor: colors.border, opacity: 0.55 },
  stack: { gap: spacing.md },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: spacing.sm },
  card: { padding: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, gap: spacing.md, backgroundColor: colors.white },
  tile: { width: "47%", padding: spacing.sm },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  info: { flex: 1, gap: spacing.sm },
  avatar: { height: 80, width: 80, borderRadius: 40 },
  profileAvatar: { height: 120, width: 120, borderRadius: 60, alignSelf: "center" },
  title: { height: 22, width: "80%" },
  short: { width: "60%" },
  button: { height: 44 },
  field: { height: 56 },
  description: { height: 100 },
  image: { height: 120 },
  option: { height: 44 },
});
