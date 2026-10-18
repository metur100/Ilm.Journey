import { useEffect, useState } from 'react';

import { Button } from '@/core/components/ui/Button';
import { useReadAloud } from '@/core/hooks/useReadAloud';

import { useSeerahI18n } from '../i18n';
import { createNarration, type NarrationController } from '../services/narration';
import { narrationFor } from '../services/narrationRegistry';

/**
 * Listen to the episode. With a registered human recording (`episodeId`) it plays / pauses that recording; without
 * one (version 1 ships none) the device voice reads `text` aloud (Listen / Stop). Speech stops when the button
 * unmounts (another step, leaving the episode).
 */
export function NarrationButton({ episodeId, text }: { episodeId?: string; text: string }) {
  const { t, language } = useSeerahI18n();
  const recorded = episodeId !== undefined && narrationFor(episodeId, language) !== null;
  const [controller, setController] = useState<NarrationController | null>(null);
  const [playing, setPlaying] = useState(false);
  const voice = useReadAloud(language);

  useEffect(() => () => controller?.release(), [controller]);

  if (!recorded) {
    if (!text.trim()) return null;
    return (
      <Button
        label={t(voice.state === 'preparing' ? 'narration.preparing' : voice.state === 'speaking' ? 'narration.stop' : 'narration.play')}
        icon={voice.speaking ? 'stop' : 'speaker'}
        variant="secondary"
        onPress={() => voice.toggle(text)}
      />
    );
  }

  const toggle = () => {
    const player = controller ?? (episodeId ? createNarration(episodeId, language) : null);
    if (!player) return;
    if (!controller) setController(player);
    if (playing) player.pause();
    else player.play();
    setPlaying(!playing);
  };

  return <Button label={playing ? t('narration.pause') : t('narration.play')} icon={playing ? 'pause' : 'play'} variant="secondary" onPress={toggle} />;
}
