/**
 * Configuración principal de la aplicación Angular.
 * Habilita HttpClient para peticiones HTTP.
 */
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient()
  ]
};