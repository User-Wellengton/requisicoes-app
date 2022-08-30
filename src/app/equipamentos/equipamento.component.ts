import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { Equipamento } from './model/equipamento.models';
import { EquipamentoService } from './services/equipamento.service';

@Component({
  selector: 'app-equipamento',
  templateUrl: './equipamento.component.html',
  styleUrls: ['./equipamento.component.css']
})
export class EquipamentoComponent implements OnInit {

  public equipamentos$: Observable<Equipamento[]>;
  public form: FormGroup;


  constructor(
    private equipamentoService: EquipamentoService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private toastr: ToastrService

  ) { }

  ngOnInit(): void {
    this.equipamentos$ = this.equipamentoService.selecionarTodos();

    this.form = this.fb.group({
      id: new FormControl(""),
      numeroSerie: new FormControl(""),
      nomeEquipamento: new FormControl(""),
      preco: new FormControl(""),
      dataFabricacao: new FormControl("")
    })
  }

  get tituloModal(): string {
    return this.id?.value ? "Atualização" : "Cadastro";
  }

  get nomeString(): string {
    return this.nomeEquipamento?.value;
  }

  get id() {
    return this.form.get("id");
  }

  get numeroSerie() {
    return this.form.get("numeroSerie");
  }

  get nomeEquipamento() {
    return this.form.get("nomeEquipamento");
  }

  get preco() {
    return this.form.get("preco");
  }

  get dataFabricacao() {
    return this.form.get("dataFabricacao");
  }

  public async gravar(modal: TemplateRef<any>, equipamento?: Equipamento) {

    this.form.reset(); //para limpar todos os dados do formulario, caso possa ter

    if (equipamento) // esse if seria para caso o objeto selecionado já seja um departamento, assim já retorna o próprio departamento da EDIÇÂO
      this.form.setValue(equipamento);

    try {
      await this.modalService.open(modal).result;

      if (equipamento) {
        await this.equipamentoService.editar(this.form.value); // caso seja um departamento ja instanciado, vai para o metodo editar
        this.toastr.success("Cadastro Editado com sucesso!!")
      }

      else {
        await this.equipamentoService.inserir(this.form.value) // caso contrario, é inserido um departamento novo
        this.toastr.success("Cadastro Inserido com sucesso!!")
      }

      console.log("O equipamento foi salvo com sucesso");
    } catch (error) {
      if(error != "fechar")
      this.toastr.error("Não foi possivel cadastrar corretamento!!!")
    }
  }

  public excluir(equipamento: Equipamento) {
    this.equipamentoService.excluir(equipamento);

    this.toastr.success("Cadastro Excluido com sucesso!!")
  }
}


