/**
 * Componente que muestra la derivación por izquierda directamente.
 */
import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalisisResult } from '../../services/grammar';

@Component({
  selector: 'app-derivacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './derivacion.html',
  styleUrl: './derivacion.css'
})
export class DerivacionComponent implements OnChanges {

  @Input() resultado: AnalisisResult | null = null;

  ngOnChanges(): void {}

  /**
   * Retorna la clase CSS según el tipo de producción.
   *
   * @param paso - texto del paso
   * @returns clase CSS
   */
  claseDelPaso(paso: string): string {
    if (paso.startsWith('Exp')) return 'paso-exp';
    if (paso.startsWith('Term')) return 'paso-term';
    if (paso.startsWith('Factor')) return 'paso-factor';
    return 'paso-default';
  }
}