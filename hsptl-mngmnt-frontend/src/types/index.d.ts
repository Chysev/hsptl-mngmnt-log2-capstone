export type User = {
  id: string;
  name?: string;
  email?: string;
  password?: string;
  avatarUrl?: string;
  description?: string;
  role?: string;
};

export type Mail = {
  smtpHost: string;
  smtpPort: string;
  smtpService: string;
  smtpEmail: string;
  smtpPassword: string;
};

export interface TokenContextType {
  sessionToken: string;
}