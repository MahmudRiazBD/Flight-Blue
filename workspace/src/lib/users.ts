
import { User } from '@/hooks/use-auth';
// In a real application, you would import firebase and fetch users from Firestore.
// For example: import { collection, getDocs } from "firebase/firestore";
// import { db } from "./firebase"; // Assuming db is exported from your firebase config

export const mockUsers: User[] = [
    {
        uid: 'user-1-superadmin',
        email: 'hello@riaz.com.bd',
        firstName: 'Super',
        lastName: 'Admin',
        phone: '111-222-3333',
        role: 'superadmin',
        photoURL: 'https://placehold.co/100x100.png'
    },
    {
        uid: 'user-2-admin',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        phone: '222-333-4444',
        role: 'admin',
        photoURL: 'https://placehold.co/100x100.png'
    },
    {
        uid: 'user-3-staff',
        email: 'staff@example.com',
        firstName: 'Staff',
        lastName: 'Member',
        phone: '333-444-5555',
        role: 'staff',
        photoURL: 'https://placehold.co/100x100.png'
    },
    {
        uid: 'user-4-customer',
        email: 'customer1@example.com',
        firstName: 'Alice',
        lastName: 'Johnson',
        phone: '444-555-6666',
        role: 'customer',
        photoURL: 'https://placehold.co/100x100.png'
    },
    {
        uid: 'user-5-customer',
        email: 'customer2@example.com',
        firstName: 'Bob',
        lastName: 'Williams',
        role: 'customer',
        photoURL: 'https://placehold.co/100x100.png'
    }
];

// This is how you would fetch users in a real application.
// export async function fetchUsers(): Promise<User[]> {
//   try {
//     const usersCollection = collection(db, "users");
//     const usersSnapshot = await getDocs(usersCollection);
//     const usersList = usersSnapshot.docs.map(doc => doc.data() as User);
//     return usersList;
//   } catch (error) {
//     console.error("Error fetching users: ", error);
//     return [];
//   }
// }
