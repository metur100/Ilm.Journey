import { registerFeatures } from '@/features';
import {
  defineNamespace,
  getCoreDictionaries,
  getNamespaces,
  languageFromLocale,
  localize,
  localizedFrom,
  translate,
  translateAny,
  translateNs,
} from '@/core/i18n';
import { BADGES } from '@/core/services/badges';
import { LANGUAGES, TOPIC_IDS } from '@/core/models';

registerFeatures();

const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();

function expectComplete(name: string, dicts: Record<string, Record<string, string>>) {
  const en = dicts.en;
  for (const lang of LANGUAGES) {
    const dict = dicts[lang];
    expect({ name, lang, keys: Object.keys(dict).sort() }).toEqual({ name, lang, keys: Object.keys(en).sort() });
    for (const key of Object.keys(en)) {
      expect({ name, lang, key, empty: dict[key].trim().length === 0 }).toEqual({ name, lang, key, empty: false });
      expect({ name, lang, key, p: placeholders(dict[key]) }).toEqual({ name, lang, key, p: placeholders(en[key]) });
    }
  }
}

describe('localization', () => {
  it('has every core key in en, de and bs with the same placeholders', () => {
    expectComplete('core', getCoreDictionaries());
  });

  it('has every key of every registered feature namespace in en, de and bs', () => {
    const namespaces = getNamespaces();
    expect(namespaces.map((n) => n.name)).toContain('learn');
    for (const ns of namespaces) expectComplete(ns.name, ns.dictionaries);
  });

  it('names every topic and badge in all languages', () => {
    for (const lang of LANGUAGES) {
      for (const topic of TOPIC_IDS) expect(translate(lang, `topic.${topic}` as never)).not.toBe(`topic.${topic}`);
      for (const badge of BADGES) {
        expect(translate(lang, `badge.${badge.id}.name` as never)).not.toBe(`badge.${badge.id}.name`);
        expect(translate(lang, `badge.${badge.id}.desc` as never)).not.toBe(`badge.${badge.id}.desc`);
      }
    }
  });

  it('interpolates parameters', () => {
    expect(translate('en', 'common.level', { level: 4 })).toBe('Level 4');
    expect(translate('de', 'common.level', { level: 4 })).toBe('Stufe 4');
    expect(translate('bs', 'common.level', { level: 4 })).toBe('Nivo 4');
  });

  it('resolves feature keys, falls back to core keys and supports namespaced runtime keys', () => {
    const ns = defineNamespace('test-ns', { en: { hello: 'Hello {name}' }, de: { hello: 'Hallo {name}' }, bs: { hello: 'Zdravo {name}' } });
    expect(translateNs(ns, 'de', 'hello', { name: 'Amina' })).toBe('Hallo Amina');
    expect(translateNs(ns, 'bs', 'common.back')).toBe('Nazad');
    expect(translateAny('en', 'test-ns:hello', { name: 'Ali' })).toBe('Hello Ali');
    expect(translateAny('en', 'common.back')).toBe('Back');
    expect(() => defineNamespace('core', { en: {}, de: {}, bs: {} })).toThrow();
  });

  it('maps device locales to supported languages', () => {
    expect(languageFromLocale('bs')).toBe('bs');
    expect(languageFromLocale('hr')).toBe('bs');
    expect(languageFromLocale('sr')).toBe('bs');
    expect(languageFromLocale('de')).toBe('de');
    expect(languageFromLocale('fr')).toBe('en');
    expect(languageFromLocale(undefined)).toBe('en');
  });

  it('localizes content with an English fallback', () => {
    expect(localize({ en: 'Hi', de: 'Hallo', bs: '' }, 'bs')).toBe('Hi');
    expect(localize({ en: 'Hi', de: 'Hallo', bs: 'Zdravo' }, 'de')).toBe('Hallo');
    expect(localize(undefined, 'en')).toBe('');
    expect(localizedFrom((lang) => translate(lang, 'common.back'))).toEqual({ en: 'Back', de: 'Zurück', bs: 'Nazad' });
  });
});
