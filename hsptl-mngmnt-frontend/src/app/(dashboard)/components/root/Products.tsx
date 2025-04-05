"use client"

import { useState, useEffect } from "react"
import { Trash2, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import Axios from "@/lib/Axios"
import { CreateProductModal } from "./components/create-product-modal"
import { DeleteConfirmationModal } from "./components/delete-confirmation-modal"

interface Product {
    id: string
    name: string
    category: string
    status: string
    lastOrder: string
    price?: number
    stocks?: number
}

export default function ProductTablePage() {
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [deleteModalData, setDeleteModalData] = useState<{ isOpen: boolean; id: string; name: string }>(
        {
            isOpen: false,
            id: "",
            name: "",
        }
    )
    const { toast } = useToast()

    useEffect(() => {
        fetchProducts()
    }, [])

    async function fetchProducts() {
        setIsLoading(true)
        try {
            const response = await Axios.get("/api/v1/product/list")
            setProducts(response.data.data)
        } catch (error) {
            console.error("Error fetching products:", error)
            toast({
                title: "Error",
                description: "Failed to load products. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    function handleOpenDeleteModal(id: string, name: string) {
        setDeleteModalData({
            isOpen: true,
            id,
            name,
        })
    }

    function handleCloseDeleteModal() {
        setDeleteModalData({
            isOpen: false,
            id: "",
            name: "",
        })
    }

    return (
        <>
            <div className="flex items-center">
                <h1 className="font-semibold text-lg md:text-2xl">Product Management</h1>
                <Button className="ml-auto" size="sm" onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Product
                </Button>
            </div>

            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Product List</CardTitle>
                    <CardDescription>Manage and view all available products.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product Name</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stocks</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-4">
                                        Loading products...
                                    </TableCell>
                                </TableRow>
                            ) : products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-4">
                                        No products found. Create your first product.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>{product.price}</TableCell>
                                        <TableCell>{product.stocks}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                                                onClick={() => handleOpenDeleteModal(product.id, product.name)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Delete {product.name}</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Modals */}
            <CreateProductModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchProducts}
            />

            <DeleteConfirmationModal
                isOpen={deleteModalData.isOpen}
                onClose={handleCloseDeleteModal}
                onSuccess={fetchProducts}
                itemId={deleteModalData.id}
                itemName={deleteModalData.name}
            />
        </>
    )
}