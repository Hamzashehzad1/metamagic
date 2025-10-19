
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import { useUser } from "@/firebase";
import { getAuth, signOut } from "firebase/auth";
import { LogOut, User as UserIcon, LayoutDashboard } from "lucide-react";
import { usePathname } from "next/navigation";

export function Header() {
  const { user, isUserLoading } = useUser();
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut(getAuth());
  }

  const getInitials = (email: string | null | undefined) => {
    if (!email) return '';
    return email.charAt(0).toUpperCase();
  }

  return (
    <header className="py-4 px-4 md:px-6 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-20">
      <div className="container mx-auto flex justify-between items-center">
        <Link href={user ? "/dashboard" : "/"} className="text-2xl md:text-3xl font-bold font-headline text-primary">MetaMagic</Link>
        
        {user ? (
          <NavigationMenu>
              <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild active={pathname.startsWith('/dashboard')}>
                      <Link href="/dashboard" className={navigationMenuTriggerStyle()}>
                        Metadata Generator
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild active={pathname.startsWith('/wp-alt-text')}>
                      <Link href="/wp-alt-text" className={navigationMenuTriggerStyle()}>
                        WP Alt Text
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild active={pathname.startsWith('/meta-description')}>
                      <Link href="/meta-description" className={navigationMenuTriggerStyle()}>
                        Meta Description
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
              </NavigationMenuList>
          </NavigationMenu>
        ) : (
          <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link href="/#features" className={navigationMenuTriggerStyle()}>
                        Features
                      </Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuLink asChild active={pathname.startsWith('/pricing')}>
                      <Link href="/pricing" className={navigationMenuTriggerStyle()}>
                        Pricing
                      </Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        )}

        <div className="flex items-center gap-4">
            {isUserLoading ? (
                <div />
            ) : user ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                                <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard">
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                <span>Dashboard</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/account">
                                <UserIcon className="mr-2 h-4 w-4" />
                                <span>Account</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Logout</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" asChild>
                        <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/signup">Sign Up</Link>
                    </Button>
                </div>
            )}
            <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
