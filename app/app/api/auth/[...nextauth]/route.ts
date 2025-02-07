import { prismaClient } from "@/app/lib/db"
import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
 const handler = NextAuth( {
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "" ,
    }),
    // ...add more providers here
  ],
  callbacks: {
   async signIn(params) {
        if (!params.user.email) {
          return false
        }
       try {
        await prismaClient.user.create({
          data: {
            email: params.user?.email,
            provider: "Google"
          }
        })
      
       } catch (error) {
         return false
       }
       return true
    }
  }

})

export {handler as GET , handler as POST}