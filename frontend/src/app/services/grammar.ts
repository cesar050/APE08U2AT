import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

export interface TokenLexico {
  valor: string;
  tipo: string;
  posicion: number;
}

export interface TreeNode {
  symbol: string;
  children: TreeNode[];
}

export interface AnalisisResult {
  expresion: string;
  tokens: string[];
  tabla_lexica: TokenLexico[];
  pasos: string[];
  arbol: TreeNode;
}

export interface ValidacionResult {
  tabla_lexica: TokenLexico[];
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class GrammarService {

  private apiUrl = 'http://localhost:5000/api';

  constructor(private zone: NgZone) {}

  private post<T>(endpoint: string, body: object): Observable<T> {
    return new Observable(observer => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${this.apiUrl}${endpoint}`);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.timeout = 3000;
      xhr.onload = () => {
        this.zone.run(() => {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            observer.next(data);
            observer.complete();
          } else {
            observer.error(new Error(data.error || 'Error desconocido.'));
          }
        });
      };
      xhr.onerror = () => {
        this.zone.run(() => {
          observer.error(new Error('No se pudo conectar con el servidor.'));
        });
      };
      xhr.ontimeout = () => {
        this.zone.run(() => {
          observer.error(new Error('El servidor tardó demasiado en responder.'));
        });
      };
      xhr.send(JSON.stringify(body));
    });
  }

  analizar(expresion: string): Observable<AnalisisResult> {
    return this.post<AnalisisResult>('/analizar', { expresion });
  }

  validar(expresion: string): Observable<ValidacionResult> {
    return this.post<ValidacionResult>('/validar', { expresion });
  }
}