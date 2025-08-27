import React from "react";
import { cn } from "@/lib/utils";
import ProductPostCard from "../shared/post-cards/product-post";
import PostCard from "../shared/post-cards/post-card";
import { usePostsStore } from "@/lib/store/posts";

interface FeedSectionProps {
  className?: string;
}

const FeedSection = ({ className }: FeedSectionProps) => {
  const posts = usePostsStore((state) => state.posts);
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <h2 className="text-xl font-semibold ml-1">Nearby Feed</h2>

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
