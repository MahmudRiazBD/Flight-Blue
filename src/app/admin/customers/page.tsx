
import { redirect } from 'next/navigation';

// This page is obsolete and redirects to the new users page.
export default function AdminCustomersPage() {
    redirect('/admin/users/all');
}
