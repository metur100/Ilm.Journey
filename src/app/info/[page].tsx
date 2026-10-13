import { useLocalSearchParams } from 'expo-router';
import { Linking } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { Card } from '@/core/components/ui/Card';
import { Screen } from '@/core/components/ui/Screen';
import { LinkRow } from '@/core/components/ui/SettingRow';
import { EmptyState } from '@/core/components/ui/States';
import { TopBar } from '@/core/components/ui/TopBar';
import { type CoreKey, useI18n } from '@/core/i18n';
import { privacyUrl } from '@/core/links';

const PAGES: Record<string, { title: CoreKey; paragraphs: CoreKey[] }> = {
  about: { title: 'about.title', paragraphs: ['about.p1', 'about.p2', 'about.p3', 'about.p4'] },
  privacy: { title: 'privacy.title', paragraphs: ['privacy.p1', 'privacy.p2', 'privacy.p3'] },
  sources: { title: 'sources.title', paragraphs: ['sources.p1', 'sources.p2', 'sources.p3'] },
};

export default function InfoPage() {
  const { page } = useLocalSearchParams<{ page: string }>();
  const { t, language } = useI18n();
  const config = PAGES[String(page)];

  if (!config) {
    return (
      <Screen header={<TopBar />}>
        <EmptyState icon="info" title={t('notFound.title')} />
      </Screen>
    );
  }

  return (
    <Screen header={<TopBar title={t(config.title)} />}>
      {config.paragraphs.map((key) => (
        <Card key={key}>
          <AppText variant="body">{t(key)}</AppText>
        </Card>
      ))}
      {page === 'privacy' ? (
        <Card>
          <LinkRow icon="external" label={t('settings.privacyOnline')} onPress={() => Linking.openURL(privacyUrl(language)).catch(() => undefined)} />
        </Card>
      ) : null}
    </Screen>
  );
}
