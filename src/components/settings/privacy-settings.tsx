"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, Shield, Eye, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface LocationPrivacySettings {
  shareExactLocation: boolean;
  locationVisibility: "public" | "authenticated" | "favorites" | "private";
  proximityRadius: number;
  showInSearch: boolean;
  allowLocationBasedRecommendations: boolean;
}

interface PrivacySettingsProps {
  settings?: LocationPrivacySettings;
  onSettingsChange?: (settings: LocationPrivacySettings) => void;
  className?: string;
}

const defaultSettings: LocationPrivacySettings = {
  shareExactLocation: false,
  locationVisibility: "authenticated",
  proximityRadius: 5,
  showInSearch: true,
  allowLocationBasedRecommendations: true,
};

export function PrivacySettings({ 
  settings = defaultSettings, 
  onSettingsChange,
  className 
}: PrivacySettingsProps) {
  const [localSettings, setLocalSettings] = useState<LocationPrivacySettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (key: keyof LocationPrivacySettings, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    setHasChanges(true);
  };

  const handleSave = () => {
    onSettingsChange?.(localSettings);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalSettings(settings);
    setHasChanges(false);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Location Privacy Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Exact Location Sharing */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Share Exact Location</Label>
              <p className="text-xs text-gray-600">
                Allow others to see your precise address when viewing your listings
              </p>
            </div>
            <Switch
              checked={localSettings.shareExactLocation}
              onCheckedChange={(checked) => handleSettingChange("shareExactLocation", checked)}
            />
          </div>
        </div>

        <Separator />

        {/* Location Visibility */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Who can see your location</Label>
          <Select
            value={localSettings.locationVisibility}
            onValueChange={(value) => handleSettingChange("locationVisibility", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>Everyone</span>
                </div>
              </SelectItem>
              <SelectItem value="authenticated">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Logged-in users only</span>
                </div>
              </SelectItem>
              <SelectItem value="favorites">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Favorite users only</span>
                </div>
              </SelectItem>
              <SelectItem value="private">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Nobody (hide location)</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-600">
            Control who can see your location information in listings and requests
          </p>
        </div>

        <Separator />

        {/* Proximity Radius */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Proximity Display Radius</Label>
          <Select
            value={localSettings.proximityRadius.toString()}
            onValueChange={(value) => handleSettingChange("proximityRadius", parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Within 1km</SelectItem>
              <SelectItem value="2">Within 2km</SelectItem>
              <SelectItem value="5">Within 5km</SelectItem>
              <SelectItem value="10">Within 10km</SelectItem>
              <SelectItem value="25">Within 25km</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-600">
            When exact location is hidden, show approximate distance instead
          </p>
        </div>

        <Separator />

        {/* Search Visibility */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Show in Location-Based Search</Label>
              <p className="text-xs text-gray-600">
                Allow your listings to appear in location-based search results
              </p>
            </div>
            <Switch
              checked={localSettings.showInSearch}
              onCheckedChange={(checked) => handleSettingChange("showInSearch", checked)}
            />
          </div>
        </div>

        <Separator />

        {/* Recommendations */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Location-Based Recommendations</Label>
              <p className="text-xs text-gray-600">
                Receive personalized recommendations based on your location
              </p>
            </div>
            <Switch
              checked={localSettings.allowLocationBasedRecommendations}
              onCheckedChange={(checked) => handleSettingChange("allowLocationBasedRecommendations", checked)}
            />
          </div>
        </div>

        {/* Privacy Notice */}
        <Alert>
          <MapPin className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Your privacy is important to us. Location data is used only to improve your marketplace experience 
            and is never shared with third parties without your explicit consent.
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        {hasChanges && (
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} size="sm">
              Save Changes
            </Button>
            <Button onClick={handleReset} variant="outline" size="sm">
              Reset
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PrivacySettings;