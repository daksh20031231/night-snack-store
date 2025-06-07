"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function verifyAdminAccess(): Promise<{ isAdmin: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions)
    const adminEmail = process.env.ADMIN_EMAIL

    if (!session?.user?.email) {
      return { isAdmin: false, error: "Not authenticated" }
    }

    if (!adminEmail) {
      return { isAdmin: false, error: "Admin email not configured" }
    }

    if (session.user.email !== adminEmail) {
      return { isAdmin: false, error: "Unauthorized access" }
    }

    return { isAdmin: true }
  } catch (error) {
    console.error("Error verifying admin access:", error)
    return { isAdmin: false, error: "Server error" }
  }
}
