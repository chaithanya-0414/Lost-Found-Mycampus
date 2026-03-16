const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create/Find a test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'preview@test.com' },
    update: {},
    create: {
      email: 'preview@test.com',
      name: 'Preview User',
      passwordHash: hashedPassword,
      role: 'student',
    },
  });

  console.log(`Using user: ${user.email}`);

  // 2. Define item templates
  const categories = ['jewelry', 'documents', 'personal', 'electronics', 'books', 'clothing'];
  const statuses = ['lost', 'found'];
  
  const itemTemplates = [
    { title: 'Gold Chain with Pendant', category: 'jewelry', description: 'A delicate 22k gold chain with a small heart pendant. Lost near the gym.' },
    { title: 'Aadhar Card - Rajesh Kumar', category: 'documents', description: 'Government ID card found in the library reading room.' },
    { title: 'Black Nike Backpack', category: 'personal', description: 'Contains some textbooks and a water bottle. Left in the cafeteria.' },
    { title: 'Blue Dell Laptop Bag', category: 'personal', description: 'Found near the computer lab entrance.' },
    { title: 'iPhone 13 Pro (Sierra Blue)', category: 'electronics', description: 'Lost in the auditorium during the seminar.' },
    { title: 'Silver Casio Watch', category: 'jewelry', description: 'Found in the sports complex washroom.' },
    { title: 'Calculator - Casio fx-991EX', category: 'electronics', description: 'Left in the Exam Hall C.' },
    { title: 'Voter ID Card', category: 'documents', description: 'Found in the parking lot near Gate 2.' },
    { title: 'Red Adidas Cap', category: 'clothing', description: 'Lost on the football ground.' },
    { title: 'Algorithms Textbook (CLRS)', category: 'books', description: 'Found on the 3rd bench of Room 101.' },
    { title: 'Ray-Ban Sunglasses', category: 'personal', description: 'Left in the student lounge.' },
    { title: 'Pan Card - Anitha S.', category: 'documents', description: 'Found near the admin office.' },
    { title: 'Boat Enco Buds', category: 'electronics', description: 'Lost one earbud near the fountain.' },
    { title: 'White Linen Shirt', category: 'clothing', description: 'Found in the changing room of the auditorium.' },
    { title: 'Keys with BMW Keychain', category: 'personal', description: 'Found near the staff parking.' },
  ];

  const locations = [
    { name: 'Central Library', lat: 12.9716, lng: 77.5946 },
    { name: 'Main Cafeteria', lat: 12.9720, lng: 77.5950 },
    { name: 'Engineering Block A', lat: 12.9710, lng: 77.5930 },
    { name: 'Sports Complex', lat: 12.9730, lng: 77.5960 },
    { name: 'Main Auditorium', lat: 12.9715, lng: 77.5955 },
    { name: 'Parking Lot 1', lat: 12.9705, lng: 77.5925 },
    { name: 'Admin Block', lat: 12.9725, lng: 77.5940 },
  ];

  // 3. Generate 50 items
  const itemsToCreate = [];
  for (let i = 0; i < 50; i++) {
    const template = itemTemplates[i % itemTemplates.length];
    const location = locations[i % locations.length];
    
    // Add some random variation to title and description
    const titleSuffix = i > itemTemplates.length ? ` #${Math.floor(i/itemTemplates.length)}` : '';
    
    itemsToCreate.push({
      title: template.title + titleSuffix,
      description: template.description,
      category: template.category,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      userId: user.id,
      contactPhone: '+91 98765 43210',
      location: {
        create: {
          latitude: location.lat + (Math.random() - 0.5) * 0.001,
          longitude: location.lng + (Math.random() - 0.5) * 0.001,
          placeName: location.name,
        }
      }
    });
  }

  // 4. Insert items
  // Note: We can't use createMany with nested creates in Prisma for SQLite/MySQL easily without loops or specific logic.
  // We'll loop through and create them.
  for (const itemData of itemsToCreate) {
    await prisma.item.create({
      data: itemData
    });
  }

  console.log('Successfully seeded 50 items!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
