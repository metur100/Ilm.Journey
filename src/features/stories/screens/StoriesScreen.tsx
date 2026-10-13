import { ComingSoon } from '@/core/components/ui/ComingSoon';
import { useI18n } from '@/core/i18n';

/** Stories tab – placeholder. OWNED BY THE STORIES PORT (replace with the story list + map). */
export default function StoriesScreen() {
  const { t } = useI18n();
  return <ComingSoon icon="scroll" title={t('placeholder.stories.title')} body={t('placeholder.stories.body')} />;
}
