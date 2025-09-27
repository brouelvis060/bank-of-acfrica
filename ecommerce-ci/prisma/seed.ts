import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const abidjan = await prisma.city.upsert({
    where: { name: 'Abidjan' },
    update: {},
    create: { name: 'Abidjan', isAbidjan: true },
  });

  const periAnyama = await prisma.city.upsert({
    where: { name: 'Anyama' },
    update: {},
    create: { name: 'Anyama', isPeri: true },
  });
  const periBingerville = await prisma.city.upsert({
    where: { name: 'Bingerville' },
    update: {},
    create: { name: 'Bingerville', isPeri: true },
  });
  const periSongon = await prisma.city.upsert({
    where: { name: 'Songon' },
    update: {},
    create: { name: 'Songon', isPeri: true },
  });

  const communes = [
    'Abobo','Adjamé','Attécoubé','Bingerville','Cocody','Koumassi','Marcory','Plateau','Port-Bouët','Songon','Treichville','Yopougon'
  ];
  for (const name of communes) {
    await prisma.commune.upsert({
      where: { name_cityId: { name, cityId: abidjan.id } },
      update: {},
      create: { name, cityId: abidjan.id },
    });
  }

  // Example products
  const electronics = await prisma.category.upsert({
    where: { name: 'Électronique' },
    update: {},
    create: { name: 'Électronique' },
  });
  const maison = await prisma.category.upsert({
    where: { name: 'Maison' },
    update: {},
    create: { name: 'Maison' },
  });

  const prods = [
    { name: 'Casque Bluetooth', description: 'Casque sans fil haute qualité', price: 25000, stock: 50, categoryId: electronics.id },
    { name: 'Mixeur', description: 'Mixeur de cuisine polyvalent', price: 18000, stock: 30, categoryId: maison.id },
  ];
  for (const p of prods) {
    const exists = await prisma.product.findFirst({ where: { name: p.name } });
    if (!exists) {
      await prisma.product.create({ data: p });
    }
  }

  console.log('Seed completed');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});

