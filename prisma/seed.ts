import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Crear usuario administrador
  const admin = await prisma.user.upsert({
    where: { email: 'rapha.uy@rapha.uy' },
    update: {},
    create: {
      name: 'Rapha',
      email: 'rapha.uy@rapha.uy',
      role: Role.ADMIN,
    },
  })

  console.log({ admin })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  }) 