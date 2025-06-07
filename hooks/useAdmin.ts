"use client"

import { useSession } from "next-auth/react"
import { useMemo } from "react"

export function useAdmin() {
  const { data: session } = useSession()

  const isAdmin = useMemo(() => {
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
    return !!(session?.user?.email && adminEmail && session.user.email === adminEmail)
  }, [session?.user?.email])

  return { isAdmin, session }
}
