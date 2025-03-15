import { tool } from 'ai';
import { z } from 'zod';
import { ContactFormValues, createContact, getContactDAOByPhone } from './contact-services';
import { addContactToGroup, getGroupDAO, getLastGroupDAO } from './group-services';
import { addExpense, addPayment, getExpenses, getGroupBalances } from './app-gastos';

export const groupTools= {
    registrarParticipante: tool({
        description: 'Registra un participante en un grupo. Antes de registrar un participante, se debe preguntar al usuario si desea hacerlo. La información del participante está en cada mensaje bien al comienzo, ejemplo: **+59899123456 - JuanPérez:**.',
        parameters: z.object({
            groupId: z.string().describe('El id del grupo'),
            phone: z.string().describe('El teléfono del participante en formato internacional'),
            name: z.string().describe('El nombre del participante'),
        }),
        execute: async ({ groupId, phone, name }) => {
          try {
            const result = await registrarParticipante(groupId, phone, name)
            return result
          } catch (error) {
            console.error("Error al registrar participante:", error)
            return "No se pudo registrar el participante. Es posible que ya esté registrado en el grupo."
          }
        },
    }),
    registrarGasto: tool({
        description: 'Registra un gasto en un grupo. Alguno de los integrantes del grupo puede registrar un gasto aunque haya sido pagado por participante. El gasto debe ser un número y una descripción.',
        parameters: z.object({
            groupId: z.string().describe('El id del grupo'),
            paidById: z.string().describe('El id del participante que pagó el gasto'),
            amount: z.number().describe('El monto del gasto'),            
            description: z.string().describe('La descripción del gasto'),
        }),
        execute: async ({ groupId, paidById, amount, description }) => {
          try {
            await addExpense(groupId, paidById, amount, description)
            const balances= await getGroupBalances(groupId)
            const balancesText= balances.map(balance => `${balance.contact.name}: ${balance.amount}`).join("\n")
            return `Gasto registrado correctamente.\nNuevo estado financiero:\n${balancesText}`
          } catch (error) {
            console.error("Error al registrar gasto:", error)
            return "No se pudo registrar el gasto. Por favor, intente nuevamente."
          }
        },
    }),
    registrarPagoCompensacion: tool({
        description: 'Registra un pago de compensación entre dos participantes. El pago debe ser un número y una descripción.',
        parameters: z.object({
            groupId: z.string().describe('El id del grupo'),
            fromContactId: z.string().describe('El id del participante que paga'),
            toContactId: z.string().describe('El id del participante que recibe el pago'),
            amount: z.number().describe('El monto del pago'),
            note: z.string().describe('Una nota opcional para el pago').optional(),
        }),
        execute: async ({ groupId, fromContactId, toContactId, amount, note }) => {
            try {
                await addPayment(groupId, fromContactId, toContactId, amount, note)
                const balances= await getGroupBalances(groupId)
                const balancesText= balances.map(balance => `${balance.contact.name}: ${balance.amount}`).join("\n")
                return `Pago compensación registrado correctamente.\nNuevo estado financiero:\n${balancesText}`
            } catch (error) {
                console.error("Error al registrar pago de compensación:", error)
                return "No se pudo registrar el pago de compensación. Por favor, intente nuevamente."
            }
        },
    }),
    listarGastos: tool({
        description: 'Lista los últimos gastos de un grupo. No hace falta preguntar al usuario por el limit, utiliza 20, en caso de que el usuario quiera mencione un valor para el limit, utiliza ese valor.',
        parameters: z.object({
            groupId: z.string().describe('El id del grupo'),
            limit: z.number().describe('El número de gastos a listar, por defecto 20').optional(),
        }),
        execute: async ({ groupId, limit=20 }) => {
            const expenses= await getExpenses(groupId, limit)
            return expenses
        },
    })
}

export async function registrarParticipante(groupId: string, phone: string, name: string) {
    try {
        const group= await getGroupDAO(groupId)
        if (!group) return "Grupo no encontrado"
        console.log(`\tregistrarParticipante, group: ${group.name}`)
        
        let contact= await getContactDAOByPhone(phone)
        if (!contact) {
            const contactValues: ContactFormValues= {
                name,
                phone,
                clientId: group.clientId
            }
            contact= await createContact(contactValues)
        }
        console.log(`\tregistrarParticipante: ${contact.name}`)

        try {
            const created= await addContactToGroup(groupId, contact.id)
            console.log(`\tParticipante ${contact.name} registrado en el grupo ${group.name}`)
            return `Participante ${contact.phone} - ${contact.name} registrado en el grupo ${group.name}`
        } catch (error: any) {
            // Si hay un error de restricción única, significa que el contacto ya está en el grupo
            if (error.code === 'P2002') {
                return `El participante ${contact.phone} - ${contact.name} ya está registrado en el grupo ${group.name}`
            }
            throw error; // Re-lanzar otros errores
        }
    } catch (error) {
        console.error("Error en registrarParticipante:", error)
        throw error;
    }
}
  