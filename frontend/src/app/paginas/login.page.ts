import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ForoFacade } from '../facade/foro.facade';
import { AvisosService } from '../servicios/avisos.service';
import { mensajesError } from '../validadores/validadores';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="row justify-content-center">
      <div class="col-12 col-sm-10 col-md-7 col-lg-5 col-xl-4">
        <div class="card tarjeta-form shadow-sm">
          <div class="card-body p-4">
            <div class="text-center mb-3">
              <img src="logo.svg" alt="TecnoForo" width="64" height="64">
              <h1 class="h4 mt-2 mb-0">Iniciar sesión</h1>
              <p class="text-muted small">Entra a TecnoForo para publicar y comentar</p>
            </div>

            @if (error()) {
              <div class="alert alert-danger py-2" role="alert">{{ error() }}</div>
            }

            <form [formGroup]="form" (ngSubmit)="entrar()" novalidate>
              <div class="mb-3">
                <label for="usuario" class="form-label">Nombre de usuario</label>
                <input id="usuario" class="form-control" formControlName="nombreUsuario" autocomplete="username"
                       [class.is-invalid]="errores('nombreUsuario').length">
                @for (m of errores('nombreUsuario'); track m) { <div class="invalid-feedback">{{ m }}</div> }
              </div>
              <div class="mb-3">
                <label for="clave" class="form-label">Contraseña</label>
                <div class="input-group has-validation">
                  <input id="clave" class="form-control" [type]="verClave() ? 'text' : 'password'"
                         formControlName="password" autocomplete="current-password"
                         [class.is-invalid]="errores('password').length">
                  <button class="btn btn-outline-secondary" type="button" (click)="verClave.set(!verClave())"
                          [attr.aria-label]="verClave() ? 'Ocultar contraseña' : 'Mostrar contraseña'">
                    <i class="bi" [class.bi-eye]="!verClave()" [class.bi-eye-slash]="verClave()"></i>
                  </button>
                  @for (m of errores('password'); track m) { <div class="invalid-feedback">{{ m }}</div> }
                </div>
              </div>
              <button class="btn btn-primario w-100" type="submit">Entrar</button>
            </form>

            <div class="d-flex justify-content-between mt-3 small">
              <a routerLink="/recuperar">¿Olvidaste tu contraseña?</a>
              <a routerLink="/registro">Crear cuenta</a>
            </div>
          </div>
        </div>
        <div class="card mt-3 border-0 bg-transparent">
          <div class="card-body small text-muted p-2">
            <strong>Usuarios de prueba:</strong> admin / Admin#2026 (ADMIN) · jperez / Usuario#2026 (USUARIO)
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginPage {
  private readonly facade = inject(ForoFacade);
  private readonly avisos = inject(AvisosService);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  readonly verClave = signal(false);
  readonly error = signal('');

  readonly form = inject(FormBuilder).nonNullable.group({
    nombreUsuario: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    password: ['', [Validators.required, Validators.maxLength(20)]],
  });

  errores(campo: string): string[] {
    return mensajesError(this.form.get(campo));
  }

  entrar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const { nombreUsuario, password } = this.form.getRawValue();
    const r = this.facade.login(nombreUsuario, password);
    if (!r.ok) {
      this.error.set(r.mensaje);
      return;
    }
    this.avisos.resultado(r);
    const volver = this.ruta.snapshot.queryParamMap.get('volver');
    this.router.navigateByUrl(volver || (this.facade.esAdmin() ? '/admin/moderacion' : '/'));
  }
}
