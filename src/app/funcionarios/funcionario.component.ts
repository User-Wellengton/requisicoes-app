import { Component, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../auth/services/authentication.service';
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
    private fb: FormBuilder,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private authService: AuthenticationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.funcionarios$ = this.funcionarioService.selecionarTodos();
    this.departamentos$ = this.departamentoService.selecionarTodos();

    this.form = this.fb.group({
      funcionario: new FormGroup({
        id: new FormControl(""),
        nome: new FormControl("", [Validators.required, Validators.minLength(3)]),
        email: new FormControl("", [Validators.required, Validators.email]),
        funcao: new FormControl("", [Validators.required, Validators.minLength(3)]),
        departamentoId: new FormControl("", [Validators.required]),
        departamento: new FormControl("")
      }),
      senha: new FormControl("") // Fora do objeto funcionário, dentro do form
    });
  }

  get tituloModal(): string {
    return this.id?.value ? "Edição" : "Cadastro";
  }

  get id(): AbstractControl | null {
    return this.form.get("funcionario.id");
  }

  get nome(): AbstractControl | null {
    return this.form.get("funcionario.nome");
  }

  get email(): AbstractControl | null {
    return this.form.get("funcionario.email");
  }

  get funcao(): AbstractControl | null {
    return this.form.get("funcionario.funcao");
  }

  get departamentoId(): AbstractControl | null {
    return this.form.get("funcionario.departamentoId");
  }

  get senha(): AbstractControl | null {
    return this.form.get("senha");
  }

  public async gravar(modal: TemplateRef<any>, funcionario?: Funcionario) {
    this.form.reset();

    if(funcionario) {
      const departamento = funcionario.departamento ? funcionario.departamento : null;

      // ... = Spread Operator | Faz um splash das propriedades do objeto filho, para o objeto pai
      const funcionarioCompleto = {
        ...funcionario,
        departamento
      }
      /* Aqui os valores são preenchidos nos campos do form, quando as informações batem com o FORMGROUP lá de cima*/
      this.form.get("funcionario")?.setValue(funcionarioCompleto);
    }
    try {
      await this.modalService.open(modal).result;

      if(this.form.dirty && this.form.valid) {
        if(!funcionario) {
          let usuarioAtual = this.authService.getUser();

          await this.authService.cadastrar(this.email?.value, this.senha?.value);

          await this.funcionarioService.inserir(this.form.get("funcionario")?.value);

          await this.authService.updateUser(await usuarioAtual);
        }
        else
          await this.funcionarioService.editar(this.form.get("funcionario")?.value);

        this.toastr.success("Informações registradas com sucesso!", `${this.tituloModal}`);
      }
      else
        this.toastr.error("Houve algo de errado com as informações, tente novamente!", `${this.tituloModal}`);

    } catch (error) {
      if(error != "fechar" && error != "1" && error != "0")
        this.toastr.error("Houve um erro na solicitação");
    }
  }

  public excluir(funcionario: Funcionario) {
    this.funcionarioService.excluir(funcionario);
    this.toastr.warning(`'${funcionario.nome}' excluído`, "Exclusão de funcionário");
  }
}
