import { theme } from '@/theme/theme';
import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import Svg, { Line, Polyline, Circle } from 'react-native-svg';
import { hooks } from '@/hooks';
import { components } from '@/components';
import { data } from '@/constants/data';

// Enable layout animations for smooth accordion transitions on Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

type FAQItemType = { id: number; question: string; answer: string };

const AccordionItem: React.FC<{ item: FAQItemType; isOpen: boolean; onPress: () => void }> = ({ item, isOpen, onPress }) => {
  return (
    <View style={[styles.card, isOpen && styles.cardActive]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.cardHeader}>
        <Text style={styles.questionText}>{item.question}</Text>
        <View style={[styles.arrowContainer, isOpen && styles.arrowContainerActive]}>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={theme.colors.lightText} strokeWidth={3}>
            <Polyline points="6 9 12 15 18 9" />
          </Svg>
        </View>
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.cardBody}>
          <Text style={styles.answerText}>{item.answer}</Text>
        </View>
      )}
    </View>
  );
};

export const FAQ: React.FC = () => {
  const { navigate } = hooks.useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filteredFAQs = useMemo(() => {
    const list = data.faqData || [];
    if (!searchQuery.trim()) return list;
    return list.filter((item: FAQItemType) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const toggleItem = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(prevId => (prevId === id ? null : id));
  };

  return (
    <components.SafeAreaView>
      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate(-1)} style={styles.backBtn}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={theme.colors.primaryText} strokeWidth={2.5}>
            <Line x1={19} y1={12} x2={5} y2={12} /><Polyline points="12 19 5 12 12 5" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQ & Help</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={theme.colors.lightText} strokeWidth={2.2}>
            <Circle cx={11} cy={11} r={8} /><Line x1={21} y1={21} x2={16.65} y2={16.65} />
          </Svg>
          <TextInput
            placeholder="Search FAQs..."
            placeholderTextColor={theme.colors.lightText}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={{ fontSize: 16, color: theme.colors.lightText, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* FAQ list */}
      {filteredFAQs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 40, marginBottom: 15 }}>❓</Text>
          <Text style={styles.emptyText}>No matching FAQs</Text>
          <Text style={styles.emptySub}>Try typing a different keyword or searching for a common issue.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredFAQs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <AccordionItem
              item={item}
              isOpen={expandedId === item.id}
              onPress={() => toggleItem(item.id)}
            />
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
  header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: theme.colors.warmWhite },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.primaryText, fontFamily: 'Outfit' },
  searchSection: { paddingHorizontal: 20, marginVertical: 12 },
  searchBar: { backgroundColor: theme.colors.warmWhite, borderRadius: 16, flexDirection: 'row', alignItems: 'center', height: 48, paddingHorizontal: 16, borderWidth: 1, borderColor: theme.colors.border, gap: 10 },
  searchInput: { flex: 1, fontSize: 14, color: theme.colors.primaryText, fontFamily: 'Outfit', paddingVertical: 0 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyText: { fontSize: 18, fontWeight: '700', color: theme.colors.primaryText, fontFamily: 'Outfit', marginBottom: 8 },
  emptySub: { fontSize: 13, color: theme.colors.lightText, fontFamily: 'Outfit', textAlign: 'center', lineHeight: 18 },
  listContainer: { paddingHorizontal: 20, paddingBottom: 20, gap: 12 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' },
  cardActive: { borderColor: theme.colors.primaryGreen },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, gap: 12 },
  questionText: { fontSize: 14, fontWeight: '700', color: theme.colors.primaryText, fontFamily: 'Outfit', flex: 1 },
  arrowContainer: { transform: [{ rotate: '0deg' }] },
  arrowContainerActive: { transform: [{ rotate: '180deg' }] },
  cardBody: { paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: theme.colors.warmWhite, paddingTop: 12 },
  answerText: { fontSize: 13, color: '#666', lineHeight: 18, fontFamily: 'Outfit' },
});
