
import { redirect } from 'next/navigation';

// This page just redirects to the "all users" page.
export default function AdminUsersPage() {
    redirect('/admin/users/all');
}
