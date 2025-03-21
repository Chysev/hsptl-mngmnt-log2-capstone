"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Package, Home, Users, Truck, FileText, BarChart3, Settings, ListOrdered } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

const Sidebar = () => {
    const pathname = usePathname()

    const isActive = (path: string) => {
        return pathname === path
    }

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


                        <Button variant={isActive("/") ? "secondary" : "ghost"} className="justify-start gap-3 px-3" asChild>
                            <Link href="/dashboard/orders">
                                <ListOrdered className="h-4 w-4" />
                                Orders
                            </Link>
                        </Button>

                        <Button
                            variant={isActive("/vendor") ? "secondary" : "ghost"}
                            className="justify-start gap-3 px-3 mt-1"
                            asChild
                        >
                            <Link href="/dashboard/vendor">
                                <Users className="h-4 w-4" />
                                Vendor Portal
                            </Link>
                        </Button>
                        <Button
                            variant={isActive("/vehicle") ? "secondary" : "ghost"}
                            className="justify-start gap-3 px-3 mt-1"
                            asChild
                        >
                            <Link href="/dashboard/vehicle">
                                <Truck className="h-4 w-4" />
                                Vehicle Reservation
                                <Badge className="ml-auto flex h-5 w-5 items-center justify-center rounded-full">3</Badge>
                            </Link>
                        </Button>

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