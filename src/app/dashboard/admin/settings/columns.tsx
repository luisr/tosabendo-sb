"use client"

import { ColumnDef } from "@tanstack/react-table"
import { User } from "@/lib/types"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


interface CellActionProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}

const CellAction = ({ user, onEdit, onDelete }: CellActionProps) => {
  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onEdit(user)}>
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="text-red-600">
                Deletar
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso irá deletar permanentemente o usuário.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={() => onDelete(user.id)}>
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// A exportação de colunas agora é uma função que aceita os handlers
export const getColumns = (
    onEdit: (user: User) => void,
    onDelete: (userId: string) => void
): ColumnDef<User>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Função",
    cell: ({ row }) => {
        const role = row.original.role
        if (!role) return null;
        
        const variant = role === "Admin" ? "default" : "secondary"
        return <Badge variant={variant}>{role}</Badge>
    }
  },
  {
    accessorKey: "status",
    header: "Status",
     cell: ({ row }) => {
      const status = row.original.status
      const variant = status === "active" ? "secondary" : "outline"
      const color = status === "active" ? "bg-green-500" : "bg-gray-400"
      
      return <Badge variant={variant} className="capitalize flex items-center gap-2">
         <span className={`h-2 w-2 rounded-full ${color}`}></span>
         {status === 'active' ? 'Ativo' : 'Inativo'}
      </Badge>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction user={row.original} onEdit={onEdit} onDelete={onDelete} />,
  },
]
