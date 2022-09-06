import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
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
  public form: FormGroup;

  constructor(
    private departamentoService: DepartamentoService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.departamentos$ = this.departamentoService.selecionarTodos();

    this.form = this.fb.group({
      id: new FormControl(""),
      nome: new FormControl("", [Validators.required,Validators.minLength(3)]),
      telefone: new FormControl("",[Validators.required])
    })
  }

  get tituloModal(): string {
    return this.id?.value ? "Atualização" : "Cadastro";
  }

  get nomeString(): string {
    return this.nome?.value;
  }
  get id() {
    return this.form.get("id");
  }

  get nome() {
    return this.form.get("nome");
  }
  get telefone() {
    return this.form.get("telefone");
  }

  //método para gravar o novo departamento
  public async gravar(modal: TemplateRef<any>, departamento?: Departamento) {

    this.form.reset(); //para limpar todos os dados do formulario, caso possa ter

    if (departamento) // esse if seria para caso o objeto selecionado já seja um departamento, assim já retorna o próprio departamento da EDIÇÂO
      this.form.setValue(departamento);

    try {
      await this.modalService.open(modal).result;


      if (departamento){
        await this.departamentoService.editar(this.form.value);
        this.toastr.success("Cadastro Editado com sucesso!!")
      }        // caso seja um departamento ja instanciado, vai para o metodo editar
      else{
        await this.departamentoService.inserir(this.form.value)
        this.toastr.success("Cadastro Inserido com sucesso!!")
      }
         // caso contrario, é inserido um departamento novo

      console.log("O departamento foi salvo com sucesso");
    } catch (error) {
      if(error != "fechar")
      this.toastr.error("Não foi possivel cadastrar corretamento!!!")
    }
  }

  public excluir(departamento: Departamento) {
    this.departamentoService.excluir(departamento);

    this.toastr.success("Cadastro Excluido com sucesso!!")
  }
}
