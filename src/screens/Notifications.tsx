import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import Svg, { Line, Polyline } from 'react-native-svg';
import { hooks } from '@/hooks';
import { constants } from '@/constants';
import { components } from '@/components';
import { items } from '@/items';
import { data } from '@/constants/data';

export const Notifications: React.FC = () => {
  const { navigate } = hooks.useRouter();
  const [list, setList] = useState(data.notifications || []);

  const handleClearAll = () => {
    setList([]);
  };

  return (
    <components.SafeAreaView>
      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate(-1)} style={styles.backBtn}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#1E2022" strokeWidth={2.5}>
            <Line x1={19} y1={12} x2={5} y2={12} /><Polyline points="12 19 5 12 12 5" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {list.length > 0 ? (
          <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {/* List content */}
      {list.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 45, marginBottom: 15 }}>🔔</Text>
          <Text style={styles.emptyText}>No Notifications</Text>
          <Text style={styles.emptySub}>We'll notify you here when your order is prepared or delivered!</Text>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemWrapper}>
              <items.NotificationItem notification={item} />
            </View>
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <components.BottomTabBar />
    </components.SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F5' },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit', marginLeft: 16, flex: 1 },
  clearBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  clearText: { fontSize: 13, fontWeight: '700', color: '#0F5B35', fontFamily: 'Outfit' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit', marginBottom: 8 },
  emptySub: { fontSize: 13, color: '#7E8B97', fontFamily: 'Outfit', textAlign: 'center', lineHeight: 18 },
  listContainer: { padding: 20, gap: 14 },
  itemWrapper: { width: '100%' },
});
