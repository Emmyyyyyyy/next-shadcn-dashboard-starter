import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  type UserSession = DefaultSession['user'];
  type AccessTokenSession = DefaultSession['access_token'];
  type TokenTypeSession = DefaultSession['token_type'];
  interface Session {
    user: UserSession;
    access_token: AccessTokenSession;
    token_type: TokenTypeSession;
  }

  interface CredentialsInputs {
    email: string;
    password: string;
  }

  interface User {
    access_token?: string;
    token_type?: string;
    id: string;
    email: string;
    is_active: boolean;
    is_superuser: boolean;
    is_verified: boolean;
    username: string;
    mobile_number: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    access_token?: string;
    token_type?: string;
  }
}
