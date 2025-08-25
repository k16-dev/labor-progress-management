import { Role, LoginData } from '@/types';

const CENTRAL_PASSWORD = '1050';
const OTHER_PASSWORD = '1234';

export interface AuthSession {
  role: Role;
  orgId?: string;
  orgName?: string;
  isAuthenticated: boolean;
}

export class AuthService {
  private static readonly SESSION_KEY = 'labor_progress_session';

  static validateLogin(loginData: LoginData): boolean {
    const { role, password, orgId } = loginData;
    
    if (role === 'central') {
      return password === CENTRAL_PASSWORD;
    } else {
      // ブロック/支部/分会の場合は組織選択が必須
      return password === OTHER_PASSWORD && !!orgId;
    }
  }

  static saveSession(session: AuthSession): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify({
        ...session,
        timestamp: Date.now()
      }));
    }
  }

  static getSession(): AuthSession | null {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.SESSION_KEY);
      if (stored) {
        const session = JSON.parse(stored);
        // 30日間有効
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        if (Date.now() - session.timestamp < thirtyDays) {
          return {
            role: session.role,
            orgId: session.orgId,
            orgName: session.orgName,
            isAuthenticated: session.isAuthenticated
          };
        }
      }
    }
    return null;
  }

  static clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.SESSION_KEY);
    }
  }

  static isAuthenticated(): boolean {
    const session = this.getSession();
    return session?.isAuthenticated || false;
  }

  static getCurrentUser(): AuthSession | null {
    return this.getSession();
  }

  static canManageCommonTasks(role: Role): boolean {
    return role === 'central';
  }

  static canManageLocalTasks(role: Role, orgId: string, taskCreatedByOrgId: string): boolean {
    return role !== 'central' && orgId === taskCreatedByOrgId;
  }

  static canViewAllProgress(role: Role): boolean {
    return role === 'central';
  }

  static canUpdateProgress(role: Role, orgId: string, progressOrgId: string): boolean {
    if (role === 'central') {
      return false; // 中央は進捗更新不可
    }
    return orgId === progressOrgId;
  }
}