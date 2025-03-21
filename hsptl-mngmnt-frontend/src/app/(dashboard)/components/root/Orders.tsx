"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    ShoppingCart,
    Plus,
    Search,
    Filter,
    ArrowUpDown,
    FileText,
    Truck,
    CheckCircle,
    Clock,
    AlertCircle,
    Trash2,
    Eye,
} from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import Axios from "@/lib/Axios"
import { ViewOrderModal } from "./components/view-order-modal"
import { DeleteOrderModal } from "./components/delete-order-modal"
import { DeleteInvoiceModal } from "./components/delete-invoice-modal"
import { UpdateInvoiceModal } from "./components/update-invoice-modal"
import { CreateBudgetRequestModal } from "./components/create-budget-modal"
import axios from "axios"
import { useTokenContext } from "@/context/TokenProvider"
import { User } from "@/types"
import useUserData from "@/hooks/use-user-data"
import { UseQueryResult } from "@tanstack/react-query"

// Schema based on the Prisma model
const orderProductSchema = z.object({
    id: z.string().min(1, { message: "Product ID is required" }),
    name: z.string().min(1, { message: "Product name is required" }),
    quantity: z.number().int().min(1, { message: "Quantity must be at least 1" }),
    price: z.number().min(0, { message: "Price must be a positive number" }),
})

const orderFormSchema = z.object({
    account_id: z.string().min(1, { message: "Account ID is required" }),
    destination: z.string().min(1, { message: "Destination is required" }),
    products: z.array(orderProductSchema).min(1, {
        message: "Please add at least one product",
    }),
})

type OrderFormValues = z.infer<typeof orderFormSchema>
type OrderProduct = z.infer<typeof orderProductSchema>

interface Order {
    id: string
    products: OrderProduct[] | string // Could be JSON string or parsed array
    destination: string
    account_id?: string
    createdAt: string
    updatedAt: string
}

// Update the Shipment interface to match the actual shipment model (not certificates)
// Replace the current Shipment interface with this:
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
    status?: string
    account?: any
}

interface BudgetBilling {
    _id: string
    patientName: string
    patientAge: number
    discount?: string
    services: { name: string; cost: number }[]
    medications: { name: string; cost: number }[]
    doctorTax: number
    taxAmount: number
    totalAmount: number
    paymentStatus: string
    createdAt: string
}


export default function OrdersPage() {
    const router = useRouter()

    const { sessionToken } = useTokenContext()

    const {
        data: user,
        isLoading: userDataLoading,
        error: userDataError,
    }: UseQueryResult<{ data: { user: User } }> = useUserData(
        sessionToken,
        router
    );


    const { toast } = useToast()
    const [activeTab, setActiveTab] = useState("list")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [orders, setOrders] = useState<Order[]>([])
    const [selectedProducts, setSelectedProducts] = useState<OrderProduct[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [sortOrder, setSortOrder] = useState("newest")
    const [viewOrderModal, setViewOrderModal] = useState<{ isOpen: boolean; orderId: string | null }>({
        isOpen: false,
        orderId: null,
    })

    const [budgetModalOpen, setBudgetModalOpen] = useState(false)

    // Add this state after the viewOrderModal state
    const [deleteOrderModal, setDeleteOrderModal] = useState<{ isOpen: boolean; orderId: string | null }>({
        isOpen: false,
        orderId: null,
    })

    // State for vendors and products
    const [vendors, setVendors] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])

    // State for shipments
    const [shipments, setShipments] = useState<Shipment[]>([])
    const [isShipmentsLoading, setIsShipmentsLoading] = useState(true)
    const [shipmentSearchTerm, setShipmentSearchTerm] = useState("")
    const [shipmentSortOrder, setShipmentSortOrder] = useState("shipmentId")

    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [isInvoiceLoading, setIsInvoiceLoading] = useState(true)
    const [invoiceSearchTerm, setInvoiceSearchTerm] = useState("")
    const [invoiceSortOrder, setInvoiceSortOrder] = useState("newest")

    const [budgetBillings, setBudgetBillings] = useState<BudgetBilling[]>([])
    const [isBudgetLoading, setIsBudgetLoading] = useState(true)

    const [aiQuery, setAiQuery] = useState("")
    const [aiResponse, setAiResponse] = useState("")
    const [isAiLoading, setIsAiLoading] = useState(false)

    async function autoFetchAiSummary(email: string) {
        if (!email) return

        setIsAiLoading(true)

        try {
            const res = await Axios.post("/prompt", {
                email,
                query: "Summarize my current orders, shipments, and invoices.",
            })

            setAiResponse(res.data.result || "No response from AI.")
        } catch (err) {
            console.error("Auto AI Summary Error:", err)
            setAiResponse("An error occurred while fetching the AI summary.")
        } finally {
            setIsAiLoading(false)
        }
    }


    useEffect(() => {
        if (user?.data?.user?.email) {
            autoFetchAiSummary(user.data.user.email)
        }
    }, [user?.data?.user?.email])



    async function fetchBudgetRequests() {
        setIsBudgetLoading(true)
        try {
            const response = await axios.get("https://backend-finance.nodadogenhospital.com/budget/get-requests")
            setBudgetBillings(response.data.requests || [])
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch budget billings",
                variant: "destructive",
            })
        } finally {
            setIsBudgetLoading(false)
        }
    }

    useEffect(() => {
        fetchBudgetRequests()
    }, [])


    const [updateInvoiceData, setUpdateInvoiceData]: any = useState<{ isOpen: boolean; invoice: Invoice | null }>({
        isOpen: false,
        invoice: null,
    })
    const [deleteInvoiceData, setDeleteInvoiceData]: any = useState<{ isOpen: boolean; id: string; amount: number }>({
        isOpen: false,
        id: "",
        amount: 0,
    })

    const form = useForm<OrderFormValues>({
        resolver: zodResolver(orderFormSchema),
        defaultValues: {
            account_id: "",
            destination: "",
            products: [],
        },
    })

    useEffect(() => {
        fetchOrders()
        fetchVendors()
        fetchProducts()
    }, [])

    // Fetch shipments when the shipments tab is selected
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

    async function fetchOrders() {
        setIsLoading(true)
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
            setOrders([])
        } finally {
            setIsLoading(false)
        }
    }

    // Update the fetchShipments function to use the correct endpoint
    // Replace the current fetchShipments function with this:
    async function fetchShipments() {
        setIsShipmentsLoading(true)
        try {
            const response = await Axios.get("/api/v1/shipment/list")
            setShipments(response.data.data || [])
        } catch (error) {
            console.error("Error fetching shipments:", error)
            toast({
                title: "Error",
                description: "Failed to load shipments. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsShipmentsLoading(false)
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

    function addProduct() {
        const productSelect = document.getElementById("product-select") as HTMLElement
        const quantityInput = document.getElementById("quantity-input") as HTMLInputElement

        // Get the value from the data attribute we set in onValueChange
        const productId = productSelect.getAttribute("data-value")

        if (!productId || !quantityInput.value) {
            toast({
                title: "Error",
                description: "Please select a product and specify quantity",
                variant: "destructive",
            })
            return
        }

        const quantity = Number.parseInt(quantityInput.value)
        const selectedProduct = products.find((p) => (p._id || p.id) === productId)

        if (!selectedProduct) return

        // Check if product already exists in the list
        const existingProductIndex = selectedProducts.findIndex((p) => p.id === productId)

        let updatedProducts: OrderProduct[] = []

        if (existingProductIndex >= 0) {
            // Update existing product quantity
            updatedProducts = [...selectedProducts]
            updatedProducts[existingProductIndex].quantity += quantity
        } else {
            // Add new product
            const newProduct: OrderProduct = {
                id: productId,
                name: selectedProduct.name,
                quantity,
                price: selectedProduct.price || 0,
            }

            updatedProducts = [...selectedProducts, newProduct]
        }

        // Update state and form value with the same new array
        setSelectedProducts(updatedProducts)

        // Important: Update the form value with the new array
        form.setValue("products", updatedProducts)

        // Reset inputs
        const selectTrigger = productSelect.querySelector("[data-state]")
        if (selectTrigger) {
            // Reset the select UI
            selectTrigger.textContent = "Select a product"
        }
        productSelect.removeAttribute("data-value")
        quantityInput.value = "1"
    }

    function removeProduct(index: number) {
        const updatedProducts = [...selectedProducts]
        updatedProducts.splice(index, 1)
        setSelectedProducts(updatedProducts)

        // Update form value
        form.setValue("products", updatedProducts)
    }

    function calculateTotal() {
        return selectedProducts
            .reduce((total, product) => {
                return total + product.price * product.quantity
            }, 0)
            .toFixed(2)
    }

    async function onSubmit(data: OrderFormValues) {
        setIsSubmitting(true)

        try {
            // Set products from the selectedProducts state
            data.products = selectedProducts

            const response = await Axios.post("/api/v1/orders/create", data)

            toast({
                title: "Order created",
                description: "Your order has been created successfully",
            })

            setActiveTab("list")
            setSelectedProducts([])
            form.reset()
            fetchOrders()
        } catch (error) {
            console.error("Error creating order:", error)
            toast({
                title: "Error",
                description: "Failed to create order. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    function getStatusBadge(status: string) {
        switch (status) {
            case "Shipped":
                return (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                        <Truck className="mr-1 h-3 w-3" />
                        {status}
                    </Badge>
                )
            case "Delivered":
                return (
                    <Badge variant="outline" className="bg-green-700/10 text-green-700 border-green-700/20">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        {status}
                    </Badge>
                )
            case "Processing":
                return (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                        <Clock className="mr-1 h-3 w-3" />
                        {status}
                    </Badge>
                )
            case "Pending":
                return (
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                        <Clock className="mr-1 h-3 w-3" />
                        {status}
                    </Badge>
                )
            case "Cancelled":
                return (
                    <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        {status}
                    </Badge>
                )
            default:
                return <Badge variant="outline">{status || "Unknown"}</Badge>
        }
    }

    // Update the getShipmentStatusBadge function to handle certificate statuses
    function getShipmentStatusBadge(status: string) {
        switch (status.toLowerCase()) {
            case "active":
                return (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Active
                    </Badge>
                )
            case "expired":
                return (
                    <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Expired
                    </Badge>
                )
            case "expiring soon":
                return (
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                        <Clock className="mr-1 h-3 w-3" />
                        Expiring Soon
                    </Badge>
                )
            case "pending review":
                return (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending Review
                    </Badge>
                )
            default:
                return (
                    <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">
                        {status}
                    </Badge>
                )
        }
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

    // Filter and sort orders
    const filteredOrders = orders
        .filter(
            (order) =>
                (order.id?.includes(searchTerm) || order.destination?.toLowerCase().includes(searchTerm.toLowerCase())) ??
                false,
        )
        .sort((a, b) => {
            switch (sortOrder) {
                case "newest":
                    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                case "oldest":
                    return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
                default:
                    return 0
            }
        })

    // Update the filteredShipments logic to match the shipment model
    // Replace the current filteredShipments definition with this:
    const filteredShipments = shipments
        .filter(
            (shipment) =>
                shipment.id?.includes(shipmentSearchTerm) ||
                shipment.destination?.toLowerCase().includes(shipmentSearchTerm.toLowerCase()) ||
                shipment.description?.toLowerCase().includes(shipmentSearchTerm.toLowerCase()),
        )
        .sort((a, b) => {
            if (shipmentSortOrder === "destination") {
                return a.destination.localeCompare(b.destination)
            } else if (shipmentSortOrder === "startDate") {
                return new Date(a.start).getTime() - new Date(b.start).getTime()
            } else {
                // Default sort by ID
                return a.id.localeCompare(b.id)
            }
        })

    // Add function to fetch vendors
    async function fetchVendors() {
        try {
            const response = await Axios.get("api/v1/users/list")
            setVendors(response.data.data || [])
        } catch (error) {
            console.error("Error fetching vendors:", error)
            toast({
                title: "Error",
                description: "Failed to load vendors. Please try again.",
                variant: "destructive",
            })
        }
    }

    // Add function to fetch products
    async function fetchProducts() {
        try {
            const response = await Axios.get("/api/v1/product/list")
            setProducts(response.data.data || [])
        } catch (error) {
            console.error("Error fetching products:", error)
            toast({
                title: "Error",
                description: "Failed to load products. Please try again.",
                variant: "destructive",
            })
        }
    }

    // Calculate total for an order
    function calculateOrderTotal(order: Order) {
        if (!order.products || typeof order.products === "string") return "$0.00"

        const total = (order.products as OrderProduct[]).reduce((sum, product) => {
            return sum + product.price * product.quantity
        }, 0)

        return `$${total.toFixed(2)}`
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

    // Add these functions before the return statement
    // Function to open the delete order modal
    function handleDeleteOrder(orderId: string) {
        setDeleteOrderModal({
            isOpen: true,
            orderId,
        })
    }

    // Function to close the delete order modal
    function handleCloseDeleteModal() {
        setDeleteOrderModal({
            isOpen: false,
            orderId: null,
        })
    }

    // Add these new functions for handling shipment actions
    // Add these before the return statement:
    function handleViewShipment(shipment: Shipment) {
        // You can implement a view modal similar to orders
        toast({
            title: "View Shipment",
            description: `Viewing shipment to ${shipment.destination}`,
        })
        // Alternatively, implement a modal similar to the ViewOrderModal
    }

    function handleDeleteShipment(id: string, name: string) {
        // You can implement delete functionality similar to orders
        toast({
            title: "Delete Shipment",
            description: `This would delete ${name}`,
        })
        // Alternatively, implement a modal similar to the DeleteOrderModal
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

    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="font-semibold text-lg md:text-2xl">Order Management</h1>
                <Button onClick={() => setActiveTab("create")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Order
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-4">
                    <TabsTrigger value="list">
                        <FileText className="mr-2 h-4 w-4" />
                        Order List
                    </TabsTrigger>

                    <TabsTrigger value="shipments">
                        <FileText className="mr-2 h-4 w-4" />
                        Shipment
                    </TabsTrigger>

                    <TabsTrigger value="invoices">
                        <FileText className="mr-2 h-4 w-4" />
                        Invoices
                    </TabsTrigger>

                    <TabsTrigger value="budget">
                        <FileText className="mr-2 h-4 w-4" />
                        Budget Request
                    </TabsTrigger>

                    <TabsTrigger value="create">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Create Order
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="list">
                    <Card>
                        <CardHeader>
                            <CardTitle>Orders</CardTitle>
                            <CardDescription>View and manage all purchase orders in the system.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="search"
                                            placeholder="Search orders..."
                                            className="pl-8 w-[250px]"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Button variant="outline" size="sm">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Filter
                                    </Button>
                                </div>
                                <Select value={sortOrder} onValueChange={setSortOrder}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="newest">Newest first</SelectItem>
                                        <SelectItem value="oldest">Oldest first</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            <div className="flex items-center">
                                                Order ID
                                                <ArrowUpDown className="ml-1 h-3 w-3" />
                                            </div>
                                        </TableHead>
                                        <TableHead>Destination</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Products</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-10">
                                                Loading orders...
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredOrders.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-10">
                                                {searchTerm
                                                    ? "No orders found matching your search"
                                                    : "No orders found. Create your first order."}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredOrders.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-medium">{order.id}</TableCell>
                                                <TableCell>{order.destination}</TableCell>
                                                <TableCell>{formatDate(order.createdAt)}</TableCell>
                                                <TableCell>
                                                    {Array.isArray(order.products) ? `${order.products.length} item(s)` : "N/A"}
                                                </TableCell>
                                                <TableCell>{calculateOrderTotal(order)}</TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-2">
                                                        <Button variant="ghost" size="sm" onClick={() => handleViewOrder(order.id)}>
                                                            <Eye className="mr-1 h-4 w-4" />
                                                            View
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                                                            onClick={() => handleDeleteOrder(order.id)}
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
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="budget">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between w-full">
                                <div>
                                    <CardTitle>Budget Requests</CardTitle>
                                    <CardDescription>View all submitted budget requests.</CardDescription>
                                </div>
                                <Button onClick={() => setBudgetModalOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Budget Request
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isBudgetLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-10">
                                                Loading budget requests...
                                            </TableCell>
                                        </TableRow>
                                    ) : budgetBillings.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-10">
                                                No budget requests found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        budgetBillings.map((request: any) => (
                                            <TableRow key={request._id}>
                                                <TableCell className="font-medium">{request._id.slice(-6)}</TableCell>
                                                <TableCell>{formatDate(request.date)}</TableCell>
                                                <TableCell>{request.department}</TableCell>
                                                <TableCell>{request.budgetType}</TableCell>
                                                <TableCell>{request.description}</TableCell>
                                                <TableCell>${request.amount.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            request.status === "Approved"
                                                                ? "bg-green-500/10 text-green-500 border-green-500/20"
                                                                : request.status === "Rejected"
                                                                    ? "bg-red-500/10 text-red-500 border-red-500/20"
                                                                    : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                                        }
                                                    >
                                                        {request.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>


                <TabsContent value="shipments">
                    <Card>
                        <CardHeader>
                            <CardTitle>Shipments</CardTitle>
                            <CardDescription>View all shipments and their current status.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="search"
                                            placeholder="Search shipments..."
                                            className="pl-8 w-[250px]"
                                            value={shipmentSearchTerm}
                                            onChange={(e) => setShipmentSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Button variant="outline" size="sm">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Filter
                                    </Button>
                                </div>
                                <Select value={shipmentSortOrder} onValueChange={setShipmentSortOrder}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="shipmentId">Shipment ID</SelectItem>
                                        <SelectItem value="destination">Destination</SelectItem>
                                        <SelectItem value="startDate">Start Date</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Destination</TableHead>
                                        <TableHead>Start Date</TableHead>
                                        <TableHead>End Date</TableHead>
                                        <TableHead>Description</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isShipmentsLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-10">
                                                Loading shipments...
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredShipments.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-10">
                                                {shipmentSearchTerm ? "No shipments found matching your search" : "No shipments found."}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredShipments.map((shipment) => (
                                            <TableRow key={shipment.id}>
                                                <TableCell className="font-medium">{shipment.id}</TableCell>
                                                <TableCell>{shipment.destination}</TableCell>
                                                <TableCell>{formatDate(shipment.start)}</TableCell>
                                                <TableCell>{formatDate(shipment.end)}</TableCell>
                                                <TableCell>{shipment.description}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="invoices">
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoices</CardTitle>
                            <CardDescription>View and manage all invoices in the system.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="search"
                                            placeholder="Search invoices..."
                                            className="pl-8 w-[250px]"
                                            value={invoiceSearchTerm}
                                            onChange={(e) => setInvoiceSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Button variant="outline" size="sm">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Filter
                                    </Button>
                                </div>
                                <Select value={invoiceSortOrder} onValueChange={setInvoiceSortOrder}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="newest">Newest first</SelectItem>
                                        <SelectItem value="oldest">Oldest first</SelectItem>
                                        <SelectItem value="amount">Amount</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice ID</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Vendor</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isInvoiceLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-10">
                                                Loading invoices...
                                            </TableCell>
                                        </TableRow>
                                    ) : invoices.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-10">
                                                {invoiceSearchTerm ? "No invoices found matching your search" : "No invoices found."}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        invoices.map((invoice) => (
                                            <TableRow key={invoice.id}>
                                                <TableCell className="font-medium">{invoice.id}</TableCell>
                                                <TableCell>${invoice.amount}</TableCell>
                                                <TableCell>
                                                    {invoice.account
                                                        ? Array.isArray(invoice.account)
                                                            ? invoice.account.map((data: { name: string }) => data.name).join(", ")
                                                            : invoice.account.name
                                                        : invoice.vendor}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            invoice.status === "Paid"
                                                                ? "bg-green-500/10 text-green-500 border-green-500/20"
                                                                : invoice.status === "Pending"
                                                                    ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                                                    : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                                        }
                                                    >
                                                        {invoice.status || "Processing"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{formatDate(invoice.date)}</TableCell>

                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="create">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create New Order</CardTitle>
                            <CardDescription>Fill in the details below to create a new purchase order.</CardDescription>
                        </CardHeader>
                        <CardContent>
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

                                    <FormField
                                        control={form.control}
                                        name="destination"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Destination</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter delivery destination" {...field} />
                                                </FormControl>
                                                <FormDescription>Specify where the order should be delivered</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div>
                                        <h3 className="text-md font-medium mb-2">Products</h3>
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
                                        {form.formState.errors.products && (
                                            <p className="text-sm font-medium text-destructive mt-2">
                                                {form.formState.errors.products.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex justify-end gap-2">
                                        <Button type="button" variant="outline" onClick={() => setActiveTab("list")}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={isSubmitting || selectedProducts.length === 0}>
                                            {isSubmitting ? "Creating..." : "Create Order"}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <section className="mt-10">
                <Card>
                    <CardHeader>
                        <CardTitle>AI Summary</CardTitle>
                        <CardDescription>
                            Automatically generated summary based on your current orders, shipments, and invoices.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-md p-4 bg-muted min-h-[120px]">
                            {isAiLoading ? (
                                <p className="italic text-muted-foreground">Analyzing your data...</p>
                            ) : (
                                <p className="whitespace-pre-line">{aiResponse}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </section>


            <CreateBudgetRequestModal
                isOpen={budgetModalOpen}
                onClose={() => setBudgetModalOpen(false)}
                onSuccess={fetchBudgetRequests}
            />


            {/* View Order Modal */}
            <ViewOrderModal isOpen={viewOrderModal.isOpen} onClose={handleCloseViewModal} orderId={viewOrderModal.orderId} />
            {/* Delete Order Confirmation Modal */}
            <DeleteOrderModal
                isOpen={deleteOrderModal.isOpen}
                onClose={handleCloseDeleteModal}
                onSuccess={fetchOrders}
                orderId={deleteOrderModal.orderId}
            />

            {/* Invoice Modals */}
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

