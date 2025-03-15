import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { GroupDAO } from "./group-services";

export async function getGastosContext(group: GroupDAO) {

    const appName= group.app?.name
    console.log("appName: ", appName)
    if (appName !== "Gastos") {
        return ""
    }

    let groupContext= "Estado financiero o saldos de los participantes del grupo:\n"

    const balances= await getGroupBalances(group.id)
    balances.forEach(balance => {
      groupContext+= `- ${balance.contact.name}: ${balance.amount}\n`
    })

    return groupContext  
  }
  
  

/**
 * Registra un nuevo gasto en el grupo y actualiza los saldos de todos los participantes
 */
export async function addExpense(groupId: string, paidById: string, amount: number, description: string) {
  // Usamos una transacción para asegurar que todas las operaciones se completen o ninguna
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // 1. Obtener todos los contactos del grupo
    const groupContacts = await tx.groupContact.findMany({
      where: { groupId },
      select: { contactId: true },
    });

    if (groupContacts.length === 0) {
      throw new Error("El grupo no tiene contactos");
    }

    // 2. Calcular la parte que le corresponde a cada participante
    const shareAmount = amount / groupContacts.length;

    // 3. Crear el registro del gasto
    const expense = await tx.expense.create({
      data: {
        description,
        amount,
        groupId,
        paidById,
      },
    });

    // 4. Crear los registros de ExpenseShare para cada participante
    for (const { contactId } of groupContacts) {
      await tx.expenseShare.create({
        data: {
          expenseId: expense.id,
          contactId,
          amount: shareAmount,
        },
      });

      // 5. Actualizar o crear el balance para cada contacto
      const existingBalance = await tx.balance.findUnique({
        where: {
          contactId_groupId: {
            contactId,
            groupId,
          },
        },
      });

      if (existingBalance) {
        // Si el contacto es quien pagó, suma (amount - shareAmount)
        // Si no, resta shareAmount
        const balanceAdjustment = contactId === paidById 
          ? amount - shareAmount  // El que pagó recibe lo que pagó por otros
          : -shareAmount;         // Los demás deben su parte

        await tx.balance.update({
          where: { id: existingBalance.id },
          data: { amount: existingBalance.amount + balanceAdjustment },
        });
      } else {
        // Si no existe balance, lo creamos
        const initialAmount = contactId === paidById 
          ? amount - shareAmount 
          : -shareAmount;

        await tx.balance.create({
          data: {
            contactId,
            groupId,
            amount: initialAmount,
          },
        });
      }
    }

    return expense;
  });
}

/**
 * Registra un pago de compensación entre dos contactos y actualiza sus saldos
 */
export async function addPayment(groupId: string, fromContactId: string, toContactId: string, amount: number, note?: string) {
  // Usamos una transacción para asegurar que todas las operaciones se completen o ninguna
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // 1. Verificar que ambos contactos pertenecen al grupo
    const fromContactInGroup = await tx.groupContact.findUnique({
      where: {
        groupId_contactId: {
          groupId,
          contactId: fromContactId,
        },
      },
    });

    const toContactInGroup = await tx.groupContact.findUnique({
      where: {
        groupId_contactId: {
          groupId,
          contactId: toContactId,
        },
      },
    });

    if (!fromContactInGroup || !toContactInGroup) {
      throw new Error("Uno o ambos contactos no pertenecen al grupo");
    }

    // 2. Crear el registro de pago
    const payment = await tx.payment.create({
      data: {
        groupId,
        fromContactId,
        toContactId,
        amount,
        note,
      },
    });

    // 3. Actualizar los balances
    // Para quien paga (fromContact): aumenta su balance (reduce su deuda)
    const fromBalance = await tx.balance.findUnique({
      where: {
        contactId_groupId: {
          contactId: fromContactId,
          groupId,
        },
      },
    });

    if (fromBalance) {
      await tx.balance.update({
        where: { id: fromBalance.id },
        data: { amount: fromBalance.amount + amount },
      });
    } else {
      await tx.balance.create({
        data: {
          contactId: fromContactId,
          groupId,
          amount: amount,
        },
      });
    }

    // Para quien recibe (toContact): disminuye su balance (reduce su saldo a favor)
    const toBalance = await tx.balance.findUnique({
      where: {
        contactId_groupId: {
          contactId: toContactId,
          groupId,
        },
      },
    });

    if (toBalance) {
      await tx.balance.update({
        where: { id: toBalance.id },
        data: { amount: toBalance.amount - amount },
      });
    } else {
      await tx.balance.create({
        data: {
          contactId: toContactId,
          groupId,
          amount: -amount,
        },
      });
    }

    return payment;
  });
}

/**
 * Obtiene el saldo actual de un contacto en un grupo específico
 */
export async function getBalance(contactId: string, groupId: string) {
  return await prisma.balance.findUnique({
    where: {
      contactId_groupId: {
        contactId,
        groupId,
      },
    },
  });
}

/**
 * Obtiene todos los saldos de un grupo
 */
export async function getGroupBalances(groupId: string) {
  return await prisma.balance.findMany({
    where: { groupId },
    include: {
      contact: true,
    },
    orderBy: {
      amount: 'desc',
    },
  });
}

export async function getExpenses(groupId: string, limit: number = 20) {
  return await prisma.expense.findMany({
    where: { groupId },
    select: {
      id: true,
      description: true,
      amount: true,
      paidBy: {
        select: {
          name: true,
          imageUrl: true
        }
      },
      shares: {
        select: {
          id: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });
}

