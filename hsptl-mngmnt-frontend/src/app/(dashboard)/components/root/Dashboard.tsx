"use client"

import { useEffect, useState } from "react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Axios from "@/lib/Axios"
import dayjs from "dayjs"
import { useTokenContext } from "@/context/TokenProvider"
import { UseQueryResult } from "@tanstack/react-query"
import { User } from "@/types"
import useUserData from "@/hooks/use-user-data"
import { useRouter } from "next/navigation"

type Product = {
  id: string
  name: string
  price: number
}

type OrderProduct = {
  id: string
  name: string
  quantity: number
  price: number
}

type Order = {
  id: string
  products: OrderProduct[]
  destination: string
  createdAt: string
}

export default function DashboardAnalytics() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [aiOpen, setAiOpen] = useState(false)
  const [aiResponse, setAiResponse] = useState("")
  const [loading, setLoading] = useState(false)

  const { sessionToken } = useTokenContext()
  const router = useRouter();

  const { data: user }: UseQueryResult<{ data: { user: User } }> = useUserData(
    sessionToken,
    router
  );


  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const [ordersRes, productsRes] = await Promise.all([
      Axios.get("/api/v1/orders/list"),
      Axios.get("/api/v1/product/list"),
    ])

    const ordersData = (ordersRes.data.data || []).map((order: any) => ({
      ...order,
      products: typeof order.products === "string" ? JSON.parse(order.products) : order.products,
    }))

    setOrders(ordersData)
    setProducts(productsRes.data.data || [])
  }

  async function getAiAnalysis() {
    setLoading(true)
    setAiResponse("")

    try {
      const res = await Axios.post("/api/v1/users/prompt", {
        email: user?.data?.user?.email,
        query: "Give me an analysis of my recent orders and shipments.",
      })

      setAiResponse(res.data.result)
    } catch (err) {
      setAiResponse("Something went wrong while fetching AI insights.")
    } finally {
      setLoading(false)
    }
  }

  const totalRevenue = orders.reduce((acc, order) => {
    return acc + order.products.reduce((sum, p) => sum + p.price * p.quantity, 0)
  }, 0)

  const ordersOverTime = Object.entries(
    orders.reduce((acc, order) => {
      const date = dayjs(order.createdAt).format("YYYY-MM-DD")
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([date, count]) => ({ date, count }))

  const revenueOverTime = Object.entries(
    orders.reduce((acc, order) => {
      const date = dayjs(order.createdAt).format("YYYY-MM-DD")
      const total = order.products.reduce((sum, p) => sum + p.price * p.quantity, 0)
      acc[date] = (acc[date] || 0) + total
      return acc
    }, {} as Record<string, number>)
  ).map(([date, revenue]) => ({ date, revenue }))

  const productFrequency: Record<string, { name: string; quantity: number }> = {}
  orders.forEach(order => {
    order.products.forEach(product => {
      if (!productFrequency[product.id]) {
        productFrequency[product.id] = { name: product.name, quantity: 0 }
      }
      productFrequency[product.id].quantity += product.quantity
    })
  })

  const topProducts = Object.entries(productFrequency)
    .sort(([, a], [, b]) => b.quantity - a.quantity)
    .slice(0, 5)
    .map(([id, { name, quantity }]) => ({ name, quantity }))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <Dialog open={aiOpen} onOpenChange={setAiOpen}>
          <DialogTrigger asChild>
            <Button onClick={getAiAnalysis}>Get AI Insights</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>AI Order Analysis</DialogTitle>
              <DialogDescription>
                Insights based on your current orders and shipments.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 whitespace-pre-wrap text-sm">
              {loading ? "Analyzing..." : aiResponse}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Total Orders</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{orders.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Revenue</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">₱{totalRevenue.toFixed(2)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Products</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{products.length}</p></CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <CardHeader><CardTitle>Orders Over Time</CardTitle></CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ordersOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Revenue Over Time</CardTitle></CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#82ca9d" fill="#82ca9d" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Top Products Ordered</CardTitle></CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantity" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
