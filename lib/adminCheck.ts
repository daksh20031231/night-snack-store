import { getServerSession } from "next-auth"
import { authOptions } from "./auth"

export async function isAdminUser(): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions)
    const adminEmail = process.env.ADMIN_EMAIL

    if (!session?.user?.email || !adminEmail) {
      return false
    }

    return session.user.email === adminEmail
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

export async function requireAdmin() {
  const isAdmin = await isAdminUser()
  if (!isAdmin) {
    throw new Error("Unauthorized: Admin access required")
  }
  return true
}
