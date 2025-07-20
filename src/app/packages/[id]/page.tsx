import { packages } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Star, Clock, MapPin, Check, X, Calendar, Users, DollarSign, Package } from "lucide-react";

type Props = {
  params: { id: string };
};

export default function PackageDetailPage({ params }: Props) {
  const pkg = packages.find((p) => p.id === params.id);

  if (!pkg) {
    notFound();
  }

  return (
    <div className="bg-background">
      <section className="relative h-64 md:h-96">
        <Image
          src={pkg.imageUrl}
          alt={pkg.title}
          layout="fill"
          objectFit="cover"
          className="brightness-75"
          data-ai-hint={pkg.imageHint}
        />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent">
          <div className="container mx-auto px-4 py-8 text-white">
            <Badge variant="secondary" className="mb-2">{pkg.type}</Badge>
            <h1 className="text-4xl md:text-6xl font-headline font-bold">{pkg.title}</h1>
            <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                    <MapPin className="h-5 w-5" /> {pkg.destination}
                </div>
                <div className="flex items-center gap-1">
                    <Clock className="h-5 w-5" /> {pkg.duration} Days
                </div>
                <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 text-yellow-400" /> {pkg.rating}
                </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-headline font-semibold mb-4">Tour Overview</h2>
            <p className="text-muted-foreground leading-relaxed">{pkg.description}</p>
            
            <h2 className="text-3xl font-headline font-semibold mt-12 mb-4">Itinerary</h2>
            <Accordion type="single" collapsible className="w-full">
              {pkg.itinerary.map((item) => (
                <AccordionItem value={`day-${item.day}`} key={item.day}>
                  <AccordionTrigger className="text-lg font-semibold font-headline">
                    Day {item.day}: {item.title}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.details}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24">
                <div className="border rounded-lg p-6 shadow-lg bg-card">
                    <div className="text-center mb-6">
                        <span className="text-sm text-muted-foreground">Starting from</span>
                        <p className="text-4xl font-bold text-primary">${pkg.price}</p>
                        <span className="text-sm text-muted-foreground">per person</span>
                    </div>

                    <Button className="w-full text-lg" size="lg">
                        Book Now
                    </Button>

                    <div className="mt-8 space-y-4">
                       <h3 className="text-xl font-headline font-semibold text-center">Package Details</h3>
                       <div className="grid grid-cols-1 gap-6 mt-4">
                          <div>
                            <h4 className="font-semibold mb-2">Inclusions</h4>
                            <ul className="space-y-2">
                              {pkg.inclusions.map((item, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm">
                                  <Check className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                                  <span className="text-muted-foreground">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Exclusions</h4>
                             <ul className="space-y-2">
                              {pkg.exclusions.map((item, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm">
                                  <X className="h-4 w-4 mt-0.5 text-red-500 flex-shrink-0" />
                                  <span className="text-muted-foreground">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                       </div>
                    </div>
                </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
