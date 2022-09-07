import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RequisicaoRoutingModule } from './requisicao-routing.module';
import { RequisicaoComponent } from './requisicao.component';
import { ReactiveFormsModule } from '@angular/forms';

import { RequisicaoService } from './service/requisicao.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [
    RequisicaoComponent
  ],
  imports: [
    CommonModule,
    NgbModule,
    ReactiveFormsModule,
    RequisicaoRoutingModule,
    NgSelectModule
  ]
  ,
  providers: [
    RequisicaoService
  ]
})
export class RequisicaoModule { }
