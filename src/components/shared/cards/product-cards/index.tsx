import { cn } from "@/lib/utils";
import { ProductCard } from "../product-card";
import Link from "next/link";

interface ProductCardsProps {
  title?: string;
  className?: string;
  link?: string;
  linkLabel?: string;
}
export const ProductCards = ({
  title,
  className,
  link,
  linkLabel,
}: ProductCardsProps) => {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center justify-between">
        {title && <h2 className="text-lg lg:text-xl font-semibold">{title}</h2>}
        {link && linkLabel && (
          <Link
            href={link}
            className="text-sm lg:text-base text-blue-500 hover:underline"
          >
            {linkLabel}
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-3 lg:gap-4">
        {[1, 2, 3, 4, 5].map((item) => (
          <ProductCard key={item} />
        ))}
      </div>
    </div>
  );
};
