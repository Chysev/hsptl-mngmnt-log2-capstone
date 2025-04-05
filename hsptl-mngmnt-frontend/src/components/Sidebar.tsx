"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Package, Home, Users, Truck, FileText, BarChart3, Settings, ListOrdered, ListOrderedIcon, TruckIcon, Pill, ReceiptText, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { useTokenContext } from "@/context/TokenProvider"
import { UseQueryResult } from "@tanstack/react-query"
import { User } from "@/types"
import useUserData from "@/hooks/use-user-data"

const Sidebar = () => {
    const pathname = usePathname()

    const isActive = (path: string) => {
        return pathname === path
    }

    const { sessionToken } = useTokenContext()
    const router = useRouter();


    const { data: user }: UseQueryResult<{ data: { user: User } }> = useUserData(
        sessionToken,
        router
    );

    return (
        <div className="hidden border-r bg-muted/40 lg:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-6">
                    <div className="flex items-center gap-2 font-semibold">
                        <Image src="/NGH_NEW_LOGO.jpg" alt="Logo" width={45} height={45} />
                        <span>Hospital Logistics</span>
                    </div>
                </div>
                <div className="flex-1 overflow-auto py-2">
                    <nav className="grid items-start px-4 text-sm font-medium">
                        {["VENDOR", "ADMIN"].includes(user?.data.user.role as string) && (
                            <Button
                                variant={isActive("/dashboard") ? "secondary" : "ghost"}
                                className="justify-start gap-3 px-3"
                                asChild
                            >
                                <Link href="/dashboard">
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </Link>
                            </Button>
                        )}



                        <Button variant={isActive("/dashboard/orders") ? "secondary" : "ghost"} className="justify-start gap-3 px-3" asChild>
                            <Link href="/dashboard/orders">
                                <ListOrdered className="h-4 w-4" />
                                Orders
                            </Link>
                        </Button>


                        {["VENDOR", "ADMIN"].includes(user?.data.user.role as string) && (
                            <Button
                                variant={isActive("/dashboard/products") ? "secondary" : "ghost"}
                                className="justify-start gap-3 px-3 mt-1"
                                asChild
                            >
                                <Link href="/dashboard/products">
                                    <Pill className="h-4 w-4" />
                                    Products
                                </Link>
                            </Button>
                        )}

                        {["STAFF", "ADMIN"].includes(user?.data?.user?.role as string) && (
                            <Button
                                variant={isActive("/dashboard/budget") ? "secondary" : "ghost"}
                                className="justify-start gap-3 px-3 mt-1"
                                asChild
                            >
                                <Link href="/dashboard/budget">
                                    <Pill className="h-4 w-4" />
                                    Budget Request
                                </Link>
                            </Button>
                        )}



                        <Button
                            variant={isActive("/dashboard/invoice") ? "secondary" : "ghost"}
                            className="justify-start gap-3 px-3 mt-1"
                            asChild
                        >
                            <Link href="/dashboard/invoice">
                                <ReceiptText className="h-4 w-4" />
                                Invoice
                            </Link>
                        </Button>


                        <Button
                            variant={isActive("/vendor") ? "secondary" : "ghost"}
                            className="justify-start gap-3 px-3 mt-1"
                            asChild
                        >
                            <Link href="/dashboard/shipment">
                                <TruckIcon className="h-4 w-4" />
                                Shipment
                            </Link>
                        </Button>



                        {["VENDOR", "ADMIN"].includes(user?.data.user.role as string) && (
                            <Button
                                variant={isActive("/vehicle") ? "secondary" : "ghost"}
                                className="justify-start gap-3 px-3 mt-1"
                                asChild
                            >
                                <Link href="/dashboard/vehicle">
                                    <Truck className="h-4 w-4" />
                                    Vehicle
                                </Link>
                            </Button>
                        )}


                    </nav>
                </div>
                <div className="mt-auto p-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">System Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    <span>All systems operational</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default Sidebar