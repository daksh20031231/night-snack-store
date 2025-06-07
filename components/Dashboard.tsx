"use client"

import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import BuyerDashboard from "./BuyerDashboard"
import SellerDashboard from "./SellerDashboard"
import AdminDashboard from "./AdminDashboard"
import OrderHistory from "./OrderHistory"
import SellerOrders from "./SellerOrders"
import { LogOut, User, Package, History } from "lucide-react"
import toast from "react-hot-toast"
import { useAdmin } from "@/hooks/useAdmin"

type ViewType = "main" | "orders" | "history" | "admin"

export default function Dashboard() {
  const { data: session } = useSession()
  const { isAdmin } = useAdmin()
  const [userRole, setUserRole] = useState<"buyer" | "seller">("buyer")
  const [loading, setLoading] = useState(false)
  const [currentView, setCurrentView] = useState<ViewType>("main")
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    if (session?.user?.role) {
      setUserRole(session.user.role)
    }

    // Fetch notification count for sellers
    if (session?.user?.role === "seller") {
      fetchNotificationCount()
    }
  }, [session])

  const fetchNotificationCount = async () => {
    try {
      const response = await fetch("/api/seller/notifications")
      const data = await response.json()
      setNotificationCount(data.unreadCount || 0)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const handleRoleToggle = async (checked: boolean) => {
    setLoading(true)
    const newRole = checked ? "seller" : "buyer"

    try {
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        setUserRole(newRole)
        setCurrentView("main")
        toast.success(`Switched to ${newRole} mode`)
        // Refresh the session
        window.location.reload()
      } else {
        toast.error("Failed to switch role")
      }
    } catch (error) {
      toast.error("Error switching role")
    } finally {
      setLoading(false)
    }
  }

  const renderNavigation = () => {
    if (isAdmin && currentView === "admin") {
      return (
        <div className="flex items-center space-x-2">
          <Button
            variant={currentView === "main" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentView("main")}
          >
            Back to Dashboard
          </Button>
        </div>
      )
    }

    return (
      <div className="flex items-center space-x-2">
        {userRole === "buyer" && (
          <Button
            variant={currentView === "history" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentView("history")}
            className="flex items-center space-x-1"
          >
            <History className="h-4 w-4" />
            <span>Order History</span>
          </Button>
        )}

        {userRole === "seller" && (
          <Button
            variant={currentView === "orders" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setCurrentView("orders")
              setNotificationCount(0) // Reset count when viewing orders
            }}
            className="flex items-center space-x-1"
          >
            <Package className="h-4 w-4" />
            <span>My Orders</span>
            {notificationCount > 0 && (
              <Badge variant="destructive" className="ml-1">
                {notificationCount}
              </Badge>
            )}
          </Button>
        )}

        {isAdmin && (
          <Button
            variant={currentView === "admin" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentView("admin")}
          >
            Admin Panel
          </Button>
        )}

        {currentView !== "main" && (
          <Button variant="outline" size="sm" onClick={() => setCurrentView("main")}>
            Dashboard
          </Button>
        )}
      </div>
    )
  }

  if (!session) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">Night Snack Delivery</h1>
              {renderNavigation()}
            </div>

            <div className="flex items-center space-x-4">
              {/* Role Toggle */}
              <div className="flex items-center space-x-2">
                <Label htmlFor="role-toggle" className="text-sm">
                  Buyer
                </Label>
                <Switch
                  id="role-toggle"
                  checked={userRole === "seller"}
                  onCheckedChange={handleRoleToggle}
                  disabled={loading}
                />
                <Label htmlFor="role-toggle" className="text-sm">
                  Seller
                </Label>
              </div>

              {/* User Info */}
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="text-sm text-gray-700">{session.user?.name}</span>
              </div>

              {/* Sign Out */}
              <Button variant="outline" size="sm" onClick={() => signOut()} className="flex items-center space-x-1">
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === "admin" && isAdmin ? (
          <AdminDashboard />
        ) : currentView === "history" && userRole === "buyer" ? (
          <OrderHistory />
        ) : currentView === "orders" && userRole === "seller" ? (
          <SellerOrders />
        ) : userRole === "seller" ? (
          <SellerDashboard />
        ) : (
          <BuyerDashboard />
        )}
      </main>
    </div>
  )
}
