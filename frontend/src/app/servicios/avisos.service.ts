import { Injectable, signal } from '@angular/core';
import { Resultado } from '../modelos/modelos';

export interface Aviso {
  id: number;
  texto: string;
  tipo: 'success' | 'danger' | 'info';
}

/** Mensajes flotantes (toasts) que se muestran después de cada acción. */
@Injectable({ providedIn: 'root' })
export class AvisosService {

  private siguienteId = 1;
  readonly avisos = signal<Aviso[]>([]);

  mostrar(texto: string, tipo: Aviso['tipo'] = 'info'): void {
    const aviso: Aviso = { id: this.siguienteId++, texto, tipo };
    this.avisos.update(lista => [...lista, aviso]);
    setTimeout(() => this.cerrar(aviso.id), 4000);
  }

  /** Muestra el resultado de una operación del facade (verde si salió bien, rojo si no). */
  resultado(r: Resultado): void {
    this.mostrar(r.mensaje, r.ok ? 'success' : 'danger');
  }

  cerrar(id: number): void {
    this.avisos.update(lista => lista.filter(a => a.id !== id));
  }
}
