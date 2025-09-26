import { Badge2 } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeartIcon, MapPin } from "lucide-react";
import Image from "next/image";

export const ProductCard = () => {
  return (
    <div className="min-w-44 relative flex flex-col border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out">
      <Button
        size="icon"
        className="absolute top-2 right-2 "
        variant={"outline"}
      >
        <span className="sr-only">Add to Favorite</span>
        <HeartIcon className="size-5 text-muted-foreground" />
      </Button>
      <div className="aspect-square w-full h-[160px]">
        <Image
          src="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=464&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Product Image"
          className="object-cover rounded-t-lg size-full aspect-square "
          width={160}
          height={160}
        />
      </div>
      <div className="p-3 lg:p-4">
        <Badge2 className="flex items-center gap-1">
          <MapPin className="size-4" />
          <span className="text-sm text-muted-foreground">2km away</span>
        </Badge2>
        <div className="">
          <h2 className="xl:text-lg text-base font-medium lg:font-semibold line-clamp-2">
            Product Title that wraps to the next line
          </h2>
        </div>
        <div className="mt-2 flex-col gap-2 items-center">
          <span className="text-primary text-xl font-bold">₦17,500</span>
        </div>
      </div>
    </div>
  );
};
