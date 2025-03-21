"use client"

import { useState, useEffect } from "react"
import { MapPin, Package, User, Clock } from "lucide-react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Axios from "@/lib/Axios"

interface OrderProduct {
    id: string
    name: string
    quantity: number
    price: number
}

interface Order {
    id: string
    products: OrderProduct[] | string
    destination: string
    account_id?: string
    createdAt: string
    updatedAt: string
}

interface ViewOrderModalProps {
    isOpen: boolean
    onClose: () => void
    orderId: string | null
}

export function ViewOrderModal({ isOpen, onClose, orderId }: ViewOrderModalProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [order, setOrder] = useState<Order | null>(null)
    const [vendor, setVendor] = useState<any>(null)

    useEffect(() => {
        if (isOpen && orderId) {
            fetchOrderDetails(orderId)
        }
    }, [isOpen, orderId])

    async function fetchOrderDetails(id: string) {
        setIsLoading(true)
        try {
            const response = await Axios.get("/api/v1/orders/list")
            const orders = response.data.data || []
            const foundOrder = orders.find((o: any) => o.id === id)

            if (foundOrder) {
                // Parse products if it's a string
                if (typeof foundOrder.products === "string") {
                    try {
                        foundOrder.products = JSON.parse(foundOrder.products)
                    } catch (e) {
                        console.error("Error parsing products JSON:", e)
                        foundOrder.products = []
                    }
                }

                setOrder(foundOrder)

                // If there's an account_id, fetch the vendor details
                if (foundOrder.account_id) {
                    fetchVendorDetails(foundOrder.account_id)
                }
            }
        } catch (error) {
            console.error("Error fetching order details:", error)
        } finally {
            setIsLoading(false)
        }
    }

    async function fetchVendorDetails(accountId: string) {
        try {
            // In a real app, you would have an API endpoint to get a single vendor
            const response = await Axios.get("/api/v1/users/list")
            const vendors = response.data.data || []
            const foundVendor = vendors.find((v: any) => (v._id || v.id) === accountId)

            if (foundVendor) {
                setVendor(foundVendor)
            }
        } catch (error) {
            console.error("Error fetching vendor details:", error)
        }
    }

    function formatDate(dateString: string) {
        if (!dateString) return "N/A"
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    function calculateTotal() {
        if (!order || !Array.isArray(order.products)) return "$0.00"

        const total = order.products.reduce((sum, product) => {
            return sum + product.price * product.quantity
        }, 0)

        return `$${total.toFixed(2)}`
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Order Details</DialogTitle>
                    <DialogDescription>View the complete details of this order.</DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="py-8 text-center">Loading order details...</div>
                ) : !order ? (
                    <div className="py-8 text-center">Order not found</div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium flex items-center">
                                    <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                                    Order ID
                                </h3>
                                <p className="mt-1">{order.id}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium flex items-center">
                                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                    Order Date
                                </h3>
                                <p className="mt-1">{formatDate(order.createdAt)}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium flex items-center">
                                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                                    Destination
                                </h3>
                                <p className="mt-1">{order.destination}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium flex items-center">
                                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                                    Vendor
                                </h3>
                                <p className="mt-1">
                                    {vendor ? vendor.name || vendor.username || vendor.email : order.account_id || "N/A"}
                                </p>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h3 className="text-sm font-medium mb-2">Products</h3>
                            {Array.isArray(order.products) && order.products.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead className="text-right">Quantity</TableHead>
                                            <TableHead className="text-right">Price</TableHead>
                                            <TableHead className="text-right">Subtotal</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {order.products.map((product, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{product.name}</TableCell>
                                                <TableCell className="text-right">{product.quantity}</TableCell>
                                                <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                                                <TableCell className="text-right">${(product.price * product.quantity).toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-right font-medium">
                                                Total:
                                            </TableCell>
                                            <TableCell className="text-right font-bold">{calculateTotal()}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-4 border rounded-md border-dashed">
                                    <p className="text-muted-foreground">No products found for this order</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center">
                            <div>
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                                    Last Updated: {formatDate(order.updatedAt)}
                                </Badge>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

