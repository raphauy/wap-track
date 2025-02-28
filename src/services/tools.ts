import { tool } from 'ai';
import { z } from 'zod';
import { ContactFormValues, createContact, getContactDAOByPhone } from './contact-services';
import { addContactToGroup, getGroupDAO, getLastGroupDAO } from './group-services';

export const groupTools= {
    registrarContacto: tool({
        description: 'Registra un contacto en un grupo. Antes de registrar un contacto, se debe preguntar al usuario si desea hacerlo. La información del contacto está en cada mensaje bien al comienzo, ejemplo: **+59899123456 - JuanPérez:**.',
        parameters: z.object({
            groupId: z.string().describe('El id del grupo'),
            phone: z.string().describe('El teléfono del contacto en formato internacional'),
            name: z.string().describe('El nombre del contacto'),
        }),
        execute: async ({ groupId, phone, name }) => {
          const result= await registrarContacto(groupId, phone, name)
          return result
        },
    }),
}

export async function registrarContacto(groupId: string, phone: string, name: string) {
    const group= await getGroupDAO(groupId)
    if (!group) return "Grupo no encontrado"
    console.log(`\tregistrarContacto, group: ${group.name}`)
    
    let contact= await getContactDAOByPhone(phone)
    if (!contact) {
        const contactValues: ContactFormValues= {
            name,
            phone,
            clientId: group.clientId
        }
        contact= await createContact(contactValues)
    }
    console.log(`\tregistrarContacto, contact: ${contact.name}`)


    const created= await addContactToGroup(groupId, contact.id)
    if (!created) return "Error al registrar el contacto en el grupo"
    console.log(`\tContacto ${contact.name} registrado en el grupo ${group.name}`)

    return `Contacto ${contact.phone} - ${contact.name} registrado en el grupo ${group.name}`  
  }
  