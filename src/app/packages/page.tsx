
"use client"

import { useState, useEffect } from 'react';
import PackageCard from "@/components/PackageCard";
import { Package } from "@/lib/data";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getFirebaseApp } from '@/lib/firebase';

export default function PackagesPage() {
    const [allPackages, setAllPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [packageType, setPackageType] = useState('all');
    const [priceRange, setPriceRange] = useState({ min: 1000, max: 2000000 });
    const [maxPrice, setMaxPrice] = useState(2000000);
    
    useEffect(() => {
        const fetchPackages = async () => {
            setLoading(true);
            try {
                const db = getFirestore(getFirebaseApp());
                const packagesSnapshot = await getDocs(collection(db, 'packages'));
                const packagesList = packagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Package));
                setAllPackages(packagesList);

                if (packagesList.length > 0) {
                    const highestPrice = Math.max(...packagesList.map(p => p.price));
                    const newMax = Math.ceil(highestPrice / 10000) * 10000; // Round up to nearest 10k
                    setPriceRange({ min: 1000, max: newMax });
                    setMaxPrice(newMax); // Set initial filter to max
                }
            } catch (error) {
                console.error("Error fetching packages:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPackages();
    }, []);

    const filteredPackages = allPackages.filter(pkg => {
        const matchesSearch = pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) || pkg.destination.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = packageType === 'all' || pkg.type === packageType;
        const matchesPrice = pkg.price <= maxPrice;
        return matchesSearch && matchesType && matchesPrice;
    });

    return (
        <div className="container mx-auto px-4 py-12">
            <header className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-headline font-bold">Explore Our Packages</h1>
                <p className="text-lg text-muted-foreground mt-2">Find the perfect journey tailored for you.</p>
            </header>

            <aside className="mb-12 p-6 bg-secondary rounded-lg shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                    <div className="lg:col-span-2">
                        <label htmlFor="search" className="block text-sm font-medium mb-2">Search by name or destination</label>
                        <div className="relative">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                           <Input
                                id="search"
                                type="text"
                                placeholder="e.g., Paris, Hajj, Tokyo"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium mb-2">Package Type</label>
                        <Select value={packageType} onValueChange={setPackageType}>
                            <SelectTrigger id="type">
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="Tour">Tour</SelectItem>
                                <SelectItem value="Hajj">Hajj</SelectItem>
                                <SelectItem value="Umrah">Umrah</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <label htmlFor="price" className="block text-sm font-medium mb-2">Max Price: <span className="font-bold text-primary">৳{maxPrice.toLocaleString()}</span></label>
                        <Slider
                            id="price"
                            min={priceRange.min}
                            max={priceRange.max}
                            step={1000}
                            value={[maxPrice]}
                            onValueChange={(value) => setMaxPrice(value[0])}
                        />
                    </div>
                </div>
            </aside>
            
            <main>
                {loading ? (
                    <div className="text-center py-16">
                        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                        <p className="mt-4 text-muted-foreground">Loading packages...</p>
                    </div>
                ) : filteredPackages.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPackages.map(pkg => (
                            <PackageCard key={pkg.id} pkg={pkg} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <h2 className="text-2xl font-headline font-semibold">No Packages Found</h2>
                        <p className="text-muted-foreground mt-2">Try adjusting your filters to find your perfect trip.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
