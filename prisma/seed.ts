import { PrismaClient } from '../node_modules/.prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    // Create Services
    const limpeza = await prisma.service.create({
        data: {
            name: 'Limpeza de Pele Profunda',
            price: 150.00,
            duration: 60,
        },
    })

    const botox = await prisma.service.create({
        data: {
            name: 'Aplicação de Toxina Botulínica',
            price: 900.00,
            duration: 30,
        },
    })

    // Create Professional
    // Create Professional
    const adminName = process.env.ADMIN_NAME || 'Dra. Sara'
    const adminEmail = process.env.ADMIN_EMAIL || 'sara@estetica.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123'
    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    const professional = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            name: adminName,
            password: hashedPassword,
        },
        create: {
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: 'PROFESSIONAL',
        },
    })

    // Create Clients
    const client1 = await prisma.client.create({
        data: {
            name: 'Maria Silva',
            email: 'maria@example.com',
            phone: '11999999999',
        },
    })

    const client2 = await prisma.client.create({
        data: {
            name: 'Joana Darc',
            email: 'joana@example.com',
            phone: '11988888888',
        },
    })

    // Create Appointments
    await prisma.appointment.create({
        data: {
            startTime: new Date(new Date().setHours(10, 0, 0, 0)),
            endTime: new Date(new Date().setHours(11, 0, 0, 0)),
            status: 'CONFIRMED',
            userId: professional.id,
            clientId: client1.id,
            serviceId: limpeza.id,
        },
    })

    await prisma.appointment.create({
        data: {
            startTime: new Date(new Date().setHours(14, 0, 0, 0)),
            endTime: new Date(new Date().setHours(14, 30, 0, 0)),
            status: 'SCHEDULED',
            userId: professional.id,
            clientId: client2.id,
            serviceId: botox.id,
        },
    })

    console.log('Seed completed!')
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
