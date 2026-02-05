
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface ExposureStep {
  id: string;
  behavior: string;
  rating: number;
  completed: boolean;
}

export interface RitualItem {
  id: string;
  label: string;
  completed: boolean;
  type: 'morning' | 'evening';
}

export enum DistorcaoCognitiva {
  CATASTROFIZACAO = 'Catastrofização',
  LEITURA_MENTAL = 'Leitura Mental',
  SUPERGENERALIZACAO = 'Supergeneralização',
  DESQUALIFICACAO_POSITIVO = 'Desqualificação do Positivo',
  RACIOCINIO_EMOCIONAL = 'Raciocínio Emocional',
  TUDO_OU_NADA = 'Tudo ou Nada',
  IMPERATIVOS = 'Deveria/Tenho que'
}

export interface RPDRecord {
  id: string;
  data: string;
  situacao: string;
  pensamentoAutomatico: string;
  distorcao?: DistorcaoCognitiva;
  emocao: string;
  intensidade: number;
  respostaRacional: string;
  resultado: string;
}

export interface DailyReflection {
  gratidao: string;
  vitoria1: string;
  vitoria2: string;
  vitoria3: string;
}

export interface HabitStatus {
  sono: boolean;
  nutricao: boolean;
  exercicio: boolean;
  mindfulness: boolean;
  luzNatural: boolean;
  hidratacao: boolean;
}

export interface UserProfile {
  points: number;
  level: number;
  xpToNextLevel: number;
  badges: string[];
}

export interface NotificationSettings {
  habitsEnabled: boolean;
  habitsTime: string;
  exposureEnabled: boolean;
  exposureTime: string;
  reflectionEnabled: boolean;
  reflectionTime: string;
}
