import { ComingSoon } from '@/core/components/ui/ComingSoon';
import { useI18n } from '@/core/i18n';

/** Seerah tab – placeholder. OWNED BY THE SEERAH PORT (replace with the episode journey). */
export default function SeerahScreen() {
  const { t } = useI18n();
  return <ComingSoon icon="kaaba" title={t('placeholder.seerah.title')} body={t('placeholder.seerah.body')} />;
}
