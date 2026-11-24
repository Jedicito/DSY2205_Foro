import { Component, computed, input } from '@angular/core';

/** Lista visual de las reglas de seguridad de la contraseña, marcando las que ya se cumplen. */
@Component({
  selector: 'app-reglas-password',
  template: `
    <ul class="list-unstyled small mb-0 reglas-password row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-1">
      @for (r of reglas(); track r.texto) {
        <li class="col" [class.text-success]="r.ok" [class.text-muted]="!r.ok">
          <i class="bi me-1" [class.bi-check-circle-fill]="r.ok" [class.bi-circle]="!r.ok"></i>{{ r.texto }}
        </li>
      }
    </ul>
  `,
})
export class ReglasPassword {
  readonly valor = input<string>('');

  readonly reglas = computed(() => {
    const v = this.valor() ?? '';
    return [
      { texto: 'Entre 8 y 20 caracteres', ok: v.length >= 8 && v.length <= 20 },
      { texto: 'Una letra mayúscula', ok: /[A-ZÁÉÍÓÚÑ]/.test(v) },
      { texto: 'Una letra minúscula', ok: /[a-záéíóúñ]/.test(v) },
      { texto: 'Un número', ok: /\d/.test(v) },
      { texto: 'Un carácter especial', ok: /[^A-Za-z0-9ÁÉÍÓÚÑáéíóúñ\s]/.test(v) },
      { texto: 'Sin espacios', ok: v.length > 0 && !/\s/.test(v) },
    ];
  });
}
