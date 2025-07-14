"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  LogOut,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// Component for nav items
function NavItem({
  icon: Icon,
  label,
  href,
  active,
}: {
  icon: LucideIcon;
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link href={href} passHref>
      <Button
        variant="ghost"
        className={`w-full justify-start mb-1 text-left px-4 py-3 rounded-lg transition-colors
          ${
            active
              ? "bg-[#8BC34A] text-white font-bold"
              : "text-[#F8F9FA] hover:bg-[#23282c] hover:text-white"
          }
        `}
        style={{ fontWeight: active ? "bold" : "normal" }}
      >
        <Icon className="mr-2 h-5 w-5" color={active ? "#fff" : "#F8F9FA"} />
        <span className="truncate">{label}</span>
      </Button>
    </Link>
  );
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/User/Dashboard" },
  {
    icon: UserCog,
    label: "Perizinan",
    href: "/User/Perizinan",
  },
  {
    icon: Users,
    label: "Riwayat Absensi",
    href: "/User/RiwayatAbsensi",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setToken } = useAuth();

  const handleLogout = () => {
    setToken(null);
    router.push("/Login");
  };

  return (
    <Card
      className="flex flex-col h-full w-64 border-r rounded-none shadow-none"
      style={{ background: "#212529" }}
    >
      <div
        className="p-4 flex items-center border-b"
        style={{ background: "#212529" }}
      >
        <Image
          src="/STTPayakumbuh.png"
          alt="Logo STT Payakumbuh"
          width={48}
          height={48}
          className="object-contain mr-3"
        />
        <div>
          <div className="text-lg font-bold text-white leading-tight">
            STT Payakumbuh
          </div>
          <div className="text-sm text-[#a89b93]">Portal Absensi</div>
        </div>
      </div>
      <div className="border-b" style={{ borderColor: "#393e41" }} />
      <CardContent className="flex-1 p-3">
        <nav className="space-y-1 mb-6">
          {menuItems.map((item) => (
            <NavItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={pathname === item.href}
            />
          ))}
        </nav>
      </CardContent>
      <div className="p-3 border-t ">
        <Button
          variant="ghost"
          className="w-full justify-start text-[#F8F9FA] rounded-lg px-4 py-3 hover:bg-[#23282c] hover:text-white transition-colors border border-[#8BC34A]"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-5 w-5" color="#F8F9FA" />
          Keluar
        </Button>
      </div>
    </Card>
  );
}
