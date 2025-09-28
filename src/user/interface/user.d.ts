export interface IUserInfo {
  id: number;
  name: string;
  password: string;
  email: string;
  role: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: null | Date;
}

export interface IUserRegister {
  name: string;
  email: string;
  password: string;
  role: number
}