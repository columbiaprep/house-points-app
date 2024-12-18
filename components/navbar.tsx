"use client"
import {
  Navbar as NextUINavbar
} from "@nextui-org/navbar";
import { Avatar, User } from "@nextui-org/react";

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
      <Avatar isBordered radius="full" src="https://i.pravatar.cc/150?u=a04258114e29026708c" />
      <span>John Doe</span>
    </div>
  );
}
