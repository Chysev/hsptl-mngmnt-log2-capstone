"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CalendarIcon, DollarSign } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/components/ui/use-toast"
import Axios from "@/lib/Axios"

// Define the form schema
const invoiceFormSchema = z.object({
    account_id: z.string().min(1, { message: "Account ID is required" }),
    amount: z.coerce.number().min(0.01, { message: "Amount must be greater than 0" }),
    status: z.string().min(1, { message: "Status is required" }),
    issueDate: z.date({
        required_error: "Issue date is required",
    }),
})

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>

interface CreateInvoiceModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    vendors: any[]
}

export function CreateInvoiceModal({ isOpen, onClose, onSuccess, vendors }: CreateInvoiceModalProps) {
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Initialize the form
    const form = useForm<InvoiceFormValues>({
        resolver: zodResolver(invoiceFormSchema),
        defaultValues: {
            account_id: "",
            amount: 0,
            status: "Pending",
            issueDate: new Date(),
        },
    })

    // Handle form submission
    async function onSubmit(data: InvoiceFormValues) {
        setIsSubmitting(true)
        try {
            await Axios.post("/api/v1/invoice/create", data)
            toast({
                title: "Invoice created",
                description: "The invoice has been created successfully.",
            })
            form.reset()
            onSuccess()
            onClose()
        } catch (error) {
            console.error("Error creating invoice:", error)
            toast({
                title: "Error",
                description: "Failed to create invoice. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Invoice</DialogTitle>
                    <DialogDescription>Fill in the details below to create a new invoice.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="account_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Staff Account</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a staff" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {vendors.length === 0 ? (
                                                <SelectItem value="loading" disabled>
                                                    Loading staffs...
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
                                    <FormDescription>Select the staff for this invoice</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input type="number" step="0.01" min="0.01" className="pl-8" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormDescription>Enter the invoice amount</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="PENDING">Pending</SelectItem>
                                            <SelectItem value="PAID">Paid</SelectItem>
                                            <SelectItem value="OVERDUE">Overdue</SelectItem>

                                        </SelectContent>
                                    </Select>
                                    <FormDescription>Select the current status of the invoice</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="issueDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Issue Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                                                >
                                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date > new Date()}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription>The date when the invoice was issued</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Creating..." : "Create Invoice"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

