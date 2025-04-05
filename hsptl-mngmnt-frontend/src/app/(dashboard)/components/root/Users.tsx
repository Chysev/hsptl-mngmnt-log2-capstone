"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import Axios from "@/lib/Axios"

type User = {
  id: string
  name: string
  email: string
  createdAt: string
  document: string
  contract: string
  isVerfied: boolean
  role: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      const res = await Axios.get("/api/v1/users/list")
      setUsers(res.data.data || [])
    } catch {
      toast({ title: "Error", description: "Failed to fetch users", variant: "destructive" })
    }
  }

  async function verifyUser(id: string) {
    try {
      await Axios.patch(`/api/v1/users/update/${id}`, { verified: true })
      toast({ title: "Success", description: "User verified." })
      fetchUsers()
    } catch {
      toast({ title: "Error", description: "Failed to verify user", variant: "destructive" })
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">User Management</h1>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage user accounts and verify their documents.</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            className="mb-4 w-full md:w-96"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Contract</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <a
                        href={user.document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 cursor-pointer underline hover:text-blue-800"
                      >
                        Document
                      </a>
                    </TableCell>
                    <TableCell>
                      <a
                        href={user.contract}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 cursor-pointer underline hover:text-blue-800"
                      >
                        Contract
                      </a>
                    </TableCell>
                    <TableCell>
                      {!user.isVerfied ? (
                        <span className="text-green-600 font-medium">Verified</span>
                      ) : (
                        <Button size="sm" onClick={() => verifyUser(user.id)}>
                          Verify
                        </Button>
                      )}
                    </TableCell>

                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
