import { Component, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../auth/services/authentication.service';
import { Departamento } from '../departamentos/models/departamento.models';
import { DepartamentoService } from '../departamentos/services/departamento.service';
import { Equipamento } from '../equipamentos/model/equipamento.models';
import { EquipamentoService } from '../equipamentos/services/equipamento.service';
import { Requisicao } from './model/requisicao.models';
import { RequisicaoService } from './service/requisicao.service';

@Component({
  selector: 'app-requisicao',
  templateUrl: './requisicao.component.html',
  styleUrls: ['./requisicao.component.css']
})
export class RequisicaoComponent implements OnInit {

  public requisicoes$: Observable<Requisicao[]>;
  public departamentos$: Observable<Departamento[]>;
  public equipamentos$: Observable<Equipamento[]>;
  public form: FormGroup;
  public idUsuario: string | undefined;


  constructor(
    private authService: AuthenticationService,
    private requisicaoService: RequisicaoService,
    private departamentoService: DepartamentoService,
    private equipamentoService: EquipamentoService,

    private modalService: NgbModal,
    private fb: FormBuilder,
    private toastr: ToastrService,

  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      id: new FormControl(""),
      abertura: new FormControl(""),
      departamentoId: new FormControl("", [Validators.required]),
      departamento: new FormControl(""),
      descricao: new FormControl("", [Validators.required]),
      equipamentoId: new FormControl("", [Validators.required]),
      equipamento: new FormControl(""),
      solicitanteId: new FormControl(""),
      solicitante: new FormControl("")
    })

    this.authService.usuarioLogado.subscribe( usuario => this.idUsuario = usuario?.providerId)

    this.requisicoes$ = this.requisicaoService.selecionarTodos();
    this.departamentos$ = this.departamentoService.selecionarTodos();
    this.equipamentos$ = this.equipamentoService.selecionarTodos();

  }

  get tituloModal(): string {
    return this.id?.value ? "Atualização" : "Cadastro";
  }

  get id(): AbstractControl | null {
    return this.form.get("id");
  }

  get abertura(): AbstractControl | null {
    return this.form.get("abertura");
  }

  get departamentoId(): AbstractControl | null {
    return this.form.get("departamentoId");
  }

  get descricao(): AbstractControl | null {
    return this.form.get("descricao");
  }

  get equipamentoId(): AbstractControl | null {
    return this.form.get("equipamentoId");
  }

  get solicitanteId(): AbstractControl | null {
    return this.form.get("solicitanteId");
  }



  public async gravar(modal: TemplateRef<any>, requisicao?: Requisicao) {

    this.form.reset();

    if (requisicao) {
      const departamento = requisicao.departamento ? requisicao.departamento : null;
      const equipamento = requisicao.equipamento ? requisicao.departamento : null;

      const requisicaoCompleto = {
        ...requisicao,
        departamento,
        equipamento

      }

      this.form.get("requisicao")?.setValue(requisicaoCompleto);

    }

    try {
      await this.modalService.open(modal).result;

      if (requisicao) {
        await this.requisicaoService.editar(this.form.value); // caso seja um departamento ja instanciado, vai para o metodo editar
        this.toastr.success("Cadastro Editado com sucesso!!")
      }

      else {

        this.form.get("solicitanteId")?.setValue(this.idUsuario);

        this.form.get("abertura")?.setValue(new Date(Date.now()).toLocaleString());
        this.form.getError("solicitanteId")?.setValue(this.authService.getUid());


        await this.requisicaoService.inserir(this.form.value) // caso contrario, é inserido um departamento novo
        this.toastr.success("Cadastro Inserido com sucesso!!")
      }

      console.log("A requisição foi salva com sucesso");
    } catch (error) {
      if (error != "fechar")
        this.toastr.error("Não foi possivel cadastrar corretamento!!!")
    }

  }

  public excluir(requisicao: Requisicao) {
    this.requisicaoService.excluir(requisicao);

    this.toastr.success("Cadastro Excluido com sucesso!!")
  }





}

