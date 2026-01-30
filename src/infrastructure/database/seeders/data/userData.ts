import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export interface UserSeedData {
  name: string;
  email: string;
  username?: string;
  role: UserRole;
  password?: string; // Plain text - will be hashed by seeder
  phone?: string;
  photo?: string;
  active: boolean;
}

// System Administrators
export const ADMINS: UserSeedData[] = [
  {
    name: 'Admin User',
    email: 'admin@safaribooking.com',
    role: 'ADMIN',
    active: true,
  },
  {
    name: 'Sarah Mwangi',
    email: 'sarah.mwangi@safaribooking.com',
    role: 'ADMIN',
    active: true,
  },
];

// Safari Guides
export const GUIDES: UserSeedData[] = [
  // Kenyan Guides
  {
    name: 'Joseph Kimani',
    email: 'joseph.kimani@safariguides.co.ke',
    role: 'GUIDE',
    active: true,
  },
  {
    name: 'Mary Wanjiku',
    email: 'mary.wanjiku@safariguides.co.ke',
    role: 'GUIDE',
    active: true,
  },
  {
    name: 'David Ochieng',
    email: 'david.ochieng@safariguides.co.ke',
    role: 'GUIDE',
    active: true,
  },

  // Tanzanian Guides
  {
    name: 'Juma Rashidi',
    email: 'juma.rashidi@tanzaniasafaris.co.tz',
    role: 'GUIDE',
    active: true,
  },
  {
    name: 'Amina Hassan',
    email: 'amina.hassan@tanzaniasafaris.co.tz',
    role: 'GUIDE',
    active: true,
  },

  // Ugandan Guides
  {
    name: 'Robert Musinguzi',
    email: 'robert.musinguzi@ugandasafaris.co.ug',
    role: 'GUIDE',
    active: true,
  },
  {
    name: 'Grace Nakato',
    email: 'grace.nakato@ugandasafaris.co.ug',
    role: 'GUIDE',
    active: true,
  },
];

// Customers
export const CUSTOMERS: UserSeedData[] = [
  // International Tourists
  {
    name: 'John Smith',
    email: 'john.smith@gmail.com',
    role: 'USER',
    active: true,
  },
  {
    name: 'Emma Johnson',
    email: 'emma.j@yahoo.com',
    role: 'USER',
    active: true,
  },
  {
    name: 'Michael Brown',
    email: 'mbrown@outlook.com',
    role: 'USER',
    active: true,
  },
  {
    name: 'Sarah Williams',
    email: 'sarah.williams@hotmail.com',
    role: 'USER',
    active: true,
  },
  {
    name: 'James Anderson',
    email: 'j.anderson@gmail.com',
    role: 'USER',
    active: true,
  },

  // East African Tourists
  {
    name: 'Peter Kamau',
    email: 'peter.kamau@gmail.com',
    role: 'USER',
    active: true,
  },
  {
    name: 'Lucy Nyambura',
    email: 'lucy.nyambura@yahoo.com',
    role: 'USER',
    active: true,
  },
  {
    name: 'Daniel Mutua',
    email: 'daniel.mutua@outlook.com',
    role: 'USER',
    active: true,
  },
  {
    name: 'Grace Achieng',
    email: 'grace.achieng@gmail.com',
    role: 'USER',
    active: true,
  },
  {
    name: 'Patrick Otieno',
    email: 'patrick.otieno@yahoo.com',
    role: 'USER',
    active: true,
  },
];

// Combine all users
export const ALL_USERS: UserSeedData[] = [
  ...ADMINS,
  ...GUIDES,
  ...CUSTOMERS,
];

// Helper function to hash passwords (will be used by seeder)
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

console.log(`👥 Loaded ${ALL_USERS.length} users (${ADMINS.length} admins, ${GUIDES.length} guides, ${CUSTOMERS.length} customers)`);
