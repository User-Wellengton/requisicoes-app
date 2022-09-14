import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/auth/services/authentication.service';
import { Departamento } from 'src/app/departamentos/models/departamento.models';
import { DepartamentoService } from 'src/app/departamentos/services/departamento.service';
import { Equipamento } from 'src/app/equipamentos/model/equipamento.models';
import { EquipamentoService } from 'src/app/equipamentos/services/equipamento.service';
import { Funcionario } from 'src/app/funcionarios/model/funcionario.models';
import { FuncionarioService } from 'src/app/funcionarios/service/funcionario.service';
import { Requisicao } from '../model/requisicao.models';
import { RequisicaoService } from '../service/requisicao.service';

@Component({
  selector: 'app-requisicoes-funcionario',
  templateUrl: './requisicoes-funcionario.component.html',
  styleUrls: ['./requisicoes-funcionario.component.css']
})
export class RequisicoesFuncionarioComponent implements OnInit,OnDestroy {

  public requisicoes$: Observable<Requisicao[]>;
  public departamentos$: Observable<Departamento[]>;
  public equipamentos$: Observable<Equipamento[]>;

  private processoAutenticado$: Subscription;

  public funcionarioLogado: Funcionario;

  private funcionarioLogadoId: string;

  public form: FormGroup;

  constructor(
    private requisicaoService: RequisicaoService,
    private equipamentoService: EquipamentoService,
    private departamentoService: DepartamentoService,
    private funcionarioService: FuncionarioService,



    private authService: AuthenticationService,

    private fb: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService

  ) { }

  ngOnInit(): void {

    this.form = this.fb.group({
      id: new FormControl(""),
      descricao: new FormControl("", [Validators.required]),
      abertura: new FormControl(""),
      departamentoId: new FormControl("", [Validators.required]),
      departamento: new FormControl(""),
      equipamentoId: new FormControl(""),
      equipamento: new FormControl(""),
      solicitanteId: new FormControl(""),
      solicitante: new FormControl(""),

      status: new FormControl(""),
      ultimaAtualizacao: new FormControl(""),
      movimentacoes: new FormControl(""),
    });

    this.departamentos$ = this.departamentoService.selecionarTodos();
    this.equipamentos$ = this.equipamentoService.selecionarTodos();
    this.requisicoes$ = this.requisicaoService.selecionarTodos();


    this.processoAutenticado$ = this.authService.usuarioLogado.subscribe(usuario => {
      const email = usuario?.email!;


      this.funcionarioService.selecionarFuncionarioLogado(email)
        .subscribe(funcionario => this.funcionarioLogado = funcionario);
    })
  }

  ngOnDestroy(): void {
    this.processoAutenticado$.unsubscribe();

  }


  get tituloModal(): string {
    return this.id?.value ? "Edição" : "Cadastro";
  }

  get id(): AbstractControl | null {
    return this.form.get("id");
  }

  get descricao(): AbstractControl | null {
    return this.form.get("descricao");
  }

  get abertura(): AbstractControl | null {
    return this.form.get("abertura");
  }

  get departamentoId(): AbstractControl | null {
    return this.form.get("departamentoId");
  }

  get equipamentoId(): AbstractControl | null {
    return this.form.get("equipamentoId");
  }

  public async gravar(modal: TemplateRef<any>, requisicao?: Requisicao) {
    this.form.reset();

    this.configurarValoresPadrao();

    if (requisicao){
      const departamento = requisicao.departamento ? requisicao.departamento : null;
      const funcionario = requisicao.solicitante ? requisicao.solicitante : null;
      const equipamento = requisicao.equipamento ? requisicao.equipamento : null;

      const requisicaoCompleta ={
        ...requisicao,
        departamento,
        funcionario,
        equipamento
      }

      this.form.setValue(requisicaoCompleta);
    }

    try {
      await this.modalService.open(modal).result;

      if (this.form.dirty && this.form.valid) {
        if (!requisicao) {

         await this.requisicaoService.inserir(this.form.value);
        }
        else
         await this.requisicaoService.editar(this.form.value);

        this.toastr.success(`Informações registradas com sucesso!`, "Cadastro de requisição");
      }
      else {
        this.toastr.error(`Erro ao registrar as Informações!`, "Cadastro de requisição");
      }

    } catch (error) {
      if (error != "fechar" && error != "1" && error != "0")
        this.toastr.error("Houve um erro na solicitação");
    }
  }

  public excluir(requisicao: Requisicao) {
    this.requisicaoService.excluir(requisicao);
    this.toastr.warning(`'${requisicao.id}' excluída`, "Exclusão de requisições");
  }

  private configurarValoresPadrao(): void {
    this.form.get("status")?.setValue("aberta");
    this.form.get("abertura")?.setValue(new Date());
    this.form.get("ultimaAtualizacao")?.setValue(new Date());
    this.form.get("equipamentoId")?.setValue(null);
    this.form.get("solicitanteId")?.setValue(this.funcionarioLogado.id);
  }

}
