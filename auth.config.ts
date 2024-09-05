import { NextAuthConfig } from 'next-auth';
import CredentialProvider from 'next-auth/providers/credentials';

const authConfig = {
  providers: [
    CredentialProvider({
      credentials: {
        mobile_number: { label: 'Mobile Number', type: 'text' },
        otp: { label: 'OTP', type: 'text' }
      },
      async authorize(credentials, req) {
        const { mobile_number, otp } = credentials as {
          mobile_number: string;
          otp?: string;
        };

        console.log(`Mobile for OTP request: ${mobile_number}, ${otp}`);

        if (!otp) {
          // Request OTP
          console.log('request otp');
          const otpResponse = await fetch(
            'https://moo-service-625918969160.asia-southeast1.run.app/v1/otp/request',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ mobile_number })
            }
          );

          console.log(`OTP Request Response Status: ${otpResponse.status}`);
          const otpResponseBody = await otpResponse.text();
          console.log(`OTP Request Response Body: ${otpResponseBody}`);

          if (!otpResponse.ok) {
            console.log('error otp');
            throw new Error('Failed to send OTP');
          }

          return {};
        } else {
          // Verify OTP
          console.log('verify otp');
          const verifyResponse = await fetch(
            'https://moo-service-625918969160.asia-southeast1.run.app/v1/otp/verify',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ mobile_number, otp })
            }
          );

          if (verifyResponse.ok) {
            const verifyResult = await verifyResponse.json();
            const { access_token, token_type } = verifyResult;

            const userResponse = await fetch(
              'https://moo-service-625918969160.asia-southeast1.run.app/v1/users/me',
              {
                method: 'GET',
                headers: {
                  Authorization: `${token_type} ${access_token}`
                }
              }
            );

            if (userResponse.ok) {
              const userData = await userResponse.json();
              // return { id: userData.id, name: userData.name, mobile_number };
              console.log(JSON.stringify(userData));
              return {
                ...userData,
                access_token,
                token_type
              };
            } else {
              throw new Error('Failed to fetch user info');
            }
          } else {
            return null;
          }
        }
      }
    })
  ],
  pages: {
    signIn: '/',
    signOut: '#'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.access_token = user.access_token;
        token.token_type = user.token_type;
      }
      return token;
    },
    async session({ session, token }) {
      session.access_token = token.access_token;
      session.token_type = token.token_type;
      return session;
    }
  },
  events: {
    async signOut(message) {
      try {
        console.log('message');
        console.log(message);

        if (message.token?.access_token && message.token?.token_type) {
          const logoutResponse = await fetch(
            'https://moo-service-625918969160.asia-southeast1.run.app/v1/users/logout',
            {
              method: 'POST',
              headers: {
                Authorization: `${message.token.token_type} ${message.token.access_token}`
              }
            }
          );

          if (!logoutResponse.ok) {
            console.error('Failed to logout');
          }
          console.log('successfully logout');
        }
      } catch (error) {
        console.error('Error during signout:', error);
      }
    }
  }
} satisfies NextAuthConfig;

export default authConfig;
