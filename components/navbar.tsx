"use client"
import { useAuth } from "@/contexts/AuthContext";
import {
  Navbar as NextUINavbar
} from "@nextui-org/navbar";
import { Avatar, User } from "@nextui-org/react";

const userData = useAuth();

export const Navbar = () => {

  return (
    <NextUINavbar className="h-20 bg-slate-500" maxWidth="xl" position="sticky">
      <UserProfile />
    </NextUINavbar>
  );
};

const UserProfile = () => {
  return (
    <div className="flex items-center gap-2">
      <Avatar isBordered radius="full" src={userData.user?.photoURL ?? ""} />
      <span>{userData.user?.displayName}</span>
    </div>
  );
}
