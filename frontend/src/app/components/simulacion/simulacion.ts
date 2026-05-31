/**
 * Simulación con algoritmo de dos pasadas.
 * Los nodos se muestran todos desde el inicio en estado normal
 * y van cambiando de color conforme avanza la simulación.
 */
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeNode, AnalisisResult } from '../../services/grammar';

interface NodoSim {
  symbol: string;
  x: number;
  y: number;
  tipo: string;
  estado: 'normal' | 'activo' | 'visitado';
}

interface LineaSim {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

@Component({
  selector: 'app-simulacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './simulacion.html',
  styleUrl: './simulacion.css'
})
export class SimulacionComponent implements OnChanges, OnInit {

  @Input() resultado: AnalisisResult | null = null;

  nodos: NodoSim[] = [];
  lineas: LineaSim[] = [];
  pasoActual = -1;
  simulando = false;
  svgAncho = 760;
  svgAlto = 500;
  reglaActual = '';

  private intervalo: any = null;
  private readonly EH = 60;
  private readonly EV = 90;
  private readonly R = 22;
  private hojas = 0;

  ngOnInit(): void {
    this.reiniciar();
  }

  ngOnChanges(): void {
    if (!this.resultado?.arbol) return;
    this.hojas = 0;
    this.nodos = [];
    this.lineas = [];

    const prof = this.prof(this.resultado.arbol);
    this.svgAlto = prof * this.EV + 80;

    const mapa = new Map<TreeNode, NodoSim>();
    this.pasada1(this.resultado.arbol, 0, mapa);

    const maxX = Math.max(...this.nodos.map(n => n.x));
    this.svgAncho = Math.max(maxX + 60, 600);

    this.pasada2(this.resultado.arbol, mapa);
    this.reiniciar();
  }

  /**
   * Pasada 1: calcula posiciones x,y de cada nodo.
   *
   * @param nodo - nodo actual del árbol
   * @param nivel - nivel actual (0 = raíz)
   * @param mapa - mapa de referencia TreeNode → NodoSim
   * @returns posición x asignada al nodo
   */
  pasada1(nodo: TreeNode, nivel: number, mapa: Map<TreeNode, NodoSim>): number {
    const y = 50 + nivel * this.EV;
    let x: number;

    if (nodo.children.length === 0) {
      x = 40 + this.hojas * this.EH;
      this.hojas++;
    } else {
      const xs = nodo.children.map(h => this.pasada1(h, nivel + 1, mapa));
      x = (xs[0] + xs[xs.length - 1]) / 2;
    }

    const ns: NodoSim = {
      symbol: nodo.symbol,
      x, y,
      tipo: this.tipo(nodo.symbol),
      estado: 'normal'
    };
    this.nodos.push(ns);
    mapa.set(nodo, ns);
    return x;
  }

  /**
   * Pasada 2: conecta líneas padre-hijo usando coordenadas del mapa.
   *
   * @param nodo - nodo actual
   * @param mapa - mapa con posiciones calculadas
   */
  pasada2(nodo: TreeNode, mapa: Map<TreeNode, NodoSim>): void {
    const padre = mapa.get(nodo)!;
    nodo.children.forEach(hijo => {
      const hijoV = mapa.get(hijo)!;
      this.lineas.push({
        x1: padre.x, y1: padre.y + this.R,
        x2: hijoV.x, y2: hijoV.y - this.R
      });
      this.pasada2(hijo, mapa);
    });
  }

  /**
   * Calcula la profundidad máxima del árbol.
   *
   * @param nodo - nodo raíz
   * @returns profundidad máxima
   */
  prof(nodo: TreeNode): number {
    if (nodo.children.length === 0) return 1;
    return 1 + Math.max(...nodo.children.map(h => this.prof(h)));
  }

  /**
   * Determina el tipo del nodo para aplicar color.
   *
   * @param s - símbolo del nodo
   * @returns tipo como string
   */
  tipo(s: string): string {
    if (s === 'Exp') return 'exp';
    if (s === 'Term') return 'term';
    if (s === 'Factor') return 'factor';
    if (['~', '&', '|', '(', ')'].includes(s)) return 'operador';
    return 'terminal';
  }

  /**
   * Inicia la simulación automática nodo por nodo.
   * Los nodos cambian de normal → activo → visitado.
   */
  iniciar(): void {
    if (this.simulando) return;
    clearInterval(this.intervalo);
    this.pasoActual = -1;
    this.reglaActual = '';
    this.nodos.forEach(n => n.estado = 'normal');
    this.simulando = true;

    this.intervalo = setInterval(() => {
      if (this.pasoActual >= 0) {
        this.nodos[this.pasoActual].estado = 'visitado';
      }
      this.pasoActual++;

      if (this.pasoActual < this.nodos.length) {
        this.nodos[this.pasoActual].estado = 'activo';
        this.reglaActual = this.resultado?.pasos[this.pasoActual] || '';
      } else {
        this.reglaActual = 'Derivación completa ✓';
        clearInterval(this.intervalo);
        this.simulando = false;
      }
    }, 600);
  }

  /**
   * Avanza un solo paso manualmente.
   */
  siguientePaso(): void {
    if (this.simulando || this.pasoActual >= this.nodos.length - 1) return;
    if (this.pasoActual >= 0) this.nodos[this.pasoActual].estado = 'visitado';
    this.pasoActual++;
    this.nodos[this.pasoActual].estado = 'activo';
    this.reglaActual = this.resultado?.pasos[this.pasoActual] || '';
  }

  /**
   * Muestra todos los nodos como visitados de inmediato.
   */
  mostrarTodo(): void {
    clearInterval(this.intervalo);
    this.simulando = false;
    this.pasoActual = this.nodos.length - 1;
    this.nodos.forEach(n => n.estado = 'visitado');
    this.reglaActual = 'Derivación completa ✓';
  }

  /**
   * Reinicia todos los nodos a estado normal.
   */
  reiniciar(): void {
    clearInterval(this.intervalo);
    this.simulando = false;
    this.pasoActual = -1;
    this.reglaActual = '';
    this.nodos.forEach(n => n.estado = 'normal');
  }
}