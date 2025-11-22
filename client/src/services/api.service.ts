import axios, { type AxiosResponse, AxiosError } from 'axios';
import type {LogroGalery,Mission, GymProfile,Assignment, User, MissionCreated, EventResponse, Updateuser, Group, MemberUpdate, CreateGroup, UpdateMissionsParams, UpdateMissionsParamsVote, GymProfileUpdate, AssignmentMissionResponse, MissionType, EventHistory} from "./api.interfaces"

// Configuración base de axios
//const BACKEND_URL = process.env.APP_BACKEND_URL;
const BACKEND_URL = "http://localhost:8000"
const API_BASE_URL = `${BACKEND_URL}/api/v1`;

// Instancia de axios configurada
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Para enviar cookies HTTP Only automáticamente
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores globalmente
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);


class ApiService {

  // METODOS PARA PROFILES
  async init_profile_gamer(userId:string,email:string): Promise<string> {
    try {
      const response: AxiosResponse<string> = await apiClient.post(`/profiles/${userId}`,{email:email});
      return response.data;
    } catch (error) {
      console.error('Error init profile :', error);
      throw error;
    }
  }

  //  MÉTODOS PARA MISSIONES 
  async getAllMissions(): Promise<Mission[]> {
    try {
      const response: AxiosResponse<Mission[]> = await apiClient.get('/missions');
      return response.data;
    } catch (error) {
      console.error('Error fetching missions:', error);
      throw error;
    }
  }

  async getAllLogros(): Promise<LogroGalery[]> {
    try {
      const response: AxiosResponse<LogroGalery[]> = await apiClient.get('/missions/logros');
      return response.data;
    } catch (error) {
      console.error('Error fetching logros:', error);
      throw error;
    }
  }

  async getMissionById(id: string): Promise<Mission> {
    try {
      const response: AxiosResponse<Mission> = await apiClient.get(`/missions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching mission ${id}:`, error);
      throw error;
    }
  }

  async updateMission(id: number, missionData: Partial<Mission>): Promise<Mission> {
    try {
      const response: AxiosResponse<Mission> = await apiClient.put(`/missions/${id}`, missionData);
      return response.data;
    } catch (error) {
      console.error(`Error updating mission ${id}:`, error);
      throw error;
    }
  }

  async completeMission(id: number): Promise<Mission> {
    try {
      const response: AxiosResponse<Mission> = await apiClient.post(`/missions/${id}/complete`);
      return response.data;
    } catch (error) {
      console.error(`Error completing mission ${id}:`, error);
      throw error;
    }
  }

  //  MÉTODOS PARA PERFILES DE GYM 
  async getGymGroupProfiles(groupId:string): Promise<GymProfile[]> {
    try {
      const response: AxiosResponse<GymProfile[]> = await apiClient.get(`/profiles/groups/${groupId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching gym profiles:', error);
      throw error;
    }
  }

  async getMyGymProfile(userId:string): Promise<GymProfile> {
    try {
      const response: AxiosResponse<GymProfile> = await apiClient.get(`/profiles/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching my gym profile:', error);
      throw error;
    }
  }

  async getAssignament(personId:string): Promise<Assignment> {
    try {
      const response: AxiosResponse<Assignment> = await apiClient.get(`/assignments/${personId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching the assignments:', error);
      throw error;
    }
  }

  async getAssignamentAllMissions(personId:string): Promise<AssignmentMissionResponse> {
    try {
      const response: AxiosResponse<AssignmentMissionResponse> = await apiClient.get(`/assignments/${personId}/missions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching the assignments missions:', error);
      throw error;
    }
  }

  async initAssignment(userId:string,userName:string): Promise<Assignment> {
    try {
      const response: AxiosResponse<Assignment> = await apiClient.post(`/assignments/${userId}?user_name=${userName}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching the assignments:', error);
      throw error;
    }
  }

  async updateAssignment(userId:string,missionType:MissionType): Promise<EventResponse> {
    try {
      const response: AxiosResponse<EventResponse> = await apiClient.put(`/assignments/${userId}/missions/${missionType}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching the assignments:', error);
      throw error;
    }
  }

  async updateAssignmentParams(userId:string,updateData:UpdateMissionsParams): Promise<EventResponse> {
    try {
      const response: AxiosResponse<EventResponse> = await apiClient.put(`/assignments/${userId}/missions/params`,updateData);
      return response.data;
    } catch (error) {
      console.error('Error fetching the assignments:', error);
      throw error;
    }
  }

  async updateAssignmentVote(userId:string,voterId:string,updateData:UpdateMissionsParamsVote): Promise<EventResponse> {
    try {
      const response: AxiosResponse<EventResponse> = await apiClient.put(`/assignments/${userId}/missions/votes/${voterId}`,updateData);
      return response.data;
    } catch (error) {
      console.error('Error realizando la votacion:', error);
      throw error;
    }
  }

  async createSecondaryMission(userId:string): Promise<MissionCreated> {
    try {
      const response: AxiosResponse<MissionCreated> = await apiClient.post(`/secondary/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error create de secondary mission:', error);
      throw error;
    }
  }

  async updateGymProfile(userId: string, profileData: GymProfileUpdate): Promise<GymProfile> {
    try {
      const response: AxiosResponse<GymProfile> = await apiClient.put(
        `/profiles/${userId}`,
        profileData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating gym profile del userID:  ${userId}:`, error);
      throw error;
    }
  }

  async getGroup(group_id:string): Promise<Group> {
    try {
      const response: AxiosResponse<Group> = await apiClient.get(`/groups/${group_id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching group:', error);
      throw error;
    }
  }

  async createGroup(group_data:CreateGroup): Promise<Group> {
    try {
      const response: AxiosResponse<Group> = await apiClient.post(`/groups`,group_data);
      return response.data;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  async deletedGroup(group_id:string): Promise<Group> {
    try {
      const response: AxiosResponse<Group> = await apiClient.delete(`/groups/${group_id}/cascade`);
      return response.data;
    } catch (error) {
      console.error('Error eliminando group:', error);
      throw error;
    }
  }

  async getAllGroups(): Promise<Group[]> {
    try {
      const response: AxiosResponse<Group[]> = await apiClient.get(`/groups`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all groups:', error);
      throw error;
    }
  }

  async getHistory(userId:string): Promise<EventHistory[]> {
    try {
      const response: AxiosResponse<EventHistory[]> = await apiClient.get(`/history/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all groups:', error);
      throw error;
    }
  }

  async updateMemberGroup(group_id:string, member_data: MemberUpdate): Promise<Group> {
    try {
      const response: AxiosResponse<Group> = await apiClient.put(`/groups/members/${group_id}`,member_data);
      return response.data;
    } catch (error) {
      console.error('Error update member:', error);
      throw error;
    }
  }

  async login(email:string,password:string): Promise<User> {

    try {
      const response: AxiosResponse<User> = await apiClient.post(`/auth/login`, { email, password });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  //  MÉTODOS PARA AUTENTICACIÓN 
  async getCurrentUser(): Promise<User> {
    try {
      const response: AxiosResponse<User> = await apiClient.get('/users/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }

  async updateUser(userId:string,updateUser:Updateuser): Promise<EventResponse> {
    try {
      const response: AxiosResponse<EventResponse> = await apiClient.put(`/users/${userId}`,updateUser);
      return response.data;
    } catch (error) {
      console.error('Error update user:', error);
      throw error;
    }
  }
  
  async register(email:string,password:string,name:string,role:string): Promise<User> {
    try {
      const response: AxiosResponse<User> = await apiClient.post(`/auth/register`, { email, password, name, role});
      console.log("response register: ",response.data)
      return response.data;
    } catch (error) {
      console.error('Error register user:', error);
      throw error;
    }
  }

  async logout(){
    try {
      await apiClient.post(`/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error('Error logout', error);
      throw error;
    }
  }
}

// Exportar una instancia única (Singleton)
export const apiService = new ApiService();
export default apiService;