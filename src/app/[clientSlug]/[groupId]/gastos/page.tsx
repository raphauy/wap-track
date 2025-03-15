import { getExpenses } from "@/services/app-gastos"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { ExpenseCard } from "./expense-card"
import { Suspense } from "react"
import LoadingGastos from "./loading"

type Props = {
  params: Promise<{
    clientSlug: string
    groupId: string
  }>
}

export default async function GastosPage({ params }: Props) {
  const { groupId } = await params
  return (
    <div className="space-y-4 mx-auto min-w-[400px]">
      <p className="text-2xl font-bold text-center">Gastos del Grupo</p>
      
      <Suspense fallback={<LoadingGastos />}>
        <ExpenseList groupId={groupId} />
      </Suspense>
    </div>
  )
}

async function ExpenseList({ groupId }: { groupId: string }) {
  const expenses = await getExpenses(groupId)

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay gastos registrados aún
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {expenses.map((expense) => (
        <ExpenseCard key={expense.id} expense={expense} />
      ))}
    </div>
  )
}
