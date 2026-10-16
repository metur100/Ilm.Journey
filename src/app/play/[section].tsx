import { useLocalSearchParams } from 'expo-router';

import { SectionScreen } from '@/core/games/play/SectionScreen';

/** One Play section (Salah, Quran, Arabic / Sufara, …): a grid of its games. */
export default function PlaySectionRoute() {
  const { section } = useLocalSearchParams<{ section: string }>();
  return <SectionScreen key={section} section={String(section ?? '')} />;
}
