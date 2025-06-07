"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit, Trash2 } from "lucide-react"
import Image from "next/image"
import ProductModal from "./ProductModal"
import toast from "react-hot-toast"

interface Product {
  _id: string
  title: string
  description: string
  price: number
  quantity: number
  image: string
  hostel: string
  isActive: boolean
}

export default function SellerDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  useEffect(() => {
    fetchMyProducts()
  }, [])

  const fetchMyProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/user")
      const user = await response.json()

      const productsResponse = await fetch(`/api/products?sellerId=${user._id}`)
      const data = await productsResponse.json()
      setProducts(data)
    } catch (error) {
      toast.error("Failed to fetch products")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setShowModal(true)
  }

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Product deleted successfully")
        fetchMyProducts()
      } else {
        toast.error("Failed to delete product")
      }
    } catch (error) {
      toast.error("Error deleting product")
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingProduct(null)
    fetchMyProducts()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Products</h2>
          <p className="text-gray-600">Manage your snack listings</p>
        </div>

        <Button onClick={() => setShowModal(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </Button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
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
            <p className="text-gray-500">No products yet. Add your first product!</p>
          </div>
        ) : (
          products.map((product) => (
            <Card key={product._id} className={`overflow-hidden ${!product.isActive ? "opacity-50" : ""}`}>
              <div className="relative h-48">
                <Image
                  src={product.image || "/placeholder.svg?height=200&width=300"}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
                {!product.isActive && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-medium">Deleted</span>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1">{product.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                <p className="text-xs text-gray-500 mb-3">{product.hostel} Hostel</p>

                <div className="flex justify-between items-center mb-3">
                  <span className="text-xl font-bold text-green-600">₹{product.price}</span>
                  <span className="text-sm text-gray-500">{product.quantity} available</span>
                </div>

                {product.isActive && (
                  <div className="flex space-x-2">
                    <Button onClick={() => handleEdit(product)} size="sm" variant="outline" className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(product._id)}
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Product Modal */}
      {showModal && <ProductModal product={editingProduct} onClose={handleModalClose} />}
    </div>
  )
}
