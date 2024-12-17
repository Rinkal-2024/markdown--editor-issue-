import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslationLoader } from './app.module';
import { l10nConfig } from './l10n-config';
import { provideL10nIntl, provideL10nTranslation } from 'angular-l10n';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideToastr(),
    provideNoopAnimations(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideL10nTranslation(l10nConfig, {
      translationLoader: TranslationLoader,
    }),
    provideL10nIntl(),
  ],
};
