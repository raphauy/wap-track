"use server"

import { getGroupDAO, getLastGroupDAO } from "@/services/group-services"

export async function getGroupAction(groupId: string) {
  return getGroupDAO(groupId)
}

export async function getLastGroupAction(clientSlug: string) {
  return getLastGroupDAO(clientSlug)
}