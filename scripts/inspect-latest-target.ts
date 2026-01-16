
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const target = await prisma.target.findFirst({
    orderBy: { createdAt: 'desc' },
  })
  
  console.log("Latest Target:", target ? { 
    id: target.id, 
    name: target.name, 
    hasImageBase64: !!target.imageBase64,
    imageBase64Length: target.imageBase64?.length
  } : "No targets found")
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
