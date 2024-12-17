import { L10nConfig, L10nLoader } from 'angular-l10n';

export const l10nConfig: L10nConfig = {
  format: 'language-region',
  providers: [
    {
      name: 'app',
      asset: './assets/',
      options: { version: '1.0.0' },
    },
  ],
  cache: true,
  keySeparator: '.',
  defaultLocale: {
    language: 'en-US',
  },

  schema: [
    {
      locale: { language: 'en-US'},
    },
    {
      locale: { language: 'fr'},
    },
  ],
};

export function initL10n(l10nLoader: L10nLoader): () => Promise<void> {
  return () => l10nLoader.init();
}
