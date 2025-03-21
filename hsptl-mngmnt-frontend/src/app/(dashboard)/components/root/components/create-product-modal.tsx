"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from 'lucide-react'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import Axios from "@/lib/Axios"
import { useRouter } from "next/navigation"
import { useTokenContext } from "@/context/TokenProvider"
import { UseQueryResult } from "@tanstack/react-query"
import useUserData from "@/hooks/use-user-data"
import { User } from "@/types"

const productSchema = z.object({
    name: z.string().min(1, { message: "Product name is required" }),
    price: z.coerce.number().positive({ message: "Price must be a positive number" }),
    stocks: z.coerce.number().int().nonnegative({ message: "Stock must be a non-negative integer" }),
})

type ProductFormValues = z.infer<typeof productSchema>

interface CreateProductModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function CreateProductModal({ isOpen, onClose, onSuccess }: CreateProductModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const router = useRouter();

    const { sessionToken } = useTokenContext()

    const {
        data: user,
        isLoading: userDataLoading,
        error: userDataError,
    }: UseQueryResult<{ data: { user: User } }> = useUserData(
        sessionToken,
        router
    );


    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            price: 0,
            stocks: 0,
        },
    })

    async function onSubmit(data: ProductFormValues) {
        setIsLoading(true)

        try {

            await Axios.post("/api/v1/product/create", {
                ...data,
                account_id: user?.data.user.id,
            })

            toast({
                title: "Product created",
                description: `${data.name} has been added successfully.`,
            })

            form.reset()
            onSuccess()
            onClose()
        } catch (error) {
            console.error("Error creating product:", error)
            toast({
                title: "Error",
                description: "Failed to create product. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Product</DialogTitle>
                    <DialogDescription>Add a new product to your inventory. Click save when you're done.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Product Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter product name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="0.00" step="0.01" min="0" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="stocks"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Stock Quantity</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="0" min="0" step="1" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Product"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
