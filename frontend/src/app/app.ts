import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ForoFacade } from './facade/foro.facade';
import { AvisosService } from './servicios/avisos.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly facade = inject(ForoFacade);
  readonly avisos = inject(AvisosService);
  private readonly router = inject(Router);
  readonly anio = new Date().getFullYear();

  salir(): void {
    this.facade.logout();
    this.avisos.mostrar('Sesión cerrada.', 'info');
    this.router.navigateByUrl('/');
  }
}
