import { Component, OnInit, TemplateRef } from '@angular/core';
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
import { Movimentacao } from '../model/movimentacao.model';
import { Requisicao } from '../model/requisicao.models';
import { RequisicaoService } from '../service/requisicao.service';

@Component({
  selector: 'app-requisicoes-departamento',
  templateUrl: './requisicoes-departamento.component.html',
  styleUrls: ['./requisicoes-departamento.component.css']
})
export class RequisicoesDepartamentoComponent implements OnInit {

  public requisicoes$: Observable<Requisicao[]>;
  public departamentos$: Observable<Departamento[]>;
  public equipamentos$: Observable<Equipamento[]>;

  private processoAutenticado$: Subscription;

  public funcionarioLogado: Funcionario;

  public requisicaoSelecionada: Requisicao;

  public listaStatus: string[] = ["Aberta", "Processando", "Não Autorizada", "Fechada"]

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
      status: new FormControl("", [Validators.required]),
      descricao: new FormControl("", [Validators.required, Validators.minLength(6)]),
      funcionario: new FormControl(""),
      data: new FormControl(""),

    });

    this.departamentos$ = this.departamentoService.selecionarTodos();
    this.equipamentos$ = this.equipamentoService.selecionarTodos();


    this.processoAutenticado$ = this.authService.usuarioLogado.subscribe(usuario => {
      const email = usuario?.email!;


      this.funcionarioService.selecionarFuncionarioLogado(email)
        .subscribe(funcionario => {
          this.funcionarioLogado = funcionario;
          this.requisicoes$ =
            this.requisicaoService.selecionarRequisicoesPorDepartamentoId(funcionario.departamentoId);

        });
    })
  }

  ngOnDestroy(): void {
    this.processoAutenticado$.unsubscribe();

  }

  get id(): AbstractControl | null {
    return this.form.get("id");
  }

  get status(): AbstractControl | null {
    return this.form.get("status");
  }

  public async gravar(modal: TemplateRef<any>, requisicao: Requisicao) {
    this.requisicaoSelecionada = requisicao;
    this.requisicaoSelecionada.movimentacoes = requisicao.movimentacoes ? requisicao.movimentacoes : [];

    this.form.reset();

    this.configurarValoresPadrao();

    try {
      await this.modalService.open(modal).result;

      if (this.form.dirty && this.form.valid) {
        this.atualizarRequisicao(this.form.value)

        await this.requisicaoService.editar(this.requisicaoSelecionada);

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


  private atualizarRequisicao(movimentacao: Movimentacao) {
    this.requisicaoSelecionada.movimentacoes.push(movimentacao)
    this.requisicaoSelecionada.status = this.status?.value;
    this.requisicaoSelecionada.ultimaAtualizacao = new Date();
  }

  private configurarValoresPadrao(): void {
    this.form.patchValue({
      funcionario: this.funcionarioLogado,
      status: this.requisicaoSelecionada?.status,
      data: new Date()

    });
  }


}
