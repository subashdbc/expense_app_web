export interface Login {
  email: string;
  password: string
}

export interface RegiserUser {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: string
  isactive: boolean
}