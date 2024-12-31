// src/app/shared/shared.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Import shared components
//import { NavbarComponent } from '../navbar/navbar.component';

import { AiInteractionsComponent } from './ai-interactions/ai-interactions.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    AiInteractionsComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
  ],
  exports: [

    AiInteractionsComponent,
  ]
})
export class SharedModule {}
