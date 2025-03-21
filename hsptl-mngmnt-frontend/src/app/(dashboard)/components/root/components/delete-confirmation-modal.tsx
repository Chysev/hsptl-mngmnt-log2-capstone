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
import { useToast } from "@/components/ui/use-toast"
import Axios from "@/lib/Axios"

interface DeleteConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    itemId: string
    itemName: string
}

export function DeleteConfirmationModal({
    isOpen,
    onClose,
    onSuccess,
    itemId,
    itemName,
}: DeleteConfirmationModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    async function handleDelete() {
        setIsLoading(true)

        try {
            await Axios.delete(`/api/v1/product/delete/${itemId}`)

            toast({
                title: "Product deleted",
                description: `${itemName} has been deleted successfully.`,
            })

            onSuccess()
            onClose()
        } catch (error) {
            console.error("Error deleting product:", error)
            toast({
                title: "Error",
                description: "Failed to delete product. Please try again.",
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
                        This will permanently delete <span className="font-medium">{itemName}</span>. This action cannot be undone.
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

