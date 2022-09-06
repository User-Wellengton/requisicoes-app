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
    private router: Router,
    private authService: AuthenticationService,
    private funcionarioService: FuncionarioService,
    private departamentoService: DepartamentoService,

    private modalService: NgbModal,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      funcionario: new FormGroup({
        id: new FormControl(""),
        nome: new FormControl("", [Validators.required, Validators.minLength(3)]),
        email: new FormControl("", [Validators.required, Validators.email]),
        funcao: new FormControl("", [Validators.required, Validators.minLength(3)]),
        departamentoId: new FormControl("", [Validators.required]),
        departamento: new FormControl("")


      }),
      senha: new FormControl("", [Validators.required])
    })

    this.funcionarios$ = this.funcionarioService.selecionarTodos();
    this.departamentos$ = this.departamentoService.selecionarTodos();
  }


  get tituloModal(): string {
    return this.id?.value ? "Atualização" : "Cadastro";
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

    this.form.reset(); //para limpar todos os dados do formulario, caso possa ter



    if (funcionario) {
      const departamento = funcionario.departamento ? funcionario.departamento : null;

      const funcionarioCompleto = {
        ...funcionario,
        departamento

      }

      this.form.get("funcionario")?.setValue(funcionarioCompleto);

    }

    try {
      await this.modalService.open(modal).result;

      if (this.nome?.invalid) {
        this.toastr.error("O nome do funcionário está invalido")
      }


      if (funcionario) {
        await this.funcionarioService.editar(this.form.get("funcionario")?.value);
        this.toastr.success("Cadastro Editado com sucesso!!")
      }

      else {
let usuarioAtual = this.authService.getUsuario();

        await this.authService.cadastrar(this.email?.value, this.senha?.value);

        await this.funcionarioService.inserir(this.form.get("funcionario")?.value)

        await this.authService.atualizarUsuario(await usuarioAtual);

        this.toastr.success("Cadastro Inserido com sucesso!!")

        await this.authService.logout();

        await this.router.navigate(["/login"])
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

