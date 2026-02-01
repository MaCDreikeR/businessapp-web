// Tipos completos do sistema BusinessApp

export interface Estabelecimento {
  id: string;
  nome: string;
  slug: string;
  logo_url?: string;
  telefone?: string;
  endereco?: string;
  status: 'ativa' | 'inativa';
  created_at: string;
  updated_at: string;
}

export interface AgendamentoOnlineConfig {
  id: string;
  estabelecimento_id: string;
  ativo: boolean;
  mensagem_boas_vindas?: string;
  mensagem_pos_agendamento?: string;
  created_at: string;
  updated_at: string;
}

export interface Profissional {
  id: string;
  estabelecimento_id: string;
  nome: string;
  foto_url?: string;
  especialidade?: string;
  ativo: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
}

export interface Servico {
  id: string;
  estabelecimento_id: string;
  nome: string;
  descricao?: string;
  duracao: number; // minutos
  preco: number;
  ativo: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
}

export interface Pacote {
  id: string;
  estabelecimento_id: string;
  nome: string;
  descricao?: string;
  duracao_total: number; // minutos
  valor: number;
  desconto?: number;
  data_cadastro?: string;
}

export interface Cliente {
  id: string;
  estabelecimento_id: string;
  nome?: string;
  telefone: string;
  email?: string;
  origem: 'manual' | 'online' | 'importado';
  created_at: string;
  updated_at: string;
}

export type AgendamentoStatus = 'AGENDADO' | 'CONFIRMADO' | 'EM_ATENDIMENTO' | 'CONCLUIDO' | 'CANCELADO' | 'FALTOU';

export interface Agendamento {
  id: string;
  estabelecimento_id: string;
  cliente_id: string;
  profissional_id: string;
  servico_id?: string;
  pacote_id?: string;
  data: string; // YYYY-MM-DD
  hora_inicio: string; // HH:MM
  hora_fim: string; // HH:MM
  duracao: number; // minutos
  status: AgendamentoStatus;
  observacao?: string;
  origem: 'manual' | 'online';
  created_at: string;
  updated_at: string;
}

export interface Comanda {
  id: string;
  estabelecimento_id: string;
  cliente_id: string;
  agendamento_id?: string;
  data: string;
  status: 'ABERTA' | 'FECHADA' | 'CANCELADA';
  valor_total: number;
  valor_pago: number;
  created_at: string;
  updated_at: string;
}

// DTOs para Edge Functions

export interface CriarAgendamentoOnlineDTO {
  slug: string;
  data: string; // YYYY-MM-DD
  hora: string; // HH:MM
  profissional_id: string;
  servicos_ids?: string[];
  pacotes_ids?: string[];
  nome: string;
  telefone: string;
  observacao?: string;
}

export interface HorarioDisponivel {
  hora: string;
  disponivel: boolean;
  profissionais_disponiveis: string[];
}

export interface DisponibilidadeResponse {
  data: string;
  horarios: HorarioDisponivel[];
}

// Database type para Supabase
export interface Database {
  public: {
    Tables: {
      estabelecimentos: {
        Row: Estabelecimento;
        Insert: Omit<Estabelecimento, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Estabelecimento, 'id' | 'created_at' | 'updated_at'>>;
      };
      agendamento_online_config: {
        Row: AgendamentoOnlineConfig;
        Insert: Omit<AgendamentoOnlineConfig, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AgendamentoOnlineConfig, 'id' | 'created_at' | 'updated_at'>>;
      };
      profissionais: {
        Row: Profissional;
        Insert: Omit<Profissional, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profissional, 'id' | 'created_at' | 'updated_at'>>;
      };
      servicos: {
        Row: Servico;
        Insert: Omit<Servico, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Servico, 'id' | 'created_at' | 'updated_at'>>;
      };
      pacotes: {
        Row: Pacote;
        Insert: Omit<Pacote, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Pacote, 'id' | 'created_at' | 'updated_at'>>;
      };
      clientes: {
        Row: Cliente;
        Insert: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Cliente, 'id' | 'created_at' | 'updated_at'>>;
      };
      agendamentos: {
        Row: Agendamento;
        Insert: Omit<Agendamento, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Agendamento, 'id' | 'created_at' | 'updated_at'>>;
      };
      comandas: {
        Row: Comanda;
        Insert: Omit<Comanda, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Comanda, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Functions: {
      buscar_horarios_disponiveis: {
        Args: {
          p_estabelecimento_id: string;
          p_data: string;
          p_servico_id?: string;
          p_pacote_id?: string;
        };
        Returns: DisponibilidadeResponse;
      };
    };
  };
}
