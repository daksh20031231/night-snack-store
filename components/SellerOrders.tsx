"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Phone, MapPin, Check, Truck } from "lucide-react"
import toast from "react-hot-toast"

interface Order {
  _id: string
  buyerName: string
  buyerEmail: string
  contactNumber: string
  items: Array<{
    productId: string
    title: string
    price: number
    quantity: number
    sellerId: string
  }>
  totalAmount: number
  deliveryCharge: number
  hostel: string
  roomNumber: string
  paymentMethod: string
  status: string
  createdAt: string
}

export default function SellerOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

  useEffect(() => {
    fetchSellerOrders()
  }, [])

  const fetchSellerOrders = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/orders?seller=true")
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      toast.error("Failed to fetch orders")
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    setUpdatingOrderId(orderId)
    try {
      const response = await fetch(`/api/orders/${orderId}/seller-status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast.success(`Order ${status === "confirmed" ? "accepted" : "delivered"} successfully`)
        fetchSellerOrders() // Refresh orders
      } else {
        toast.error("Failed to update order status")
      }
    } catch (error) {
      toast.error("Error updating order status")
    } finally {
      setUpdatingOrderId(null)
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

  // Filter items that belong to this seller
  const getSellerItems = (order: Order) => {
    return order.items.filter((item) => item.sellerId)
  }

  const getSellerTotal = (order: Order) => {
    const sellerItems = getSellerItems(order)
    return sellerItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
          <p className="text-gray-600">Orders containing your products</p>
        </div>

        <Button onClick={fetchSellerOrders} disabled={loading} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{orders.length}</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{orders.filter((order) => order.status === "pending").length}</div>
            <div className="text-sm text-gray-600">Pending Orders</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              ₹{orders.reduce((total, order) => total + getSellerTotal(order), 0)}
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No orders found</p>
            <p className="text-sm text-gray-400 mt-2">Orders for your products will appear here</p>
          </div>
        ) : (
          orders.map((order) => {
            const sellerItems = getSellerItems(order)
            const sellerTotal = getSellerTotal(order)

            return (
              <Card key={order._id} className={order.status === "pending" ? "border-yellow-200 bg-yellow-50" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Order #{order._id.slice(-8)}</CardTitle>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Phone className="h-4 w-4" />
                          <span>{order.buyerName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {order.hostel} - Room {order.roomNumber}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      {order.status === "pending" && (
                        <p className="text-xs text-yellow-600 mt-1 font-medium">New Order!</p>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {/* Seller's Items */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Your Items in this Order:</h4>
                      {sellerItems.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm bg-white p-2 rounded border">
                          <span>
                            {item.title} x {item.quantity}
                          </span>
                          <span className="font-medium">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Seller Total */}
                    <div className="border-t pt-2 flex justify-between font-medium">
                      <span>Your Total ({order.paymentMethod})</span>
                      <span className="text-green-600">₹{sellerTotal}</span>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-blue-50 p-3 rounded text-sm">
                      <p className="font-medium text-blue-900">Customer Contact:</p>
                      <p className="text-blue-700">{order.buyerEmail}</p>
                      <p className="text-blue-700">Phone: {order.contactNumber || "Not provided"}</p>
                      <p className="text-blue-700">
                        Delivery: {order.hostel} Hostel, Room {order.roomNumber}
                      </p>
                    </div>

                    {/* Order Actions */}
                    <div className="flex justify-end space-x-2 pt-2">
                      {order.status === "pending" && (
                        <Button
                          onClick={() => updateOrderStatus(order._id, "confirmed")}
                          disabled={updatingOrderId === order._id}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accept Order
                        </Button>
                      )}
                      {order.status === "confirmed" && (
                        <Button
                          onClick={() => updateOrderStatus(order._id, "delivered")}
                          disabled={updatingOrderId === order._id}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Truck className="h-4 w-4 mr-1" />
                          Mark as Delivered
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
