"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Plus, Minus, RefreshCw } from "lucide-react"
import Image from "next/image"
import CheckoutModal from "./CheckoutModal"
import toast from "react-hot-toast"

interface Product {
  _id: string
  title: string
  description: string
  price: number
  quantity: number
  image: string
  hostel: string
  sellerName: string
}

interface CartItem extends Product {
  cartQuantity: number
}

export default function BuyerDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedHostel, setSelectedHostel] = useState<string>("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)

  useEffect(() => {
    if (selectedHostel) {
      fetchProducts()
    }
  }, [selectedHostel])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/products?hostel=${selectedHostel}`)
      const data = await response.json()
      setProducts(data)

      // Update cart quantities if any product is out of stock or has reduced quantity
      setCart((prevCart) => {
        return prevCart
          .map((cartItem) => {
            const updatedProduct = data.find((p) => p._id === cartItem._id)
            if (!updatedProduct) return cartItem // Product no longer exists

            // If product quantity is less than cart quantity, update cart
            if (updatedProduct.quantity < cartItem.cartQuantity) {
              if (updatedProduct.quantity <= 0) {
                toast.error(`${cartItem.title} is now out of stock and removed from cart`)
                return null // Will be filtered out below
              } else {
                toast.warning(`${cartItem.title} quantity reduced to ${updatedProduct.quantity}`)
                return { ...cartItem, cartQuantity: updatedProduct.quantity }
              }
            }
            return cartItem
          })
          .filter(Boolean) // Remove null items
      })
    } catch (error) {
      toast.error("Failed to fetch products")
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product: Product) => {
    const currentCartQuantity = getCartItemQuantity(product._id)

    if (currentCartQuantity >= product.quantity) {
      toast.error("Cannot add more items - insufficient stock")
      return
    }

    setCart((prev) => {
      const existing = prev.find((item) => item._id === product._id)
      if (existing) {
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, cartQuantity: Math.min(item.cartQuantity + 1, product.quantity) }
            : item,
        )
      }
      return [...prev, { ...product, cartQuantity: 1 }]
    })
    toast.success("Added to cart")
  }

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item._id === productId)
      if (existing && existing.cartQuantity > 1) {
        return prev.map((item) => (item._id === productId ? { ...item, cartQuantity: item.cartQuantity - 1 } : item))
      }
      return prev.filter((item) => item._id !== productId)
    })
  }

  const getCartItemQuantity = (productId: string) => {
    return cart.find((item) => item._id === productId)?.cartQuantity || 0
  }

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + item.price * item.cartQuantity, 0)
  }

  const handleOrderSuccess = () => {
    setCart([])
    setShowCheckout(false)
    toast.success("Order placed successfully!")
    fetchProducts() // Refresh products to get updated stock
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Browse Snacks</h2>
          <p className="text-gray-600">Order delicious snacks from your hostel</p>
        </div>

        <div className="flex items-center space-x-2">
          {selectedHostel && (
            <Button onClick={fetchProducts} disabled={loading} variant="outline" size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          )}

          {cart.length > 0 && (
            <Button onClick={() => setShowCheckout(true)} className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4" />
              <span>Cart ({cart.length})</span>
              <Badge variant="secondary">₹{getTotalAmount()}</Badge>
            </Button>
          )}
        </div>
      </div>

      {/* Hostel Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Your Hostel</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedHostel} onValueChange={setSelectedHostel}>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue placeholder="Choose your hostel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Himalaya">Himalaya Hostel</SelectItem>
              <SelectItem value="Janadhar">Janadhar Hostel</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {selectedHostel && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No snacks available in {selectedHostel} hostel</p>
            </div>
          ) : (
            products.map((product) => {
              const cartQuantity = getCartItemQuantity(product._id)
              return (
                <Card key={product._id} className="overflow-hidden">
                  <div className="relative h-48">
                    <Image
                      src={product.image || "/placeholder.svg?height=200&width=300"}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                    <Badge
                      className={`absolute top-2 right-2 ${product.quantity === 0 ? "bg-red-100 text-red-800" : ""}`}
                    >
                      {product.quantity === 0 ? "Out of Stock" : `${product.quantity} left`}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{product.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                    <p className="text-xs text-gray-500 mb-3">by {product.sellerName}</p>

                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-green-600">₹{product.price}</span>

                      {cartQuantity === 0 ? (
                        <Button onClick={() => addToCart(product)} disabled={product.quantity === 0} size="sm">
                          {product.quantity === 0 ? "Out of Stock" : "Add to Cart"}
                        </Button>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Button onClick={() => removeFromCart(product._id)} size="sm" variant="outline">
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="font-medium">{cartQuantity}</span>
                          <Button
                            onClick={() => addToCart(product)}
                            disabled={cartQuantity >= product.quantity}
                            size="sm"
                            variant="outline"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          cart={cart}
          hostel={selectedHostel}
          onClose={() => setShowCheckout(false)}
          onSuccess={handleOrderSuccess}
        />
      )}
    </div>
  )
}
