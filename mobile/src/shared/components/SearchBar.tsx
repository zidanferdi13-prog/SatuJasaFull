import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadii, FontSizes } from '../../theme';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
}

export function SearchBar({ placeholder = 'Cari...', value, onChangeText, onClear }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={18} color={Colors.textSecondary} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.textLight}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && onClear && (
        <TouchableOpacity onPress={onClear} style={styles.clearBtn}>
          <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadii.md,
    paddingHorizontal: Spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  icon: { marginRight: Spacing.sm },
  input: { flex: 1, fontSize: FontSizes.md, color: Colors.text },
  clearBtn: { padding: Spacing.xs },
});