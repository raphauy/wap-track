import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatCurrency } from "@/lib/utils"
import { Expense } from "@prisma/client"

type ExpenseWithDetails = {
  id: string
  description: string
  amount: number
  paidBy: {
    name: string
    imageUrl?: string | null
  }
  shares: Array<{
    id: string
  }>
}

export function ExpenseCard({ expense }: { expense: ExpenseWithDetails }) {
  const totalAmount = expense.amount
  const shareAmount = totalAmount / expense.shares.length

  return (
    <div className="border rounded-lg p-4 space-y-2 hover:bg-muted/50 transition-colors">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{expense.description}</h3>
        <span className="font-semibold">{formatCurrency(totalAmount)}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Avatar className="h-8 w-8">
          <AvatarImage src={expense.paidBy.imageUrl || undefined} />
          <AvatarFallback>{expense.paidBy.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          Pagado por <span className="font-medium">{expense.paidBy.name}</span>
          <div className="text-xs">
            {expense.shares.length} personas • {formatCurrency(shareAmount)} c/u
          </div>
        </div>
      </div>
    </div>
  )
} 