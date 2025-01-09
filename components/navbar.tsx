"use client"
import { useAuth } from "@/contexts/AuthContext";
import { NavbarBrand, Navbar as NextUINavbar } from "@nextui-org/navbar";
import { Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Image } from "@nextui-org/react";
import BrandImage from "@/public/cgps-houses-logo.png"

export const Navbar = () => {
  const userData = useAuth();
  return (
    <>
      {userData.user && (
        <NextUINavbar className="h-20 bg-slate-800" height={80} maxWidth="xl" position="sticky">
          <NavbarBrand className="flex items-center gap-2">
            <Image src={BrandImage.src} alt="CGPS Houses Logo" height={50}  />
          </NavbarBrand>
          <UserProfile />
        </NextUINavbar>
      )}
    </>
  );
};

const UserProfile = () => {
  const userData = useAuth();
  const photoURL = userData.user?.photoURL || '';
  const displayName = userData.user?.displayName;

  return (
    <Dropdown>
      <DropdownTrigger className="border-solid border-2 border-transparent hover:border-white p-2 bg-slate-200 rounded-lg">
        <div className="flex items-center gap-2 cursor-pointer">
          <Avatar isBordered radius="full" src={photoURL} />
          <span className="text-black">{displayName}</span>
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