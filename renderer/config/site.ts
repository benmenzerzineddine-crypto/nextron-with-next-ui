import { HomeIcon, PackageIcon, TruckIcon, ClipboardListIcon, UsersIcon, MapPinIcon, TagIcon } from "@/components/icons";

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Next.js + HeroUI",
  description: "Make beautiful websites regardless of your design experience.",
  navItems: [
    {
      label: "Accueil",
      href: "/",
      icon: HomeIcon,
    },
    {
      label: "Stock",
      href: "/stock",
      icon: PackageIcon,
    },
    {
      label: "Mouvement de stock",
      href: "/mouvements",
      icon: TruckIcon,
    },
    // {
    //   label: "Bon de reception",
    //   href: "/receptions",
    //   icon: ClipboardListIcon,
    // },
    // {
    //   label: "Consommation",
    //   href: "/consommation",
    //   icon: ClipboardListIcon, // Using same icon for now
    // },
    {
      label: "Fournisseurs",
      href: "/suppliers",
      icon: UsersIcon,
    },
    {
      label: "Utilisateurs",
      href: "/users",
      icon: UsersIcon,
    },
    {
      label: "Emplacements",
      href: "/locations",
      icon: MapPinIcon,
    },
    {
      label: "Types",
      href: "/types",
      icon: TagIcon,
    },
  ],
};
