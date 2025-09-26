"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CreateListingForm } from "@/components/marketplace/create-listing-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { type CreateListing } from "@/models/marketplace.model";

export default function CreateListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: CreateListing) => {
    setLoading(true);
    
    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create listing");
      }

      const listing = await response.json();
      
      toast.success("Listing created successfully!");
      router.push(`/marketplace/listings/${listing.id}`);
    } catch (error) {
      console.error("Error creating listing:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Create Listing</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tips Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <InfoIcon className="h-5 w-5 text-blue-600" />
              Tips for a Great Listing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Photos</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Use high-quality, well-lit photos</li>
                  <li>• Show multiple angles of your item</li>
                  <li>• Include close-ups of any defects</li>
                  <li>• First photo will be your main image</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Description</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Be honest about condition</li>
                  <li>• Include brand, model, and specifications</li>
                  <li>• Mention any included accessories</li>
                  <li>• Add relevant keywords for search</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Pricing</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Research similar items for fair pricing</li>
                  <li>• Consider condition when pricing</li>
                  <li>• Mark as negotiable if flexible</li>
                  <li>• Show original price for discounts</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Safety</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Meet in public places for exchanges</li>
                  <li>• Don't share personal information</li>
                  <li>• Use secure payment methods</li>
                  <li>• Trust your instincts</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <CreateListingForm
          onSubmit={handleSubmit}
          loading={loading}
        />

        {/* Additional Info */}
        <Alert className="mt-8">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            By creating a listing, you agree to our{" "}
            <a href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
            . Your listing will be reviewed and published within 24 hours.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}