export interface NavLink {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
}

export const MAIN_NAVIGATION: NavLink[] = [
  {
    label: "Product",
    children: [
      { label: "Features", href: "/#features" },
      { label: "Learn Drift", href: "/learn-drift" },
    ]
  },
  { label: "About", href: "/about" },
  {
    label: "Resources",
    children: [
      { label: "Help Center", href: "/help" },
      { label: "Security & Trust", href: "/security" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ]
  }
];
