"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import toast from "react-hot-toast"

interface CartItem {
  _id: string
  title: string
  price: number
  cartQuantity: number
  sellerId: string
}

interface CheckoutModalProps {
  cart: CartItem[]
  hostel: string
  onClose: () => void
  onSuccess: () => void
}

export default function CheckoutModal({ cart, hostel, onClose, onSuccess }: CheckoutModalProps) {
  const [roomNumber, setRoomNumber] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "UPI">("Cash")
  const [loading, setLoading] = useState(false)

  const DELIVERY_CHARGE = 10

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.cartQuantity, 0)
  }

  const getTotalAmount = () => {
    return getSubtotal() + DELIVERY_CHARGE
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!roomNumber.trim()) {
      toast.error("Please enter your room number")
      return
    }

    if (!contactNumber.trim() || contactNumber.length < 10) {
      toast.error("Please enter a valid contact number")
      return
    }

    setLoading(true)

    try {
      const orderData = {
        items: cart.map((item) => ({
          productId: item._id,
          title: item.title,
          price: item.price,
          quantity: item.cartQuantity,
          sellerId: item.sellerId,
        })),
        totalAmount: getSubtotal(), // Backend will add delivery charge
        contactNumber,
        hostel,
        roomNumber: roomNumber.trim(),
        paymentMethod,
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (response.ok) {
        onSuccess()
      } else {
        toast.error(result.error || "Failed to place order")
      }
    } catch (error) {
      toast.error("Error placing order")
      console.error("Order error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Checkout</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Order Summary */}
          <div className="space-y-2">
            <h3 className="font-medium">Order Summary</h3>
            {cart.map((item) => (
              <div key={item._id} className="flex justify-between text-sm">
                <span>
                  {item.title} x {item.cartQuantity}
                </span>
                <span>₹{item.price * item.cartQuantity}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>₹{getSubtotal()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Delivery Charge</span>
              <span>₹{DELIVERY_CHARGE}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-medium">
              <span>Total</span>
              <span>₹{getTotalAmount()}</span>
            </div>
          </div>

          {/* Delivery Details */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="hostel">Hostel</Label>
              <Input id="hostel" value={hostel} disabled />
            </div>

            <div>
              <Label htmlFor="roomNumber">Room Number *</Label>
              <Input
                id="roomNumber"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g., A-101"
                required
              />
            </div>

            <div>
              <Label htmlFor="contactNumber">Contact Number *</Label>
              <Input
                id="contactNumber"
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="e.g., 9876543210"
                required
              />
            </div>

            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(value: "Cash" | "UPI") => setPaymentMethod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash on Delivery</SelectItem>
                  <SelectItem value="UPI">UPI on Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Placing Order..." : `Place Order - ₹${getTotalAmount()}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
