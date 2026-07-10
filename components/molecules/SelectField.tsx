import { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/atoms/AppText";
import { SearchInput } from "@/components/molecules/SearchInput";
import { colors, radius, spacing, typography } from "@/theme";

export type SelectOption = {
  id: string | number;
  label: string;
};

type SelectFieldProps = {
  placeholder: string;
  value: SelectOption | null;
  options: SelectOption[];
  onSelect: (option: SelectOption) => void;
  disabled?: boolean;
  loading?: boolean;
  searchPlaceholder?: string;
};

export function SelectField({
  placeholder,
  value,
  options,
  onSelect,
  disabled = false,
  loading = false,
  searchPlaceholder = "Buscar...",
}: SelectFieldProps) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return options;
    }

    return options.filter((option) =>
      option.label.toLowerCase().includes(normalizedSearch)
    );
  }, [options, search]);

  function handleOpen() {
    if (disabled || loading) {
      return;
    }

    setSearch("");
    setVisible(true);
  }

  function handleSelect(option: SelectOption) {
    onSelect(option);
    setVisible(false);
  }

  return (
    <>
      <Pressable
        style={[styles.field, disabled && styles.fieldDisabled]}
        onPress={handleOpen}
      >
        <AppText
          variant="field"
          color={value ? colors.text.primary : colors.text.placeholder}
        >
          {loading ? "Carregando..." : value ? value.label : placeholder}
        </AppText>

        <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
      </Pressable>

      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)} />

        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <AppText variant="subtitle" style={styles.sheetTitle}>
              {placeholder}
            </AppText>

            <Pressable onPress={() => setVisible(false)}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </Pressable>
          </View>

          <SearchInput
            value={search}
            onChangeText={setSearch}
            placeholder={searchPlaceholder}
            placeholderTextColor={colors.text.placeholder}
            iconName="search-outline"
            containerStyle={styles.searchBox}
            inputStyle={styles.searchInput}
          />

          <FlatList
            data={filteredOptions}
            keyExtractor={(item) => String(item.id)}
            keyboardShouldPersistTaps="handled"
            style={styles.list}
            renderItem={({ item }) => (
              <Pressable style={styles.optionItem} onPress={() => handleSelect(item)}>
                <AppText variant="field" color={colors.text.primary}>
                  {item.label}
                </AppText>

                {value?.id === item.id && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </Pressable>
            )}
            ListEmptyComponent={
              <AppText
                variant="field"
                color={colors.text.secondary}
                style={styles.emptyText}
              >
                Nenhum resultado encontrado.
              </AppText>
            }
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    height: 54,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  fieldDisabled: {
    opacity: 0.5,
  },

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  sheet: {
    maxHeight: "70%",
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },

  sheetTitle: {
    color: colors.text.primary,
  },

  searchBox: {
    height: 54,
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },

  searchInput: {
    ...typography.field,
  },

  list: {
    flexGrow: 0,
  },

  optionItem: {
    minHeight: 54,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  emptyText: {
    textAlign: "center",
    marginTop: spacing.md,
  },
});
