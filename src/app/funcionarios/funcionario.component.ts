import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { Departamento } from '../departamentos/models/departamento.models';
import { DepartamentoService } from '../departamentos/services/departamento.service';
import { Funcionario } from './model/funcionario.models';
import { FuncionarioService } from './service/funcionario.service';

@Component({
  selector: 'app-funcionario',
  templateUrl: './funcionario.component.html',
  styleUrls: ['./funcionario.component.css']
})
export class FuncionarioComponent implements OnInit {
  public funcionarios$: Observable<Funcionario[]>;
  public departamentos$: Observable<Departamento[]>;
  public form: FormGroup;

  constructor(
    private funcionarioService: FuncionarioService,
    private departamentoService: DepartamentoService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      id: new FormControl(""),
      nome: new FormControl(""),
      email: new FormControl(""),
      funcao: new FormControl(""),
      departamentoId: new FormControl(""),
      departamento: new FormControl(""),
    })

    this.funcionarios$ = this.funcionarioService.selecionarTodos();
    this.departamentos$ = this.departamentoService.selecionarTodos();
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

  get email() {
    return this.form.get("email");
  }

  get funcao() {
    return this.form.get("funcao");
  }

  get departamentoId() {
    return this.form.get("departamentoId");
  }

  get departamento() {
    return this.form.get("departamento");
  }

  public async gravar(modal: TemplateRef<any>, funcionario?: Funcionario) {

    this.form.reset(); //para limpar todos os dados do formulario, caso possa ter


    // esse if seria para caso o objeto selecionado já seja um departamento, assim já retorna o próprio departamento da EDIÇÂO
    if (funcionario) {
      const departamento = funcionario.departamento ? funcionario.departamento : null;

      const funcionarioCompleto = {
          ...funcionario,
          departamento

      }

      this.form.setValue(funcionarioCompleto);

    }

    try {
      await this.modalService.open(modal).result;

      if (funcionario) {
        await this.funcionarioService.editar(this.form.value); // caso seja um departamento ja instanciado, vai para o metodo editar
        this.toastr.success("Cadastro Editado com sucesso!!")
      }

      else {
        await this.funcionarioService.inserir(this.form.value) // caso contrario, é inserido um departamento novo
        this.toastr.success("Cadastro Inserido com sucesso!!")
      }

      console.log("O funcionario foi salvo com sucesso");
    } catch (error) {
      if (error != "fechar")
        this.toastr.error("Não foi possivel cadastrar corretamento!!!")
    }
  }

  public excluir(funcionario: Funcionario) {
    this.funcionarioService.excluir(funcionario);

    this.toastr.success("Cadastro Excluido com sucesso!!")
  }
}

