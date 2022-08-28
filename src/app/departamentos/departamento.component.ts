import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { Departamento } from './models/departamento.models';
import { DepartamentoService } from './services/departamento.service';

@Component({
  selector: 'app-departamento',
  templateUrl: './departamento.component.html',
  styleUrls: ['./departamento.component.css']
})
export class DepartamentoComponent implements OnInit {
  public departamentos$: Observable<Departamento[]>;
  public form: FormGroup

  constructor(
    private departamentoService: DepartamentoService,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.departamentos$ = this.departamentoService.selecionarTodos();

    this.form = this.fb.group({
      nome: new FormControl(""),
      tefeone: new FormControl("")

    })
  }

  get nome() {
    return this.form.get("nome")
  }
  get telefone() {
    return this.form.get("telefone")
  }

  public async gravar(modal: TemplateRef<any>) {
    this.form.reset();

    try {
      await this.modalService.open(modal).result;

      await this.departamentoService.inserir(this.form.value);

console.log(`O departamento foi salvo com sucesso`)

    } catch (error) {
      console.log(error);
    }

  }

}
