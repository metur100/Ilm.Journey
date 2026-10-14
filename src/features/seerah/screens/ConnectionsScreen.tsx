import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Screen } from '@/core/components/ui/Screen';
import { EmptyState } from '@/core/components/ui/States';
import { TopBar } from '@/core/components/ui/TopBar';
import { makeStyles, radius, spacing, useTheme } from '@/core/theme';

import { ConnectionCard } from '../components/Cards';
import { ChapterHeader } from '../components/Controls';
import { ConnectionView } from '../components/ConnectionView';
import { SEERAH_CONTENT } from '../content';
import { useSeerahI18n } from '../i18n';
import { openNode } from '../navigation';
import { connectionsOf, type NodeType } from '../services/connections';

const TYPES: readonly NodeType[] = ['event', 'person', 'place', 'episode', 'theme'];

const useStyles = makeStyles((c) => ({
  center: { borderWidth: 1.5, borderColor: c.goldText, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
}));

/**
 * "How is everything connected?" – an explorable relationship view. Tapping a connected card
 * moves the centre to it (Event → People → Place → Related Event → …).
 */
export default function ConnectionsScreen() {
  const params = useLocalSearchParams<{ type: string; id: string }>();
  const { t } = useSeerahI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const type = TYPES.includes(params.type as NodeType) ? (params.type as NodeType) : null;
  const id = String(params.id);
  const groups = type ? connectionsOf({ type, id }, SEERAH_CONTENT) : [];

  return (
    <Screen header={<TopBar title={t('connections.title')} />}>
      <ChapterHeader title={t('connections.title')} subtitle={t('connections.subtitle')} />
      {type ? (
        <>
          <View style={styles.center}>
            <AppText variant="label" color={c.goldText}>
              {t(`type.${type}`).toUpperCase()}
            </AppText>
            <ConnectionCard type={type} id={id} onPress={() => openNode(type, id)} />
            <Button label={t('common.open')} variant="ghost" size="md" iconRight="chevron" onPress={() => openNode(type, id)} />
          </View>
          {groups.length ? (
            <ConnectionView groups={groups} onNodePress={(nt, nid) => router.push({ pathname: '/seerah/connections/[type]/[id]', params: { type: nt, id: nid } })} />
          ) : (
            <EmptyState icon="link" title={t('search.empty', { query: '' })} />
          )}
        </>
      ) : (
        <EmptyState icon="link" title={t('notFound.title')} actionLabel={t('common.back')} onAction={() => router.back()} />
      )}
    </Screen>
  );
}
