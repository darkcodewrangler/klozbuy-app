import React, { createElement, memo, ReactElement } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  User,
  MessageSquare,
  Heart,
  Store,
  Map,
  Settings,
  Crown,
  Megaphone,
  PanelTop,
  BarChart3,
  LogOut,
  Bell,
  Mail,
  User2,
  ShoppingBag,
} from "lucide-react";
import AppLogo from "@/components/shared/app-logo";
import UserAvatar from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";
import { useResize } from "@/hooks/use-resize";
import { IconType } from "react-icons/lib";
import { HomeIcon } from "../custom-icons/home";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface SidebarProps {
  className?: string;
}

const Sidebar = memo(({ className }: SidebarProps) => {
  const pathname = usePathname();

  // Mock user data - in a real app this would come from auth context
  const isAuthenticated = true;
  const user = {
    name: "Adebayo Olatunji",
    type: "individual",
    isVerified: false,
    avatar: "",
  };

  const businessUser = {
    name: "Lagos Cosmetics",
    type: "business",
    isVerified: true,
    avatar: "",
  };

  const { isDesktop, isTablet } = useResize();

  const NavItem = ({
    path,
    icon: Icon,
    label,
  }: {
    path: string;
    icon: IconType | ((isActive: boolean) => IconType);
    label: string;
  }) => {
    const isActive = pathname === path;
    const content = (
      <Link
        href={path}
        className={cn(
          "flex items-center justify-start group mb-1 text-base flex-grow outline-none focus-visible:outline-none"
        )}
      >
        <div
          className={cn(
            "flex  items-center p-2 rounded-md transition-colors group-focus-within:outline-none group-focus-visible:outline-none group-focus-visible:ring-2 group-focus-visible:ring-klozui-green-600 group-focus-visible:ring-offset-2",

            isActive
              ? "bg-klozui-green-600 text-white hover:bg-klozui-green-600/90 group-hover:bg-klozui-green-600/90"
              : "hovr:bg-muted hover:bg-klozui-green-600/90 group-hover:bg-muted "
          )}
        >
          <div className="flex">
            {createElement(
              typeof Icon == "function" ? (Icon?.(isActive) as any) : Icon,
              {
                size: 20,
              }
            )}
          </div>
          {!isTablet && (
            <div
              className={cn(
                "flex text-lg leading-6 items-center ml-3 overflow-hidden mr-4 whitespace-nowrap",
                isActive ? "font-semibold" : "font-normal"
              )}
            >
              <span className="text-ellipsis">{label}</span>
            </div>
          )}
        </div>
      </Link>
    );
    return isTablet ? (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent sticky="always" side="right" className="font-medium">
          {label}
        </TooltipContent>
      </Tooltip>
    ) : (
      content
    );
  };

  return (
    <div
      className={cn(
        "sticky top-0 left-0 pt-4 justify-end  border-r border-border bg-background h-screen transform transition-transform duration-300 ease-in-out hidden md:flex z-50",
        isTablet && "flex-grow-0 w-20",
        isDesktop && "w-[300px]",

        className
      )}
    >
      <div
        className={cn(
          "flex-col items-center bg-background transform transition-transform duration-300 ease-in-out flex gap-6 w-full"
        )}
      >
        <div className="px-3 w-full">
          <AppLogo size="lg" showText={isDesktop} className="hidden md:flex" />
        </div>
        <ScrollArea className={cn("flex flex-col flex-1 px-3 w-full")}>
          <nav id="Primary" className="py-2 justify-center w-full pt-4 ">
            <div
              className={cn(
                "flex flex-col space-y-1 px-1"
                // isTablet ? "px-0" : "px-0"
              )}
            >
              <NavItem
                path="/"
                icon={(isActive: boolean) =>
                  (isActive ? HomeIcon : Home) as any
                }
                label="Home"
              />
              <NavItem path="/marketplace" icon={ShoppingBag} label="Marketplace" />
              <NavItem path="/search" icon={Search} label="Discover" />
            </div>

            {isAuthenticated && (
              <>
                <Separator className="my-4" />

                {isDesktop && (
                  <p className="text-sm font-medium text-muted-foreground mb-2 px-2">
                    Business
                  </p>
                )}
                <div className="space-y-1 px-1">
                  <NavItem path="/my-shop" icon={Store} label="My Shop" />
                  <NavItem path="/locations" icon={Map} label="Locations" />
                  <NavItem path="/promote" icon={Megaphone} label="Promote" />
                  <NavItem path="/premium" icon={Crown} label="Go Premium" />
                  {user.type === "business" && (
                    <NavItem
                      path="/dashboard"
                      icon={BarChart3}
                      label="Dashboard"
                    />
                  )}
                </div>

                <Separator className="my-4" />
              </>
            )}
          </nav>
        </ScrollArea>
      </div>
    </div>
  );
});
Sidebar.displayName = "Sidebar";
export default Sidebar;
