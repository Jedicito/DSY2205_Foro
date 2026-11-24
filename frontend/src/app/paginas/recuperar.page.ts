import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ForoFacade } from '../facade/foro.facade';
import { AvisosService } from '../servicios/avisos.service';
import { camposIguales, mensajesError, passwordSegura } from '../validadores/validadores';
import { ReglasPassword } from './reglas-password';

/** Recuperar contraseña en dos pasos: correo -> código + nueva contraseña (envío de correo simulado). */
@Component({
  selector: 'app-recuperar',
  imports: [ReactiveFormsModule, RouterLink, ReglasPassword],
  template: `
    <div class="row justify-content-center">
      <div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
        <div class="card tarjeta-form shadow-sm">
          <div class="card-body p-4">
            <h1 class="h4 mb-1"><i class="bi bi-key me-2"></i>Recuperar contraseña</h1>
            <p class="text-muted small mb-3">Paso {{ paso() }} de 2</p>
            <div class="progress mb-4" style="height: 6px;" role="progressbar" aria-label="Avance">
              <div class="progress-bar barra-marca" [style.width.%]="paso() === 1 ? 50 : 100"></div>
            </div>

            @if (error()) {
              <div class="alert alert-danger py-2" role="alert">{{ error() }}</div>
            }

            @if (paso() === 1) {
              <form [formGroup]="formCorreo" (ngSubmit)="enviarCodigo()" novalidate>
                <label for="correo" class="form-label">Correo de tu cuenta</label>
                <input id="correo" type="email" class="form-control" formControlName="email"
                       [class.is-invalid]="erroresCorreo('email').length">
                @for (m of erroresCorreo('email'); track m) { <div class="invalid-feedback">{{ m }}</div> }
                <button class="btn btn-primario w-100 mt-3" type="submit">Enviar código</button>
              </form>
            } @else {
              <div class="alert alert-info small py-2">
                <i class="bi bi-envelope-check me-1"></i>
                Envío de correo simulado. Tu código es <strong>{{ codigoSimulado() }}</strong>
              </div>
              <form [formGroup]="formClave" (ngSubmit)="cambiar()" novalidate>
                <div class="mb-3">
                  <label for="codigo" class="form-label">Código de 6 dígitos</label>
                  <input id="codigo" class="form-control" formControlName="codigo" inputmode="numeric" maxlength="6"
                         [class.is-invalid]="erroresClave('codigo').length">
                  @for (m of erroresClave('codigo'); track m) { <div class="invalid-feedback">{{ m }}</div> }
                </div>
                <div class="mb-3">
                  <label for="nueva" class="form-label">Nueva contraseña</label>
                  <input id="nueva" type="password" class="form-control" formControlName="password"
                         autocomplete="new-password" [class.is-invalid]="erroresClave('password').length">
                  @for (m of erroresClave('password'); track m) { <div class="invalid-feedback">{{ m }}</div> }
                </div>
                <div class="mb-3">
                  <label for="confirmar" class="form-label">Confirmar contraseña</label>
                  <input id="confirmar" type="password" class="form-control" formControlName="confirmar"
                         autocomplete="new-password" [class.is-invalid]="erroresClave('confirmar').length">
                  @for (m of erroresClave('confirmar'); track m) { <div class="invalid-feedback">{{ m }}</div> }
                </div>
                <app-reglas-password [valor]="formClave.controls.password.value" />
                <div class="d-flex gap-2 mt-3">
                  <button class="btn btn-outline-secondary" type="button" (click)="volver()">Atrás</button>
                  <button class="btn btn-primario flex-grow-1" type="submit">Cambiar contraseña</button>
                </div>
              </form>
            }
            <div class="text-center mt-3 small"><a routerLink="/login">Volver a iniciar sesión</a></div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RecuperarPage {
  private readonly facade = inject(ForoFacade);
  private readonly avisos = inject(AvisosService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly paso = signal<1 | 2>(1);
  readonly error = signal('');
  readonly codigoSimulado = signal('');

  readonly formCorreo = this.fb.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
  });

  readonly formClave = this.fb.group({
    codigo: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20), passwordSegura()]],
    confirmar: ['', [Validators.required]],
  }, { validators: [camposIguales('password', 'confirmar')] });

  erroresCorreo(campo: string): string[] {
    return mensajesError(this.formCorreo.get(campo));
  }

  erroresClave(campo: string): string[] {
    return mensajesError(this.formClave.get(campo));
  }

  enviarCodigo(): void {
    this.formCorreo.markAllAsTouched();
    if (this.formCorreo.invalid) return;
    const r = this.facade.solicitarRecuperacion(this.formCorreo.controls.email.value);
    if (!r.ok || !r.codigo) {
      this.error.set(r.mensaje);
      return;
    }
    this.error.set('');
    this.codigoSimulado.set(r.codigo);
    this.avisos.resultado(r);
    this.paso.set(2);
  }

  cambiar(): void {
    this.formClave.markAllAsTouched();
    if (this.formClave.invalid) return;
    const v = this.formClave.getRawValue();
    const r = this.facade.restablecerPassword(this.formCorreo.controls.email.value, v.codigo, v.password);
    if (!r.ok) {
      this.error.set(r.mensaje);
      return;
    }
    this.avisos.resultado(r);
    this.router.navigateByUrl('/login');
  }

  volver(): void {
    this.error.set('');
    this.formClave.reset();
    this.paso.set(1);
  }
}
