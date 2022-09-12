import { Funcionario } from "src/app/funcionarios/model/funcionario.models";

export class Movimentacao {
  status: string;
  data: Date | any;
  descricao: string;
  funcionario: Funcionario;
}
