
export interface Nivel {
  numeroNivel: number;
  descripcionNivel: string;
  rangoXp: string;
  imagen: string;
}

// Interface para el logro
export interface Logro {
  nombre: string;
  descripcion: string;
  pegatina: string;
}

// Interface para recompensa extra
export interface Extra {
  descripcion: string;
  recompensa: string;
}

export interface Mission {
  id: string;
  imagen: string;
  nombre: string;
  nivel: Nivel;
  recompensa: string;
  extra?: Extra;
  descripcion: string;
  logro?: Logro;
}

export interface SecondaryMission {
  id: string;
  nombre: string;
  recompensa: string;
  descripcion: string;
}

export interface AssignmentMissionResponse{
  mission:Mission
  secondary_mission:SecondaryMission
}

export interface MissionModal {
  id: string;
  imagen?: string;
  nombre: string;
  nivel?: Nivel;
  recompensa: string;
  extra?: Extra;
  descripcion: string;
  logro?: Logro;
}
export interface ArchiveMission{
  person_id: string,
  name: string
  tipo: string
  description: string
  result: string
  status: string
}


export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Deuda{
    tipo: string
    cantidad: string
}

export interface Pesos{
    pressBanca: string
    sentadilla: string
    pesoMuerto: string
    prensa: string
    biceps: string
}

export interface GymProfile {
    id: number;
    user_id: string;
    edad: string;
    name: string;
    email:string;
    apodo: string;
    titulo: string;
    peso_corporal: string;
    altura: string;
    aura: string;
    deuda: Deuda;
    pesos: Pesos;
    mujeres: string;
    frase: string;
    objetivo: string;
    img: string;
}

export interface GymProfileUpdate{
  aura?:string
  apodo?: string
  peso_corporal?: string
  pesos?: Partial<Pesos> 
  mujeres?: string 
  frase?: string
  objetivo?: string
}

//asignaciones
export type MissionStatus = "active" | "pending_review" | "completed" | "failed";
export type MissionType = "mission" | "secondary_mission" | "group_mission"

export const MissionType = {
  Principal: "mission" as MissionType,
  Secondary: "secondary_mission" as MissionType,
  Group: "group_mission" as MissionType,
};

export const MissionStatus = {
  Active: "active" as MissionStatus,
  Pending: "pending_review" as MissionStatus,
  Completed: "completed" as MissionStatus,
  Failed: "failed" as MissionStatus,
};

export interface MissionAssignment{
    mission_name: string
    mission_id: string
    status: MissionStatus
    creation_date: string
    result?: string
    like?: number
    dislike?: number
    voters: string[]
}

export interface EventHistory{
    user_id: string
    mission_id: string
    name: string
    tipo: 'mission' | 'secondary_mission'
    result: string
    status:'completed' | 'failed'
    created: string
    logro_name: string
}
    

export interface MissionUpdate{
    mission_name: string
    mission_id: string
}

export interface Assignment{ 
    person_id: string
    person_name: string
    mission: MissionAssignment
    secondary_mission? : MissionAssignment
    group_mission? : MissionAssignment
}

export interface AssignmentUpdate{
    mission? : MissionUpdate
    secondary_mission? : MissionUpdate
    group_mission? : MissionUpdate
}

export interface UpdateMissionsParams{
    mission_type: MissionType
    status?: MissionStatus
    result?: string
}

export interface UpdateMissionsParamsVote{
    mission_type: MissionType
    like?: number
    dislike?: number
    group_size: number
}

export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

export interface User{
    id: string
    email: string
    name: string
    role: string
    created_at: string
    is_active: boolean
}

export interface MissionCreated{
  mission_id:string,
  mission_name:string,
  message:string,
  success:string,
}

export interface EventResponse{
    id: string
    message: string
    success: boolean
}

export interface Updateuser{
    role?: string
    is_active?: boolean
    group_id?: string
}

interface Member{
  user_name:string
  user_id: string
}

export interface Group{
    id:string
    members:Member[]
    group_name: string
    created: string
    created_by: string
    creator_id: string
}

export interface MemberUpdate{
  user_name:string
  user_id: string
  remove: boolean
  password?: string
}

export interface CreateGroup{
  current_user_id: string
  current_user_name: string
  group_name: string
  password:string
}

export interface LogroGalery{
  id: string
  nombre: string
  descripcion: string
  pegatina: string
  misionAsociada: string
  idMision: string
  nivel: string
}