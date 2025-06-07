import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import dbConnect from "./mongodb"
import User from "@/models/User"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          await dbConnect()

          const existingUser = await User.findOne({ email: user.email })

          if (!existingUser) {
            await User.create({
              email: user.email,
              name: user.name,
              image: user.image,
              role: "buyer",
            })
          }

          return true
        } catch (error) {
          console.error("Error saving user:", error)
          return false
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session.user?.email) {
        try {
          await dbConnect()
          const dbUser = await User.findOne({ email: session.user.email })
          if (dbUser) {
            session.user.id = dbUser._id.toString()
            session.user.role = dbUser.role
            session.user.hostel = dbUser.hostel
            session.user.roomNumber = dbUser.roomNumber
          }
        } catch (error) {
          console.error("Error fetching user session:", error)
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
}
