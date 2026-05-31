/**
 * Servicio de comunicación con el backend Flask.
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  constructor(private http: HttpClient) {}

  /**
   * Analiza una expresión booleana completa.
   *
   * @param expresion - cadena de texto a analizar
   * @returns Observable con el resultado completo
   */
  analizar(expresion: string): Observable<AnalisisResult> {
    return this.http.post<AnalisisResult>(`${this.apiUrl}/analizar`, { expresion });
  }

  /**
   * Valida una expresión en tiempo real.
   *
   * @param expresion - cadena parcial mientras el usuario escribe
   * @returns Observable con tabla léxica y posible error
   */
  validar(expresion: string): Observable<ValidacionResult> {
    return this.http.post<ValidacionResult>(`${this.apiUrl}/validar`, { expresion });
  }
}