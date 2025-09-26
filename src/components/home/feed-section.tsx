import React from "react";
import { cn } from "@/lib/utils";
import ProductPostCard from "../shared/post-cards/product-post";
import PostCard from "../shared/post-cards/post-card";
import { usePostsStore } from "@/lib/store/posts";
import { ProductCards } from "../shared/cards/product-cards";

interface FeedSectionProps {
  className?: string;
}

const FeedSection = ({ className }: FeedSectionProps) => {
  const posts = usePostsStore((state) => state.posts);
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <ProductCards
        title="Products Near You"
        link="/products"
        linkLabel="See All"
      />
      <div className="grid grid-cols-3 gap-4">
        {posts.map((post) =>
          post.type === "product" ? (
            <ProductPostCard key={post.id} post={post} />
          ) : (
            <PostCard key={post.id} post={post} />
          )
        )}
      </div>
    </div>
  );
};

export default FeedSection;
