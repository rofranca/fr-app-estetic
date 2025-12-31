import { PrismaClient } from '../node_modules/.prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Check if we have transactions
    const count = await prisma.transaction.count()
    if (count > 0) {
        console.log('Transactions already exist. Skipping...')
        return
    }

    console.log('Seeding transactions...')

    // Create Income
    await prisma.transaction.create({
        data: {
            description: 'Limpeza de Pele - Maria (Pagamento em Dinheiro)',
            amount: 150.00,
            type: 'INCOME',
            status: 'PAID',
        }
    })

    await prisma.transaction.create({
        data: {
            description: 'Botox - Joana',
            amount: 900.00,
            type: 'INCOME',
            status: 'PENDING',
        }
    })

    // Create Expense
    await prisma.transaction.create({
        data: {
            description: 'Compra de Cremes Hidratantes',
            amount: 350.50,
            type: 'EXPENSE',
            status: 'PAID',
        }
    })

    await prisma.transaction.create({
        data: {
            description: 'Conta de Energia',
            amount: 280.00,
            type: 'EXPENSE',
            status: 'PENDING',
        }
    })

    console.log('Transactions seeded!')
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
