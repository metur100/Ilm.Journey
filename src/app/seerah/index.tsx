import { Redirect } from 'expo-router';

/** `/seerah` (old tab, deep links): the Seerah now lives in the Stories tab's "Seerah" segment. */
export default function SeerahIndex() {
  return <Redirect href={{ pathname: '/(tabs)/stories', params: { segment: 'seerah' } }} />;
}
