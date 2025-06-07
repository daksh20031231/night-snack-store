declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: "buyer" | "seller"
      hostel?: string
      roomNumber?: string
    }
  }
}
