import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Search,
  MessageSquare,
  User,
  Store,
  Bell,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GoBell } from "react-icons/go";
import { IoMail, IoMailOutline } from "react-icons/io5";
import { HomeIcon } from "../custom-icons/home";

const MobileNav = () => {
  const pathname = usePathname();

  const navItems = [
    { path: "/", icon: HomeIcon, label: "Home" },
    { path: "/search", icon: Search, label: "Discover" },
    { path: "/notifications", icon: Bell, label: "Notifications" },
    { path: "/my-shop", icon: Store, label: "Shop" },
    { path: "/messages", icon: Mail, label: "Messages" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-40 shadow-lg">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item, index) => (
          <NavItem
            key={index}
            path={item.path}
            icon={item.icon}
            label={item.label}
            isActive={pathname === item.path}
          />
        ))}
      </div>
    </div>
  );
};

interface NavItemProps {
  path: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  showLabel?: boolean;
}

const NavItem = ({
  path,
  icon: Icon,
  label,
  isActive,
  showLabel = false,
}: NavItemProps) => {
  return (
    <Link
      href={path}
      className={cn(
        "flex flex-col items-center justify-center w-full py-1",
        isActive ? "text-klozui-green-600" : "text-gray-500"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-full w-12 h-12 mb-1 transition-all",
          isActive ? "bg-klozui-green-50" : "hover:bg-muted"
        )}
      >
        <Icon size={showLabel ? 20 : 24} />
      </div>
      {showLabel && <span className="text-xs font-medium">{label}</span>}
    </Link>
  );
};

export default MobileNav;
