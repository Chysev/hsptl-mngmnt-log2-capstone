"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import Axios from "@/lib/Axios"
import { useToast } from "@/components/ui/use-toast"

interface DeleteOrderModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    orderId: string | null
}

export function DeleteOrderModal({ isOpen, onClose, onSuccess, orderId }: DeleteOrderModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    async function handleDelete() {
        if (!orderId) return

        setIsLoading(true)

        try {
            await Axios.delete(`/api/v1/orders/delete/${orderId}`)

            toast({
                title: "Order deleted",
                description: "Order has been deleted successfully",
            })

            onSuccess()
            onClose()
        } catch (error) {
            console.error("Error deleting order:", error)
            toast({
                title: "Error",
                description: "Failed to delete order. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the order and remove it from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                    <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            "Delete"
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

