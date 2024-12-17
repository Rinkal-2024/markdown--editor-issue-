// src/app/app.module.ts

import { NgModule, CUSTOM_ELEMENTS_SCHEMA, Injectable, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {TranslateModule } from '@ngx-translate/core'
import { L10nLoader, L10nProvider, L10nTranslationLoader, L10nTranslationModule, L10nTranslationService } from 'angular-l10n';
import { from, Observable } from 'rxjs';
import {  l10nConfig } from './l10n-config';

@Injectable()
 export class TranslationLoader implements L10nTranslationLoader {
  public get(language: string, provider: L10nProvider): Observable<{ [key: string]: any }> {
    const data = import(`../assets/locale-${language}.json`);
    return from(data);
  }
}
export function initL10n(l10nLoader: L10nLoader): () => Promise<void> {
  return () => {
    return l10nLoader.init();
  };
}
@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    RouterModule,
    FormsModule,
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    L10nTranslationModule.forRoot(l10nConfig, {
      translationLoader: TranslationLoader,
    }),
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      newestOnTop: false,
      progressBar: true,
    }),
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initL10n,
      deps: [L10nLoader],
      multi: true,
    },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {
  constructor(private translationService: L10nTranslationService) {
    const savedLanguage = localStorage.getItem('language') || 'en-US';
    this.translationService.setLocale({ language: savedLanguage });
  }
}
