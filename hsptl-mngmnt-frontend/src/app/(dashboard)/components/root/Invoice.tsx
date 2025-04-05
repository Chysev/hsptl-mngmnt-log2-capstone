"use client"

import { useState, useEffect } from "react"
import { Trash2, Plus, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Axios from "@/lib/Axios"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import useUserData from "@/hooks/use-user-data";
import { useTokenContext } from "@/context/TokenProvider"
import { useRouter } from "next/navigation"
import { ViewOrderModal } from "./components/view-order-modal"


const orderProductSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    quantity: z.number().min(1),
    price: z.number().min(0)
})

const orderFormSchema = z.object({
    account_id: z.string().min(1),
    destination: z.string().min(1),
    products: z.array(orderProductSchema).min(1)
})

type OrderFormValues = z.infer<typeof orderFormSchema>
type OrderProduct = z.infer<typeof orderProductSchema>

type Order = {
    id: string
    products: OrderProduct[]
    destination: string
    createdAt: string
}

type User = {
    role: "STAFF" | "VENDOR"
}

export default function Invoice() {
    const [orders, setOrders] = useState<Order[]>([])
    const [products, setProducts] = useState<any[]>([])
    const [vendors, setVendors] = useState<any[]>([])
    const [selectedProducts, setSelectedProducts] = useState<OrderProduct[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { toast } = useToast()
    const { sessionToken } = useTokenContext()
    const router = useRouter();
    const [viewOrderModal, setViewOrderModal] = useState<{ isOpen: boolean; orderId: string | null }>({
        isOpen: false,
        orderId: null,
    })

    function handleViewOrder(orderId: string) {
        setViewOrderModal({
            isOpen: true,
            orderId,
        })
    }

    // Function to close the view order modal
    function handleCloseViewModal() {
        setViewOrderModal({
            isOpen: false,
            orderId: null,
        })
    }

    const form = useForm<OrderFormValues>({
        resolver: zodResolver(orderFormSchema),
        defaultValues: { account_id: "", destination: "", products: [] },
    })

    function calculateTotal() {
        return selectedProducts
            .reduce((total, product) => {
                return total + product.price * product.quantity
            }, 0)
            .toFixed(2)
    }


    const { data: user }: UseQueryResult<{ data: { user: User } }> = useUserData(
        sessionToken,
        router
    );

    useEffect(() => {
        fetchOrders()
        fetchProducts()
        fetchVendors()
    }, [])


    async function fetchOrders() {
        const res = await Axios.get("/api/v1/orders/list")
        const orders = res.data.data.map((order: any) => {
            if (typeof order.products === "string") {
                order.products = JSON.parse(order.products)
            }
            return order
        })
        setOrders(orders)
    }

    async function fetchProducts() {
        const res = await Axios.get("/api/v1/product/list")
        setProducts(res.data.data || [])
    }

    async function fetchVendors() {
        const res = await Axios.get("/api/v1/users/list")
        const vendorOnly = (res.data.data || []).filter((user: any) => user.role === "VENDOR")
        setVendors(vendorOnly)

    }



    function addProduct() {
        const select = document.getElementById("product-select")
        const quantity = +(document.getElementById("quantity-input") as HTMLInputElement).value
        const productId = select?.getAttribute("data-value") || ""
        const selected = products.find(p => (p._id || p.id) === productId)
        if (!selected || !quantity) return

        const existing = selectedProducts.find(p => p.id === productId)
        let newList = [...selectedProducts]
        if (existing) {
            newList = newList.map(p => p.id === productId ? { ...p, quantity: p.quantity + quantity } : p)
        } else {
            newList.push({ id: productId, name: selected.name, quantity, price: selected.price })
        }
        setSelectedProducts(newList)
        form.setValue("products", newList)
    }

    function removeProduct(index: number) {
        const list = [...selectedProducts]
        list.splice(index, 1)
        setSelectedProducts(list)
        form.setValue("products", list)
    }

    async function onSubmit(data: OrderFormValues) {
        setIsSubmitting(true)
        try {
            await Axios.post("/api/v1/orders/create", data)
            toast({ title: "Success", description: "Order created." })
            fetchOrders()
            setIsCreateOrderModalOpen(false)
            form.reset()
            setSelectedProducts([])
        } catch {
            toast({ title: "Error", description: "Failed to create order.", variant: "destructive" })
        } finally {
            setIsSubmitting(false)
        }
    }

    const filteredOrders = orders.filter(o =>
        o.id.includes(searchTerm) || o.destination.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <>


            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Invoice</CardTitle>
                    <CardDescription>Manage and view all purchase orders.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Input
                        className="mb-4 w-full md:w-96"
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Destination</TableHead>
                                <TableHead>Products</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-4">
                                        No orders found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredOrders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell>{order.id}</TableCell>
                                        <TableCell>{order.destination}</TableCell>
                                        <TableCell>{order.products.length}</TableCell>
                                        <TableCell>{`$${order.products.reduce((acc, p) => acc + p.price * p.quantity, 0).toFixed(2)}`}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" onClick={() => handleViewOrder(order.id)}>
                                                <Eye className="mr-1 h-4 w-4" />
                                                View
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isCreateOrderModalOpen} onOpenChange={setIsCreateOrderModalOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Create New Order</DialogTitle>
                        <DialogDescription>Fill in the details to create an order.</DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="account_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vendor Account</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a vendor" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {vendors.length === 0 ? (
                                                    <SelectItem value="loading" disabled>
                                                        Loading vendors...
                                                    </SelectItem>
                                                ) : (
                                                    vendors.map((vendor) => (
                                                        <SelectItem key={vendor._id || vendor.id} value={vendor._id || vendor.id}>
                                                            {vendor.name || vendor.username || vendor.email}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField name="destination" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Destination</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            {/* <div>
                                <div className="flex gap-2 mb-2">
                                    <Select onValueChange={v => document.getElementById("product-select")?.setAttribute("data-value", v)}>
                                        <SelectTrigger id="product-select"><SelectValue placeholder="Select product" /></SelectTrigger>
                                        <SelectContent>
                                            {products.map(p => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Input id="quantity-input" type="number" min="1" defaultValue="1" className="w-24" />
                                    <Button type="button" onClick={addProduct}>Add</Button>
                                </div>

                                {selectedProducts.map((p, idx) => (
                                    <div key={idx} className="flex justify-between items-center border p-2 mb-2">
                                        <span>{p.name} × {p.quantity}</span>
                                        <div className="flex gap-2">
                                            <span>${(p.quantity * p.price).toFixed(2)}</span>
                                            <Button size="icon" variant="ghost" onClick={() => removeProduct(idx)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div> */}

                            <div className="flex items-end gap-2 mb-4">
                                <div className="flex-1">
                                    <label htmlFor="product-select" className="text-sm font-medium block mb-2">
                                        Product
                                    </label>
                                    <Select
                                        onValueChange={(value) => {
                                            // Store the selected product ID in a data attribute on the element
                                            const selectElement = document.getElementById("product-select")
                                            if (selectElement) {
                                                selectElement.setAttribute("data-value", value)
                                            }
                                        }}
                                    >
                                        <SelectTrigger id="product-select">
                                            <SelectValue placeholder="Select a product" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products.length === 0 ? (
                                                <SelectItem value="loading" disabled>
                                                    Loading products...
                                                </SelectItem>
                                            ) : (
                                                products.map((product) => (
                                                    <SelectItem key={product._id || product.id} value={product._id || product.id}>
                                                        {product.name} (${product.price?.toFixed(2) || "0.00"})
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-24">
                                    <label htmlFor="quantity-input" className="text-sm font-medium block mb-2">
                                        Quantity
                                    </label>
                                    <Input id="quantity-input" type="number" min="1" defaultValue="1" />
                                </div>
                                <Button type="button" onClick={addProduct} className="mb-0.5">
                                    Add
                                </Button>
                            </div>

                            {selectedProducts.length === 0 ? (
                                <div className="text-center py-8 border rounded-md border-dashed">
                                    <p className="text-muted-foreground">No products added yet</p>
                                </div>
                            ) : (
                                <div className="border rounded-md">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product</TableHead>
                                                <TableHead className="text-right">Quantity</TableHead>
                                                <TableHead className="text-right">Price</TableHead>
                                                <TableHead className="text-right">Subtotal</TableHead>
                                                <TableHead></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedProducts.map((product, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{product.name}</TableCell>
                                                    <TableCell className="text-right">{product.quantity}</TableCell>
                                                    <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                                                    <TableCell className="text-right">
                                                        ${(product.price * product.quantity).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                                                            onClick={() => removeProduct(index)}
                                                        >
                                                            <span className="sr-only">Remove</span>
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="24"
                                                                height="24"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                className="h-4 w-4"
                                                            >
                                                                <path d="M18 6 6 18" />
                                                                <path d="m6 6 12 12" />
                                                            </svg>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-right font-medium">
                                                    Total:
                                                </TableCell>
                                                <TableCell className="text-right font-bold">${calculateTotal()}</TableCell>
                                                <TableCell></TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            )}

                            <div className="text-right">
                                <Button type="submit" disabled={isSubmitting || selectedProducts.length === 0}>
                                    {isSubmitting ? "Creating..." : "Create Order"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <ViewOrderModal isOpen={viewOrderModal.isOpen} onClose={handleCloseViewModal} orderId={viewOrderModal.orderId} />

        </>
    )
}
