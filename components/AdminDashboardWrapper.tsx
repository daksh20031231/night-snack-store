import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import AdminDashboard from "./AdminDashboard"

export default async function AdminDashboardWrapper() {
  const session = await getServerSession(authOptions)
  const adminEmail = process.env.ADMIN_EMAIL

  // Server-side admin check
  if (!session?.user?.email || !adminEmail || session.user.email !== adminEmail) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-red-800 mb-2">Access Denied</h3>
          <p className="text-red-600">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    )
  }

  return <AdminDashboard />
}
