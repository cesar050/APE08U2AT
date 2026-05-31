/**
 * Componente de entrada con tabla léxica en tiempo real.
 */
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
        this.error = res.error || '';
      },
      error: () => {
        this.tablaLexica = [];
      }
    });
  }

  /**
   * Agrega un símbolo al final de la expresión.
   *
   * @param simbolo - símbolo a insertar
   */
  insertarSimbolo(simbolo: string): void {
    this.expresion += (this.expresion.length > 0 ? ' ' : '') + simbolo;
    this.onInput();
  }

  /**
   * Carga un ejemplo en el input.
   *
   * @param ejemplo - expresión de ejemplo
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
   */
  analizar(): void {
    if (!this.expresion.trim()) {
      this.error = 'Ingresa una expresión para analizar.';
      return;
    }
    if (this.error) return;

    this.cargando = true;

    this.grammarService.analizar(this.expresion).subscribe({
      next: (resultado) => {
        this.cargando = false;
        this.resultadoEmitido.emit(resultado);
      },
      error: (err) => {
        this.cargando = false;
        this.error = err.error?.error || 'Expresión inválida. Revisa la sintaxis.';
      }
    });
  }
}