"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, Phone } from "lucide-react"
import toast from "react-hot-toast"
import { useAdmin } from "@/hooks/useAdmin"

interface Order {
  _id: string
  buyerName: string
  buyerEmail: string
  contactNumber: string
  items: Array<{
    title: string
    price: number
    quantity: number
  }>
  totalAmount: number
  deliveryCharge: number
  hostel: string
  roomNumber: string
  paymentMethod: string
  status: string
  createdAt: string
}

export default function AdminDashboard() {
  const { isAdmin } = useAdmin()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [hostelFilter, setHostelFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/orders?admin=true")
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      toast.error("Failed to fetch orders")
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast.success("Order status updated successfully")
        fetchOrders() // Refresh orders
      } else {
        toast.error("Failed to update order status")
      }
    } catch (error) {
      toast.error("Error updating order status")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const groupOrdersByHostel = () => {
    const himalayaOrders = filteredOrders.filter((order) => order.hostel === "Himalaya")
    const janadharOrders = filteredOrders.filter((order) => order.hostel === "Janadhar")

    return { himalayaOrders, janadharOrders }
  }

  const { himalayaOrders, janadharOrders } = groupOrdersByHostel()

  // Calculate subtotal (total - delivery charge)
  const getSubtotal = (order: Order) => {
    return order.totalAmount - (order.deliveryCharge || 10)
  }

  useEffect(() => {
    if (isAdmin) {
      fetchOrders()
    }
  }, [isAdmin])

  useEffect(() => {
    let filtered = orders

    if (hostelFilter !== "all") {
      filtered = filtered.filter((order) => order.hostel === hostelFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    // Sort by hostel, then by status, then by date
    filtered.sort((a, b) => {
      if (a.hostel !== b.hostel) {
        return a.hostel.localeCompare(b.hostel)
      }
      if (a.status !== b.status) {
        const statusOrder = ["pending", "confirmed", "delivered", "cancelled"]
        return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    setFilteredOrders(filtered)
  }, [orders, hostelFilter, statusFilter])

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-red-800 mb-2">Access Denied</h3>
          <p className="text-red-600">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="text-gray-600">Manage all orders across hostels</p>
        </div>

        <div className="flex items-center space-x-4">
          <Select value={hostelFilter} onValueChange={setHostelFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hostels</SelectItem>
              <SelectItem value="Himalaya">Himalaya Hostel</SelectItem>
              <SelectItem value="Janadhar">Janadhar Hostel</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={fetchOrders} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{filteredOrders.length}</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{himalayaOrders.length}</div>
            <div className="text-sm text-gray-600">Himalaya Orders</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{janadharOrders.length}</div>
            <div className="text-sm text-gray-600">Janadhar Orders</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {filteredOrders.filter((order) => order.status === "pending").length}
            </div>
            <div className="text-sm text-gray-600">Pending Orders</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              ₹{filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No orders found</div>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order._id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {order.buyerName} - Order #{order._id.slice(-8)}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{order.buyerEmail}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{order.contactNumber || "No contact number"}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {order.hostel} Hostel - Room {order.roomNumber}
                    </p>
                    <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right space-y-2">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>

                    {/* Status Update Controls */}
                    <div className="flex flex-col space-y-1">
                      <Select
                        value={order.status}
                        onValueChange={(newStatus) => updateOrderStatus(order._id, newStatus)}
                      >
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {item.title} x {item.quantity}
                      </span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}

                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>₹{getSubtotal(order)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Delivery Charge</span>
                      <span>₹{order.deliveryCharge || 10}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Total ({order.paymentMethod})</span>
                      <span>₹{order.totalAmount}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
