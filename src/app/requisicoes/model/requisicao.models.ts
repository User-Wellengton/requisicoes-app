import { Departamento } from "src/app/departamentos/models/departamento.models";
import { Equipamento } from "src/app/equipamentos/model/equipamento.models";
import { Funcionario } from "src/app/funcionarios/model/funcionario.models";


export class Requisicao {
  id: string;
  abertura: string;
  departamentoId: string;
  departamento?: Departamento;
  descricao: string;
  equipamentoId?: string;
  equipamento?: Equipamento;

  solicitanteId: string;
  solicitante: Funcionario;

}
