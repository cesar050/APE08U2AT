/**
 * Componente árbol con navegación anterior/siguiente nodo por nodo.
 */
import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeNode } from '../../services/grammar';

interface NodoVisual {
  symbol: string;
  x: number;
  y: number;
  visible: boolean;
  tipo: string;
}

interface Linea {
  x1: number; y1: number;
  x2: number; y2: number;
  visible: boolean;
}

@Component({
  selector: 'app-arbol',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './arbol.html',
  styleUrl: './arbol.css'
})
export class ArbolComponent implements OnChanges {

  @Input() arbol: TreeNode | null = null;

  nodos: NodoVisual[] = [];
  lineas: Linea[] = [];
  paso: number = 0;
  svgAncho = 760;
  svgAlto = 500;

  private readonly EH = 60;
  private readonly EV = 90;
  private readonly R = 22;
  private hojas = 0;

  ngOnChanges(): void {
    if (!this.arbol) return;
    this.hojas = 0;
    this.nodos = [];
    this.lineas = [];

    const prof = this.prof(this.arbol);
    this.svgAlto = prof * this.EV + 80;

    const mapa = new Map<TreeNode, NodoVisual>();
    this.pasada1(this.arbol, 0, mapa);

    const maxX = Math.max(...this.nodos.map(n => n.x));
    this.svgAncho = Math.max(maxX + 60, 600);

    this.pasada2(this.arbol, mapa);
    this.paso = 0;
    this.nodos.forEach(n => n.visible = false);
    this.lineas.forEach(l => l.visible = false);
  }

  pasada1(nodo: TreeNode, nivel: number, mapa: Map<TreeNode, NodoVisual>): number {
    const y = 50 + nivel * this.EV;
    let x: number;

    if (nodo.children.length === 0) {
      x = 40 + this.hojas * this.EH;
      this.hojas++;
    } else {
      const xs = nodo.children.map(h => this.pasada1(h, nivel + 1, mapa));
      x = (xs[0] + xs[xs.length - 1]) / 2;
    }

    const nv: NodoVisual = {
      symbol: nodo.symbol, x, y,
      visible: false,
      tipo: this.tipo(nodo.symbol)
    };
    this.nodos.unshift(nv); 
    mapa.set(nodo, nv);
    return x;
  }

  pasada2(nodo: TreeNode, mapa: Map<TreeNode, NodoVisual>): void {
    const padre = mapa.get(nodo)!;
    nodo.children.forEach(hijo => {
      const hijoV = mapa.get(hijo)!;
      this.lineas.push({
        x1: padre.x, y1: padre.y + this.R,
        x2: hijoV.x, y2: hijoV.y - this.R,
        visible: false
      });
      this.pasada2(hijo, mapa);
    });
  }

  prof(nodo: TreeNode): number {
    if (nodo.children.length === 0) return 1;
    return 1 + Math.max(...nodo.children.map(h => this.prof(h)));
  }

  tipo(s: string): string {
    if (s === 'Exp') return 'exp';
    if (s === 'Term') return 'term';
    if (s === 'Factor') return 'factor';
    if (['~','&','|','(',')'].includes(s)) return 'operador';
    return 'terminal';
  }

  /**
   * Avanza un nodo hacia adelante.
   */
  siguiente(): void {
    if (this.paso >= this.nodos.length) return;
    this.nodos[this.paso].visible = true;
    if (this.lineas[this.paso]) this.lineas[this.paso].visible = true;
    this.paso++;
  }

  /**
   * Retrocede un nodo.
   */
  anterior(): void {
    if (this.paso <= 0) return;
    this.paso--;
    this.nodos[this.paso].visible = false;
    if (this.lineas[this.paso]) this.lineas[this.paso].visible = false;
  }

  /**
   * Muestra todos los nodos.
   */
  mostrarTodo(): void {
    this.paso = this.nodos.length;
    this.nodos.forEach(n => n.visible = true);
    this.lineas.forEach(l => l.visible = true);
  }

  /**
   * Oculta todos los nodos.
   */
  reiniciar(): void {
    this.paso = 0;
    this.nodos.forEach(n => n.visible = false);
    this.lineas.forEach(l => l.visible = false);
  }
}