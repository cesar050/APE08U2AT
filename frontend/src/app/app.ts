/**
 * Componente raíz. Maneja tabs: Derivación y Árbol.
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntradaComponent } from './components/entrada/entrada';
import { DerivacionComponent } from './components/derivacion/derivacion';
import { ArbolComponent } from './components/arbol/arbol';
import { AnalisisResult } from './services/grammar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, EntradaComponent, DerivacionComponent, ArbolComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  resultado: AnalisisResult | null = null;
  tabActivo: string = 'derivacion';

  onResultado(resultado: AnalisisResult): void {
    this.resultado = resultado;
    this.tabActivo = 'derivacion';
  }

  setTab(tab: string): void {
    this.tabActivo = tab;
  }
}