import { Button } from "@/components/ui/button"
import { deleteUser, getAllUsers, updateUser } from "@/lib/supabase/service" // Updated import path
import { Shell } from "@/components/ui/shell"
import UserForm from "@/components/dashboard/user-form"
import { useEffect, useState } from 'react'
import { User } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Add } from "lucide-react"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userSchema } from "@/lib/validation"
import { ZodType } from 'zod'
import { DataTable } from "@/components/ui/table"
import { columns } from "./columns"
import { useRouter } from "next/navigation"


const ITEMS_PER_PAGE = 10

interface Props {
}

const AdminSettingsPage = () => {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const { toast } = useToast()
    const router = useRouter()

    const form = useForm<ZodType<User>>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            id: '',
            name: "",
            email: "",
            role: "USER",
            createdAt: new Date(),
            updatedAt: new Date()
        },
        mode: "onChange"
    })

    async function fetchUsers() {
        setLoading(true)
        try {
            const fetchedUsers = await getAllUsers()
            setUsers(fetchedUsers)
        } catch (error) {
            console.error("Failed to fetch data:", JSON.stringify(error, null, 2));
            toast({
                title: "Houve um problema",
                description: "Falha ao buscar usuários",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [toast])

    const onCreate = async (data: User) => {
        //TODO: save to supabase
        toast({
            title: "Usuário Criado com sucesso!",
            description: "",
        })
    }

    const onUpdate = async (data: User) => {
        try {
            await updateUser(data);
            toast({
                title: "Usuário atualizado com sucesso!",
                description: "",
            })
            fetchUsers()
        } catch (error) {
            toast({
                title: "Houve um problema.",
                description: "Falha ao atualizar usuário.",
                variant: "destructive",
            })
        }
    }

    const onDelete = async (id: string) => {
        try {
            await deleteUser(id);
            toast({
                title: "Usuário deletado com sucesso!",
                description: "",
            })
            fetchUsers()
            router.refresh()
        } catch (error) {
            toast({
                title: "Houve um problema.",
                description: "Falha ao deletar usuário.",
                variant: "destructive",
            })
        }
    }

    return (
        <Shell>
            <div className="flex flex-col gap-4">
                <Button onClick={() => form.reset()} disabled={loading}>
                    <Add className="mr-2 h-4 w-4" />
                    Adicionar Usuário
                </Button>
                <UserForm form={form} onSubmit={onCreate} onUpdate={onUpdate} onDelete={onDelete} users={users} loading={loading} />
                <div>
                    <DataTable columns={columns} data={users} />
                </div>
            </div>
        </Shell>
    )
}

export default AdminSettingsPage