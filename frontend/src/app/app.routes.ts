import { Routes } from '@angular/router';
import { adminGuard, autenticadoGuard, invitadoGuard } from './guards/guards';
import { InicioPage } from './paginas/inicio.page';
import { LoginPage } from './paginas/login.page';
import { NoEncontradaPage, SinPermisoPage } from './paginas/mensajes.page';
import { ModeracionPage } from './paginas/moderacion.page';
import { NuevoTemaPage } from './paginas/nuevo-tema.page';
import { PerfilPage } from './paginas/perfil.page';
import { RecuperarPage } from './paginas/recuperar.page';
import { RegistroPage } from './paginas/registro.page';
import { TemaPage } from './paginas/tema.page';
import { TemasPage } from './paginas/temas.page';
import { UsuariosAdminPage } from './paginas/usuarios-admin.page';

export const routes: Routes = [
  // Públicas
  { path: '', component: InicioPage, title: 'TecnoForo' },
  { path: 'temas', component: TemasPage, title: 'Temas | TecnoForo' },
  { path: 'temas/nuevo', component: NuevoTemaPage, canActivate: [autenticadoGuard], title: 'Nuevo tema | TecnoForo' },
  { path: 'temas/:id', component: TemaPage, title: 'Tema | TecnoForo' },

  // Solo sin sesión
  { path: 'login', component: LoginPage, canActivate: [invitadoGuard], title: 'Iniciar sesión | TecnoForo' },
  { path: 'registro', component: RegistroPage, canActivate: [invitadoGuard], title: 'Registro | TecnoForo' },
  { path: 'recuperar', component: RecuperarPage, canActivate: [invitadoGuard], title: 'Recuperar contraseña | TecnoForo' },

  // Rol USUARIO o ADMIN
  { path: 'perfil', component: PerfilPage, canActivate: [autenticadoGuard], title: 'Mi perfil | TecnoForo' },

  // Solo rol ADMIN
  { path: 'admin/moderacion', component: ModeracionPage, canActivate: [adminGuard], title: 'Moderación | TecnoForo' },
  { path: 'admin/usuarios', component: UsuariosAdminPage, canActivate: [adminGuard], title: 'Usuarios | TecnoForo' },

  { path: 'sin-permiso', component: SinPermisoPage, title: 'Sin permiso | TecnoForo' },
  { path: '**', component: NoEncontradaPage, title: 'No encontrada | TecnoForo' },
];
