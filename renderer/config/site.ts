import { HomeIcon, PackageIcon, TruckIcon, ClipboardListIcon, UsersIcon, MapPinIcon, TagIcon, DatabaseIcon } from "@/components/icons";

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Next.js + HeroUI",
  description: "Make beautiful websites regardless of your design experience.",
  navItems: [
    {
      label: "Accueil",
      href: "/home",
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
    // {
    //   label: "Database",
    //   href: "/database",
    //   icon: DatabaseIcon,
    // },
  ],
};
