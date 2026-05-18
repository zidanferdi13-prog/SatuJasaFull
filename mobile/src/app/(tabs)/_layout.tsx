import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Shadow } from '../../theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const tabMeta: Record<string, { label: string; icon: IconName; activeIcon: IconName }> = {
  dashboard: { label: 'Dashboard', icon: 'home-outline', activeIcon: 'home' },
  transactions: { label: 'Transaksi', icon: 'document-text-outline', activeIcon: 'document-text' },
  revenue: { label: 'Revenue', icon: 'stats-chart-outline', activeIcon: 'stats-chart' },
  settings: { label: 'Pengaturan', icon: 'settings-outline', activeIcon: 'settings' },
};

function AppTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.tabShell}>
      <View style={styles.tabBar}>
        {state.routes.slice(0, 2).map((route: any, index: number) => {
          const focused = state.index === index;
          const options = descriptors[route.key]?.options ?? {};
          const meta = tabMeta[route.name];
          const label = meta?.label ?? options.title ?? route.name;

          if (!meta) return null;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              style={[styles.tabItem, focused && styles.tabItemActive]}
            >
              <View style={[styles.iconBadge, focused && styles.iconBadgeActive]}>
                <Ionicons
                  name={focused ? meta.activeIcon : meta.icon}
                  size={focused ? 20 : 21}
                  color={focused ? Colors.surface : Colors.textLight}
                />
              </View>
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]} numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          );
        })}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tambah transaksi"
          onPress={() => navigation.navigate('transactions/create')}
          style={styles.createTab}
        >
          <View style={styles.createButton}>
            <Ionicons name="add" size={30} color={Colors.surface} />
          </View>
          <Text style={styles.createLabel}>Tambah</Text>
        </Pressable>

        {state.routes.slice(3).map((route: any, index: number) => {
          const routeIndex = index + 3;
          const focused = state.index === routeIndex;
          const options = descriptors[route.key]?.options ?? {};
          const meta = tabMeta[route.name];
          const label = meta?.label ?? options.title ?? route.name;

          if (!meta) return null;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              style={[styles.tabItem, focused && styles.tabItemActive]}
            >
              <View style={[styles.iconBadge, focused && styles.iconBadgeActive]}>
                <Ionicons
                  name={focused ? meta.activeIcon : meta.icon}
                  size={focused ? 20 : 21}
                  color={focused ? Colors.surface : Colors.textLight}
                />
              </View>
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]} numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', headerTitle: 'Dashboard' }} />
      <Tabs.Screen name="transactions" options={{ title: 'Transaksi', headerTitle: 'Transaksi' }} />
      <Tabs.Screen name="tracking" options={{ href: null, title: 'Tracking', headerTitle: 'Tracking' }} />
      <Tabs.Screen name="revenue" options={{ title: 'Revenue', headerTitle: 'Revenue' }} />
      <Tabs.Screen name="settings" options={{ title: 'Pengaturan', headerTitle: 'Pengaturan' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabShell: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    left: 14,
  },
  tabBar: {
    minHeight: 74,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#DDE8F8',
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadow.md,
  },
  tabItem: {
    flex: 1,
    minHeight: 58,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabItemActive: {
    backgroundColor: Colors.primaryLight,
  },
  createTab: {
    flex: 1,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  createButton: {
    width: 52,
    height: 52,
    marginTop: -24,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryDark,
    borderWidth: 4,
    borderColor: Colors.surface,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.26,
    shadowRadius: 14,
    elevation: 8,
  },
  createLabel: {
    color: Colors.primaryDark,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  iconBadge: {
    width: 34,
    height: 30,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadgeActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  tabLabel: {
    color: Colors.textLight,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  tabLabelActive: {
    color: Colors.primaryDark,
  },
});
