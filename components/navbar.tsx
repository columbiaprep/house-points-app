"use client"
import { useAuth } from "@/contexts/AuthContext";
import { Navbar as NextUINavbar } from "@nextui-org/navbar";
import { Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";

export const Navbar = () => {
  return (
    <NextUINavbar className="h-20 bg-slate-500" maxWidth="xl" position="sticky">
      <UserProfile />
    </NextUINavbar>
  );
};

const UserProfile = () => {
  const userData = useAuth();
  return (
    <Dropdown>
      <DropdownTrigger>
        <div className="flex items-center gap-2 cursor-pointer">
          <Avatar isBordered radius="full" src={userData.user?.photoURL ?? ""} />
          <span>{userData.user?.displayName}</span>
        </div>
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownItem key="profile">Profile</DropdownItem>
        <DropdownItem key="settings">Settings</DropdownItem>
        <DropdownItem key="logout" onPress={async () => await userData.signOutUser()}>
          Logout
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};