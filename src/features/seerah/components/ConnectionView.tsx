import { View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { makeStyles, radius, spacing, useTheme } from '@/core/theme';

import { useSeerahI18n } from '../i18n';
import type { ConnectionGroup, NodeType } from '../services/connections';
import { ConnectionCard } from './Cards';

const GROUP_TITLE = {
  person: 'explore.people',
  place: 'explore.places',
  event: 'explore.events',
  episode: 'explore.episodes',
  theme: 'explore.themes',
} as const satisfies Record<NodeType, string>;

const useStyles = makeStyles((c) => ({
  flex: { flex: 1, gap: spacing.sm, paddingBottom: spacing.lg },
  group: { flexDirection: 'row', gap: spacing.md },
  rail: { width: 14, alignItems: 'center', paddingTop: 3 },
  node: { width: 12, height: 12, borderRadius: radius.pill, backgroundColor: c.goldText },
  line: { width: 2, flex: 1, marginTop: 4, backgroundColor: c.border },
  cards: { gap: spacing.sm },
}));

/**
 * Relationship view: groups of connected nodes joined by a vertical line,
 * so the Seerah reads as a connected story rather than isolated facts.
 */
export function ConnectionView({
  groups,
  onNodePress,
  titles,
}: {
  groups: ConnectionGroup[];
  onNodePress?: (type: NodeType, id: string) => void;
  /** Optional custom titles per group index (e.g. for the event chain). */
  titles?: string[];
}) {
  const { c } = useTheme();
  const { t } = useSeerahI18n();
  const styles = useStyles();
  return (
    <View>
      {groups.map((group, index) => (
        <View key={`${group.type}-${index}`} style={styles.group}>
          <View style={styles.rail}>
            <View style={styles.node} />
            {index < groups.length - 1 ? <View style={styles.line} /> : null}
          </View>
          <View style={styles.flex}>
            <AppText variant="label" color={c.goldText} accessibilityRole="header">
              {(titles?.[index] ?? t(GROUP_TITLE[group.type])).toUpperCase()}
            </AppText>
            <View style={styles.cards}>
              {group.nodes.map((n) => (
                <ConnectionCard key={`${n.type}-${n.id}`} type={n.type} id={n.id} onPress={onNodePress ? () => onNodePress(n.type, n.id) : undefined} />
              ))}
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
