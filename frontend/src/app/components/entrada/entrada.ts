import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GrammarService, AnalisisResult, TokenLexico } from '../../services/grammar';

@Component({
  selector: 'app-entrada',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entrada.html',
  styleUrl: './entrada.css'
})
export class EntradaComponent {

  expresion: string = '';
  cargando: boolean = false;
  error: string = '';
  tablaLexica: TokenLexico[] = [];

  @Output() resultadoEmitido = new EventEmitter<AnalisisResult>();

  ejemplos = [
    'A & ~ B | C',
    '~ ( A | B ) & C',
    'A | B & C',
    '~ A & B'
  ];

  readonly TIPOS_DESCRIPCION: Record<string, string> = {
    'ID':     'Identificador',
    'AND':    'Operador AND',
    'OR':     'Operador OR',
    'NOT':    'Operador NOT',
    'LPAREN': 'Paréntesis izquierdo',
    'RPAREN': 'Paréntesis derecho',
  };

  readonly TIPOS_COLOR: Record<string, string> = {
    'ID':     'tipo-id',
    'AND':    'tipo-and',
    'OR':     'tipo-or',
    'NOT':    'tipo-not',
    'LPAREN': 'tipo-par',
    'RPAREN': 'tipo-par',
  };

  constructor(private grammarService: GrammarService) {}

  /**
   * Valida errores sintácticos comunes antes de llamar al backend.
   * Evita peticiones HTTP innecesarias para errores evidentes.
   */
  private validarSintaxis(expresion: string): string {
    const tokens = expresion.trim().split(/\s+/);
    const ops = ['&', '|'];

    let paren = 0;
    for (const t of tokens) {
      if (t === '(') paren++;
      if (t === ')') paren--;
      if (paren < 0) return "Paréntesis de cierre sin apertura.";
    }
    if (paren > 0) return "Falta cerrar un paréntesis.";

    for (let i = 0; i < tokens.length - 1; i++) {
      if (ops.includes(tokens[i]) && ops.includes(tokens[i + 1])) {
        return `Operador '${tokens[i + 1]}' inesperado después de '${tokens[i]}'.`;
      }
    }

    if (ops.includes(tokens[0])) {
      return `La expresión no puede empezar con '${tokens[0]}'.`;
    }

    const ultimo = tokens[tokens.length - 1];
    if (ops.includes(ultimo)) {
      return `La expresión no puede terminar con '${ultimo}'.`;
    }

    return '';
  }

  /**
   * Se ejecuta al escribir en el input.
   * Valida en tiempo real y actualiza la tabla léxica.
   */
  onInput(): void {
    this.error = '';
    if (!this.expresion.trim()) {
      this.tablaLexica = [];
      return;
    }

    this.grammarService.validar(this.expresion).subscribe({
      next: (res) => {
        this.tablaLexica = res.tabla_lexica;
        if (res.error) {
          this.error = res.error;
        }
      },
      error: () => {
        this.tablaLexica = [];
      }
    });
  }

  /**
   * Agrega un símbolo al final de la expresión.
   */
  insertarSimbolo(simbolo: string): void {
    this.expresion += (this.expresion.length > 0 ? ' ' : '') + simbolo;
    this.onInput();
  }

  /**
   * Carga un ejemplo en el input.
   */
  cargarEjemplo(ejemplo: string): void {
    this.expresion = ejemplo;
    this.onInput();
  }

  /**
   * Limpia todo.
   */
  limpiar(): void {
    this.expresion = '';
    this.error = '';
    this.tablaLexica = [];
  }

  /**
   * Envía la expresión al backend para análisis completo.
   * Primero valida localmente para errores comunes sin llamar al backend.
   */
  analizar(): void {
    if (!this.expresion.trim()) {
      this.error = 'Ingresa una expresión para analizar.';
      return;
    }

    const errorLocal = this.validarSintaxis(this.expresion);
    if (errorLocal) {
      this.error = errorLocal;
      return;
    }

    this.cargando = true;
    this.error = '';

    this.grammarService.analizar(this.expresion).subscribe({
      next: (resultado: AnalisisResult) => {
        this.cargando = false;
        this.resultadoEmitido.emit(resultado);
      },
      error: (err: Error) => {
        this.cargando = false;
        this.error = err.message || 'Expresión inválida. Revisa la sintaxis.';
      },
      complete: () => {
        this.cargando = false;
      }
    });
  }
}