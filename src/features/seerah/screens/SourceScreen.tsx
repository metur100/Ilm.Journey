import { router, useLocalSearchParams } from 'expo-router';

import { AppText } from '@/core/components/ui/AppText';
import { Screen } from '@/core/components/ui/Screen';
import { EmptyState } from '@/core/components/ui/States';
import { TopBar } from '@/core/components/ui/TopBar';
import { useTheme } from '@/core/theme';

import { SourceCard } from '../components/Blocks';
import { getSource } from '../content';
import { useSeerahI18n } from '../i18n';

/** A source record, opened from the references under a statement. */
export default function SourceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useSeerahI18n();
  const { c } = useTheme();
  const source = getSource(String(id));
  return (
    <Screen header={<TopBar title={t('type.source')} backIcon="close" backLabel={t('a11y.close')} />}>
      {source ? (
        <>
          <SourceCard source={source} />
          <AppText variant="small" color={c.textMuted}>
            {t('sourcesPage.p2')}
          </AppText>
        </>
      ) : (
        <EmptyState icon="scroll" title={t('notFound.title')} actionLabel={t('common.back')} onAction={() => router.back()} />
      )}
    </Screen>
  );
}
