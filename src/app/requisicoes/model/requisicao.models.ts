import { Departamento } from "src/app/departamentos/models/departamento.models";
import { Equipamento } from "src/app/equipamentos/model/equipamento.models";
import { Funcionario } from "src/app/funcionarios/model/funcionario.models";
import { Movimentacao } from "./movimentacao.model";


export class Requisicao {
  id: string;
  abertura:  Date | any;
  descricao: string;

  departamentoId: string;
  departamento?: Departamento;

  equipamentoId?: string;
  equipamento?: Equipamento;

  solicitanteId: string;
  solicitante?: Funcionario;

  status: string;
  ultimaAtualizacao : Date | any;
  movimentacoes: Movimentacao[];

}
