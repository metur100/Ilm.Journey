import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/useTheme';
import { fonts } from '../theme/tokens';
import { ArabicLetterCard, Art, artCategories, artNames, catalogue, type ArtCategory } from './index';

const SIZES = [32, 64, 120] as const;
const LETTERS = ['ا', 'ب', 'ج', 'د', 'ه', 'و', 'ي', 'ك'];

/**
 * Dev-only gallery of every art piece (not a route – mount it from a dev screen). Toggle dark surface, size and
 * category; tap a piece to see it large.
 */
export function ArtGallery() {
  const { c, dark: themeDark } = useTheme();
  const [dark, setDark] = useState(themeDark);
  const [size, setSize] = useState<(typeof SIZES)[number]>(64);
  const [category, setCategory] = useState<ArtCategory | 'all' | 'letters'>('all');
  const [selected, setSelected] = useState<string | null>(null);
  const names = useMemo(() => (category === 'all' ? artNames : artNames.filter((n) => catalogue[n].category === category)), [category]);
  const surface = dark ? '#181C3B' : '#FFFFFF';
  const text = dark ? '#B4B8D6' : '#555A75';

  const chip = (label: string, active: boolean, onPress: () => void) => (
    <Pressable key={label} onPress={onPress} style={[styles.chip, { borderColor: c.border, backgroundColor: active ? c.primary : c.surface }]}>
      <Text style={{ color: active ? c.onPrimary : c.text, fontFamily: fonts.semibold, fontSize: 13 }}>{label}</Text>
    </Pressable>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: dark ? '#0E1128' : '#FBF5EA' }} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: dark ? '#F2EFE7' : '#1D1F33' }]}>Art library · {artNames.length} pieces</Text>
      <View style={styles.row}>
        {chip(dark ? 'Dark surface' : 'Light surface', true, () => setDark((d) => !d))}
        {SIZES.map((s) => chip(`${s} dp`, size === s, () => setSize(s)))}
      </View>
      <View style={styles.row}>
        {chip('all', category === 'all', () => setCategory('all'))}
        {artCategories.map((cat) => chip(cat, category === cat, () => setCategory(cat)))}
        {chip('letters', category === 'letters', () => setCategory('letters'))}
      </View>

      {selected && (
        <Pressable onPress={() => setSelected(null)} style={[styles.preview, { backgroundColor: surface }]}>
          <Art name={selected} size={280} dark={dark} label={selected} />
          <Text style={{ color: text, marginTop: 8 }}>
            {selected} · aspect {catalogue[selected].aspect.toFixed(2)}
          </Text>
        </Pressable>
      )}

      {category === 'letters' ? (
        <View style={styles.grid}>
          {LETTERS.map((l, i) => (
            <ArabicLetterCard key={l} letter={l} size={size === 32 ? 64 : size} dark={dark} tone={(['gold', 'teal', 'night', 'rose'] as const)[i % 4]} />
          ))}
        </View>
      ) : (
        <View style={styles.grid}>
          {names.map((name) => (
            <Pressable key={name} onPress={() => setSelected(name)} style={[styles.cell, { backgroundColor: surface, width: Math.max(96, size + 24) }]}>
              <View style={[styles.artBox, { height: size }]}>
                <Art name={name} size={Math.min(size, size * catalogue[name].aspect)} dark={dark} />
              </View>
              <Text numberOfLines={1} style={[styles.name, { color: text }]}>
                {name}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12 },
  title: { fontFamily: fonts.heavy, fontSize: 20 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, minHeight: 36, justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell: { borderRadius: 14, padding: 8, alignItems: 'center' },
  artBox: { alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 10, marginTop: 6, maxWidth: '100%' },
  preview: { borderRadius: 18, padding: 16, alignItems: 'center' },
});

export default ArtGallery;
