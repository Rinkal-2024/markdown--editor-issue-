import { Routes } from '@angular/router';

import { CreateOpenaiComponent } from './create-openai/create-openai.component';


export const routes: Routes = [
  // { path: 'login', component: LoginComponent, },
  // {path: 'dashboard',component: DashboardComponent,},
  // {path: 'forgot-password',component: ForgotPasswordComponent},
  // {path: 'reset-password',component: ResetPasswordComponent,},
  // {
  //   path: 'cms-page/:slug/:id',
  //   component: CmsAboutPageComponent,

  // },
  // { path: 'profile', component: ProfileComponent, },
  // { path: 'project', component: ProjectComponent , },
  // { path: 'project/create', component: AddProjectComponent},
  // { path: 'project/:id', component: ViewProjectComponent},
  // { path: 'project/:id/edit', component: EditProjectComponent,  },
  { path: '', component: CreateOpenaiComponent },
  { path: '', redirectTo: '/', pathMatch: 'full' },


];
