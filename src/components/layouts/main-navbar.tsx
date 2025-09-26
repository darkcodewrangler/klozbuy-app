import React, { useState } from "react";

import {
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  Store,
  Heart,
  Clock,
  ChevronDown,
  MapPin,
  LocateIcon,
} from "lucide-react";
import UserAvatar from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import AppLogo from "@/components/shared/app-logo";
import LocationBadge from "../shared/location-badge";

interface NavbarProps {
  onMobileMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

const Navbar = ({ onMobileMenuToggle, isMobileMenuOpen }: NavbarProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Mock user data - in a real app this would come from auth context
  const user = {
    name: "Adebayo Olatunji",
    type: "individual",
    isVerified: false,
    avatar: "",
  };

  return (
    <div className="bg-background sticky top-0 z-50 w-full px-4 py-2 flex items-center justify-between border-b border-border">
      <div className="hidden relative md:flex items-center bg-muted/50 border border-muted-foreground/20 rounded-md flex-1 max-w-md ">
        <Search size={16} className="text-muted-foreground absolute left-3" />
        <Input
          type="search"
          placeholder="Search for products, businesses..."
          className="bg-transparent rounded-md pl-9  border-none outline-none w-full text-sm"
        />
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        <Button variant="ghost" size="icon" className="hidden md:flex">
          <Bell size={20} />
        </Button>

        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="border border-muted-foreground/10 rounded-md pl-1 pr-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring/50">
              <div className="flex gap-2 items-center">
                <UserAvatar
                  name={user.name}
                  size="sm"
                  userType={user.type as "individual" | "business"}
                  src={
                    user.avatar ||
                    "https://images.unsplash.com/photo-1463453091185-61582044d556?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  }
                />
                <div className="flex flex-col items-start gap-1">
                  <p className="text-sm font-medium leading-none text-primary">
                    Hello, {user.name.split(" ")[0]}
                  </p>
                  <div className="text-xs leading-none text-muted-foreground">
                    <div className="flex items-center gap-1 ">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className=" inline-block truncate max-w-[120px]">
                        14 Adeola Odeku St
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronDown className="ml-1 h-4 w-4 text-muted-foreground" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 mr-2 mt-1"
              align="end"
              forceMount
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-base font-medium leading-none">
                    {user.name}
                  </p>
                  <p className="text-sm leading-none text-muted-foreground">
                    {user.type === "individual"
                      ? "Individual Account"
                      : "Business Account"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem className="cursor-default hover:bg-transparent">
                <div className="flex items-center gap-2">
                  <Button size="sm">
                    <LocateIcon className="mr-1" />
                    <span>Change Location</span>
                  </Button>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Heart className="mr-2 h-4 w-4" />
                  <span>Favorites</span>
                </DropdownMenuItem>
                {user.type === "business" && (
                  <DropdownMenuItem>
                    <Store className="mr-2 h-4 w-4" />
                    <span>Business Dashboard</span>
                  </DropdownMenuItem>
                )}
                {user.type === "business" && (
                  <DropdownMenuItem>
                    <Store className="mr-2 h-4 w-4" />
                    <span>My Business</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem>
                  <Clock className="mr-2 h-4 w-4" />
                  <span>Activity</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="text-sm hidden md:block"
              onClick={() => setIsAuthenticated(true)}
            >
              Log in
            </Button>
            <Button
              className="bg-klozui-green-600 hover:bg-klozui-green-600/90 text-white text-sm"
              onClick={() => setIsAuthenticated(true)}
            >
              Sign up
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
