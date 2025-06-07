"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import toast from "react-hot-toast"

interface Order {
  _id: string
  items: Array<{
    title: string
    price: number
    quantity: number
  }>
  totalAmount: number
  deliveryCharge: number
  hostel: string
  roomNumber: string
  contactNumber: string
  paymentMethod: string
  status: string
  createdAt: string
  statusHistory?: Array<{
    status: string
    updatedAt: string
    updatedBy: string
  }>
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/orders")
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      toast.error("Failed to fetch order history")
    } finally {
      setLoading(false)
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

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "pending":
        return "Your order is being processed"
      case "confirmed":
        return "Order confirmed, preparing for delivery"
      case "delivered":
        return "Order delivered successfully"
      case "cancelled":
        return "Order was cancelled"
      default:
        return "Unknown status"
    }
  }

  // Calculate subtotal (total - delivery charge)
  const getSubtotal = (order: Order) => {
    return order.totalAmount - (order.deliveryCharge || 10)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
          <p className="text-gray-600">Track all your past and current orders</p>
        </div>

        <Button onClick={fetchOrders} disabled={loading} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">Loading order history...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No orders found</p>
            <p className="text-sm text-gray-400 mt-2">Your order history will appear here</p>
          </div>
        ) : (
          orders.map((order) => (
            <Card key={order._id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Order #{order._id.slice(-8)}</CardTitle>
                    <p className="text-sm text-gray-600">
                      {order.hostel} Hostel - Room {order.roomNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      Placed on {new Date(order.createdAt).toLocaleDateString()} at{" "}
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">{getStatusDescription(order.status)}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {/* Order Items */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Items Ordered:</h4>
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                        <span>
                          {item.title} x {item.quantity}
                        </span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Order Total */}
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

                  {/* Contact Info */}
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Contact: {order.contactNumber || "Not provided"}</p>
                  </div>

                  {/* Status History */}
                  {order.statusHistory && order.statusHistory.length > 1 && (
                    <div className="mt-4 pt-3 border-t">
                      <h4 className="font-medium text-sm mb-2">Order Timeline:</h4>
                      <div className="space-y-1">
                        {order.statusHistory.map((history, index) => (
                          <div key={index} className="text-xs text-gray-600 flex justify-between">
                            <span>{history.status.charAt(0).toUpperCase() + history.status.slice(1)}</span>
                            <span>{new Date(history.updatedAt).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
