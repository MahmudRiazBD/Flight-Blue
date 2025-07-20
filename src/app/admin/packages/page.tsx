
import { redirect } from 'next/navigation';

// This page just redirects to the "all packages" page.
export default function AdminPackagesPage() {
    redirect('/admin/packages/all');
}
