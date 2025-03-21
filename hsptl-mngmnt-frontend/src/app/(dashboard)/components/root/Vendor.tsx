"use client"

import { useState, useEffect } from "react"
import { Users, ClipboardList, MessageSquare, CheckCircle2, Trash2, Plus, ExternalLink, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import Axios from "@/lib/Axios"
import { CreateProductModal } from "./components/create-product-modal"
import { DeleteConfirmationModal } from "./components/delete-confirmation-modal"
import { ViewOrderModal } from "./components/view-order-modal"
import { CreateShipmentModal } from "./components/create-shipment-modal"
import { UpdateShipmentModal } from "./components/update-shipment-modal"
import { DeleteShipmentModal } from "./components/delete-shipment-modal"
import { CreateInvoiceModal } from "./components/create-invoice-modal"
import { DeleteInvoiceModal } from "./components/delete-invoice-modal"
import { UpdateInvoiceModal } from "./components/update-invoice-modal"

interface Product {
    id: string
    name: string
    category: string
    status: string
    lastOrder: string
    price?: number
    stocks?: number
}

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

interface Shipment {
    id: string
    destination: string
    start: string
    end: string
    description: string
    vehicle_id?: string
    orders_id?: string[]
    createdAt?: string
    updatedAt?: string
}

interface Invoice {
    id: string
    amount: number
    vendor: string
    date: string
}

export default function VendorPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [orders, setOrders] = useState<Order[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isOrdersLoading, setIsOrdersLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [deleteModalData, setDeleteModalData] = useState<{ isOpen: boolean; id: string; name: string }>({
        isOpen: false,
        id: "",
        name: "",
    })
    const [viewOrderModal, setViewOrderModal] = useState<{ isOpen: boolean; orderId: string | null }>({
        isOpen: false,
        orderId: null,
    })
    const { toast } = useToast()

    const [shipments, setShipments] = useState<Shipment[]>([])
    const [isShipmentsLoading, setIsShipmentsLoading] = useState(true)
    const [createShipmentModalOpen, setCreateShipmentModalOpen] = useState(false)
    const [editShipmentData, setEditShipmentData] = useState<{ isOpen: boolean; shipment: Shipment | null }>({
        isOpen: false,
        shipment: null,
    })
    const [deleteShipmentData, setDeleteShipmentData] = useState<{ isOpen: boolean; id: string; name: string }>({
        isOpen: false,
        id: "",
        name: "",
    })

    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [isInvoiceLoading, setIsInvoiceLoading] = useState(true)
    const [createInvoiceModalOpen, setCreateInvoiceModalOpen] = useState(false)
    const [updateInvoiceData, setUpdateInvoiceData]: any = useState<{ isOpen: boolean; invoice: Invoice | null }>({
        isOpen: false,
        invoice: null,
    })
    const [deleteInvoiceData, setDeleteInvoiceData]: any = useState<{ isOpen: boolean; id: string; amount: number }>({
        isOpen: false,
        id: "",
        amount: 0,
    })

    useEffect(() => {
        fetchProducts()
    }, [])

    // Add a useEffect to fetch orders when the orders tab is selected
    const [activeTab, setActiveTab] = useState("products")

    useEffect(() => {
        if (activeTab === "orders") {
            fetchOrders()
        }
    }, [activeTab])

    useEffect(() => {
        if (activeTab === "shipments") {
            fetchShipments()
        }
    }, [activeTab])

    useEffect(() => {
        if (activeTab === "invoices") {
            fetchInvoices()
        }
    }, [activeTab])

    // Add this useEffect after the other useEffect hooks
    useEffect(() => {
        if (activeTab === "invoices" || createInvoiceModalOpen) {
            fetchVendors()
        }
    }, [activeTab, createInvoiceModalOpen])

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

    // Add function to fetch orders
    async function fetchOrders() {
        setIsOrdersLoading(true)
        try {
            const response = await Axios.get("/api/v1/orders/list")
            const ordersData = response.data.data || []

            // Process orders to ensure products are in the right format
            const processedOrders = ordersData.map((order: any) => {
                // If products is a string (JSON), parse it
                if (typeof order.products === "string") {
                    try {
                        order.products = JSON.parse(order.products)
                    } catch (e) {
                        console.error("Error parsing products JSON:", e)
                        order.products = []
                    }
                }
                return order
            })

            setOrders(processedOrders)
        } catch (error) {
            console.error("Error fetching orders:", error)
            toast({
                title: "Error",
                description: "Failed to load orders. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsOrdersLoading(false)
        }
    }

    async function fetchShipments() {
        setIsShipmentsLoading(true)
        try {
            const response = await Axios.get("/api/v1/shipment/list")
            setShipments(response.data.data || [])
        } catch (error) {
            console.error("Error fetching shipments:", error)
            toast({ title: "Error", description: "Failed to load shipments.", variant: "destructive" })
        } finally {
            setIsShipmentsLoading(false)
        }
    }

    const [vendors, setVendors] = useState<any[]>([])

    async function fetchVendors() {
        try {
            const res = await Axios.get("/api/v1/users/list") // Update endpoint if needed
            setVendors(res.data.data || [])
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to fetch vendors.",
                variant: "destructive",
            })
        }
    }

    async function fetchInvoices() {
        setIsInvoiceLoading(true)
        try {
            const response = await Axios.get("/api/v1/invoice/list")
            setInvoices(response.data.data || [])
        } catch (error) {
            console.error("Error fetching invoices:", error)
            toast({ title: "Error", description: "Failed to load invoices.", variant: "destructive" })
        } finally {
            setIsInvoiceLoading(false)
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

    // Function to open the view order modal
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

    function handleEditShipment(shipment: Shipment) {
        setEditShipmentData({
            isOpen: true,
            shipment,
        })
    }

    function handleCloseEditShipmentModal() {
        setEditShipmentData({
            isOpen: false,
            shipment: null,
        })
    }

    function handleCloseDeleteShipmentModal() {
        setDeleteShipmentData({
            isOpen: false,
            id: "",
            name: "",
        })
    }

    function handleOpenUpdateInvoiceModal(invoice: Invoice) {
        setUpdateInvoiceData({
            isOpen: true,
            invoice,
        })
    }

    function handleCloseUpdateInvoiceModal() {
        setUpdateInvoiceData({
            isOpen: false,
            invoice: null,
        })
    }

    function handleOpenDeleteInvoiceModal(id: string, amount: number) {
        setDeleteInvoiceData({
            isOpen: true,
            id,
            amount,
        })
    }

    function handleCloseDeleteInvoiceModal() {
        setDeleteInvoiceData({
            isOpen: false,
            id: "",
            amount: 0,
        })
    }

    // Format date for display
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

    // Calculate total for an order
    function calculateOrderTotal(order: Order) {
        if (!order.products || typeof order.products === "string") return "$0.00"

        const total = (order.products as OrderProduct[]).reduce((sum, product) => {
            return sum + product.price * product.quantity
        }, 0)

        return `$${total.toFixed(2)}`
    }

    return (
        <>
            <div className="flex items-center">
                <h1 className="font-semibold text-lg md:text-2xl">Vendor Portal</h1>
                <Button className="ml-auto" size="sm">
                    <Users className="mr-2 h-4 w-4" />
                    Add New Vendor
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Vendor Management</CardTitle>
                    <CardDescription>
                        The Vendor Portal is a dedicated platform for suppliers and vendors to interact with the hospital's
                        procurement and logistics teams.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="products" value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid grid-cols-4 w-full">
                            <TabsTrigger value="products">Products</TabsTrigger>
                            <TabsTrigger value="orders">Orders</TabsTrigger>
                            <TabsTrigger value="invoices">Invoices</TabsTrigger>
                            <TabsTrigger value="shipments">Shipments</TabsTrigger>
                        </TabsList>
                        <TabsContent value="products" className="mt-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium">Product List</h3>
                                <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Product
                                </Button>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product Name</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Last Order</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-4">
                                                Loading products...
                                            </TableCell>
                                        </TableRow>
                                    ) : products.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-4">
                                                No products found. Create your first product.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        products.map((product) => (
                                            <TableRow key={product.id}>
                                                <TableCell className="font-medium">{product.name}</TableCell>
                                                <TableCell>{product.category}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            product.status === "Active"
                                                                ? "bg-green-500/10 text-green-500 border-green-500/20"
                                                                : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                                        }
                                                    >
                                                        {product.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{product.lastOrder}</TableCell>
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
                        </TabsContent>
                        <TabsContent value="orders" className="mt-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium">Order Management</h3>
                                <Button size="sm" variant="outline" asChild>
                                    <Link href="/orders">
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        Go to Orders
                                    </Link>
                                </Button>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Destination</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Products</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isOrdersLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-4">
                                                Loading orders...
                                            </TableCell>
                                        </TableRow>
                                    ) : orders.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-4">
                                                No orders found. Create your first order.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        orders.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-medium">{order.id}</TableCell>
                                                <TableCell>{order.destination}</TableCell>
                                                <TableCell>{formatDate(order.createdAt)}</TableCell>
                                                <TableCell>
                                                    {Array.isArray(order.products) ? `${order.products.length} item(s)` : "N/A"}
                                                </TableCell>
                                                <TableCell>{calculateOrderTotal(order)}</TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="sm" onClick={() => handleViewOrder(order.id)}>
                                                        <Eye className="mr-1 h-4 w-4" />
                                                        View
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                            <div className="mt-4 text-center">
                                <Button variant="link" asChild>
                                    <Link href="/orders">View all orders</Link>
                                </Button>
                            </div>
                        </TabsContent>
                        <TabsContent value="invoices" className="mt-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium">Invoice Submission</h3>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        fetchVendors()
                                        setCreateInvoiceModalOpen(true)
                                    }}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Invoice
                                </Button>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice ID</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Vendor</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isInvoiceLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-4">
                                                Loading invoices...
                                            </TableCell>
                                        </TableRow>
                                    ) : invoices.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-4">
                                                No invoices found. Create your first invoice.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        invoices.map((invoice: any) => (
                                            <TableRow key={invoice.id}>
                                                <TableCell className="font-medium">{invoice.id}</TableCell>
                                                <TableCell>{invoice.amount}</TableCell>
                                                <TableCell>{invoice.account.map((data: { name: string }) => data.name)}</TableCell>
                                                <TableCell>{invoice.status}</TableCell>
                                                <TableCell>{formatDate(invoice.date)}</TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-2">
                                                        <Button variant="ghost" size="icon" onClick={() => handleOpenUpdateInvoiceModal(invoice)}>
                                                            <Eye className="h-4 w-4" />
                                                            <span className="sr-only">Edit</span>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-500 hover:text-red-700"
                                                            onClick={() => handleOpenDeleteInvoiceModal(invoice.id, invoice.amount)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span className="sr-only">Delete</span>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TabsContent>
                        <TabsContent value="shipments">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium">Shipment Management</h3>
                                <Button size="sm" onClick={() => setCreateShipmentModalOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Shipment
                                </Button>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Destination</TableHead>
                                        <TableHead>Start Date</TableHead>
                                        <TableHead>End Date</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isShipmentsLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center">
                                                Loading shipments...
                                            </TableCell>
                                        </TableRow>
                                    ) : shipments.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center">
                                                No shipments found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        shipments.map((shipment) => (
                                            <TableRow key={shipment.id}>
                                                <TableCell>{shipment.id}</TableCell>
                                                <TableCell>{shipment.destination}</TableCell>
                                                <TableCell>{formatDate(shipment.start)}</TableCell>
                                                <TableCell>{formatDate(shipment.end)}</TableCell>
                                                <TableCell>{shipment.description}</TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-2">
                                                        <Button variant="ghost" size="icon" onClick={() => handleEditShipment(shipment)}>
                                                            <Eye className="h-4 w-4" />
                                                            <span className="sr-only">Edit</span>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-500 hover:text-red-700"
                                                            onClick={() =>
                                                                setDeleteShipmentData({
                                                                    isOpen: true,
                                                                    id: shipment.id,
                                                                    name: `Shipment to ${shipment.destination}`,
                                                                })
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span className="sr-only">Delete</span>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Vendor Portal Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Streamlined Procurement</CardTitle>
                                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Simplifies the procurement process by providing a centralized platform for all vendor interactions.
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Enhanced Transparency</CardTitle>
                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Improves visibility into the procurement process for both hospital staff and vendors.
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Reduced Errors</CardTitle>
                                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Minimizes manual paperwork and associated errors through digital processing.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
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

            {/* View Order Modal */}
            <ViewOrderModal isOpen={viewOrderModal.isOpen} onClose={handleCloseViewModal} orderId={viewOrderModal.orderId} />

            <CreateShipmentModal
                isOpen={createShipmentModalOpen}
                onClose={() => setCreateShipmentModalOpen(false)}
                onSuccess={fetchShipments}
            />

            <UpdateShipmentModal
                isOpen={editShipmentData.isOpen}
                onClose={handleCloseEditShipmentModal}
                onSuccess={fetchShipments}
                shipment={editShipmentData.shipment}
            />

            <DeleteShipmentModal
                isOpen={deleteShipmentData.isOpen}
                onClose={handleCloseDeleteShipmentModal}
                onSuccess={fetchShipments}
                id={deleteShipmentData.id}
                name={deleteShipmentData.name}
            />

            {/* Invoice Modals */}
            <CreateInvoiceModal
                isOpen={createInvoiceModalOpen}
                onClose={() => setCreateInvoiceModalOpen(false)}
                onSuccess={fetchInvoices}
                vendors={vendors}
            />

            <UpdateInvoiceModal
                isOpen={updateInvoiceData.isOpen}
                onClose={handleCloseUpdateInvoiceModal}
                onSuccess={fetchInvoices}
                invoice={updateInvoiceData.invoice}
            />

            <DeleteInvoiceModal
                isOpen={deleteInvoiceData.isOpen}
                onClose={handleCloseDeleteInvoiceModal}
                onSuccess={fetchInvoices}
                id={deleteInvoiceData.id}
                amount={deleteInvoiceData.amount}
            />
        </>
    )
}

