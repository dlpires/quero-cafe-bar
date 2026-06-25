export interface IComanda {
  id: number;
  id_mesa: number;
  obs_comanda?: string;
  status: string;
}

export interface ICreateComandaInput {
  id_mesa: number;
  obs_comanda?: string;
  status?: string;
}

export interface IUpdateComandaInput {
  id_mesa?: number;
  obs_comanda?: string;
  status?: string;
}

export interface IComandaOutput extends IComanda {}
