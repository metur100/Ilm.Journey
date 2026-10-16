import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Art } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import { type GameApi, type GameDef, registerGame } from '@/core/games';
import { Burst, GameBoard, kitResult, MemoryPairs, Pop, useKitColors } from '@/core/games/kit';
import { spacing } from '@/core/theme';

import { F, L } from '../shared/facts';
import { gratitudeI18n } from './i18n';

/*
 * The Gratitude Jar – MemoryPairs. Every found pair drops a thank-you note into the jar above the cards.
 * L1: four picture pairs, shown at the start. L2: six pairs from memory. L3 (twist): a blessing and a way of
 * thanking for it (words, hearts, using a gift well – lesson "Shukr").
 */

interface Pair {
  id: string;
  art: string;
  key: string;
  /** L3: the thanks card (text). */
  thanks?: string;
}

export interface JarConfig {
  prompt: string;
  pairs: Pair[];
  peekMs?: number;
  fact: string;
}

const B = (id: string, art: string, thanks?: string): Pair => ({ id, art, key: `b.${id}`, thanks });

const L1 = [B('water', 'food.water'), B('bread', 'food.bread'), B('home', 'place.house'), B('sun', 'garden.sun')];
const L2 = [...L1, B('rain', 'garden.cloud'), B('fruit', 'food.fruit-bowl')];
const L3 = [B('bread', 'food.bread', 'thanks.bread'), B('water', 'food.water', 'thanks.water'), B('gift', 'object.gift', 'thanks.gift'), B('book', 'object.book', 'thanks.book'), B('toys', 'akhlaq.toy-box', 'thanks.toys')];

const FACTS = { shukr: L.shukr(), count: F.countBlessings(), thank: F.thankPeopleHadith(), people: L.thankPeople() };

function Jar({ count, total, label }: { count: number; total: number; label: string }) {
  const k = useKitColors();
  return (
    <View style={styles.jarRow} accessible accessibilityLabel={label}>
      <Pop trigger={count}>
        <View>
          <Art name="akhlaq.gratitude-jar" size={64} />
          <Burst trigger={count} distance={40} />
        </View>
      </Pop>
      <View style={styles.notes}>
        {Array.from({ length: total }, (_, i) => (
          <View key={i} style={{ opacity: i < count ? 1 : 0.25 }}>
            <Art name="akhlaq.note-heart" size={30} />
          </View>
        ))}
      </View>
      <AppText variant="small" color={k.textMuted}>{`${count}/${total}`}</AppText>
    </View>
  );
}

function GratitudeJarGame(api: GameApi<JarConfig>) {
  const { pairs, prompt, peekMs, fact } = api.config;
  const [found, setFound] = useState(0);
  return (
    <GameBoard api={api}>
      <Jar count={found} total={pairs.length} label={api.t('jar.count', { count: found, total: pairs.length })} />
      <MemoryPairs
        pairs={pairs.map((p) => ({
          id: p.id,
          a: { art: p.art, label: api.t(p.key) },
          b: p.thanks ? { label: api.t(p.thanks) } : undefined,
        }))}
        peekMs={peekMs}
        columns={pairs.length > 4 ? 4 : undefined}
        prompt={api.t(prompt)}
        onProgress={({ done }) => setFound(done)}
        onDone={({ mistakes }) => api.onComplete(kitResult({ moves: pairs.length, mistakes, factsMissed: mistakes > 0 ? [fact] : [] }))}
      />
    </GameBoard>
  );
}

const styles = StyleSheet.create({
  jarRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  notes: { flexDirection: 'row', flexWrap: 'wrap', gap: 2, maxWidth: 200, justifyContent: 'center' },
});

export const gratitudeJarGame: GameDef<JarConfig> = {
  id: 'gratitude-jar',
  topicId: 'akhlaq',
  i18n: gratitudeI18n,
  coverArt: 'akhlaq.gratitude-jar',
  hintArt: 'akhlaq.note-heart',
  component: GratitudeJarGame,
  levels: [
    { level: 1, config: { prompt: 'play.l1', pairs: L1, peekMs: 2500, fact: FACTS.shukr.id }, facts: [FACTS.shukr] },
    { level: 2, config: { prompt: 'play.l2', pairs: L2, fact: FACTS.count.id }, facts: [FACTS.count] },
    { level: 3, config: { prompt: 'play.l3', pairs: L3, fact: FACTS.thank.id }, facts: [FACTS.thank, FACTS.people] },
  ],
  order: 120,
};

export function registerGratitudeJarGame(): void {
  registerGame(gratitudeJarGame);
}
