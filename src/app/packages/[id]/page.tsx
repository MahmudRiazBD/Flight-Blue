import { packages } from "@/lib/data";
import { notFound } from "next/navigation";
import PackageDetailClient from "./PackageDetailClient";

type Props = {
  params: { id: string };
};

export default function PackageDetailPage({ params }: Props) {
  const pkg = packages.find((p) => p.id === params.id);

  if (!pkg) {
    notFound();
  }

  return <PackageDetailClient pkg={pkg} />;
}
