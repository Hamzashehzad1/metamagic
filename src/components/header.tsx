
'use client';

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
import { useUser, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { getAuth, signOut } from "firebase/auth";
import { LogOut, User as UserIcon, LayoutDashboard, Shield, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { doc } from "firebase/firestore";
import { useIsMobile } from "@/hooks/use-mobile";
import { Logo } from "./logo";

interface UserProfile {
    isAdmin?: boolean;
}

export function Header() {
  const { user, isUserLoading } = useUser();
  const pathname = usePathname();
  const firestore = useFirestore();
  const isMobile = useIsMobile();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [firestore, user]);
    
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const handleLogout = async () => {
    await signOut(getAuth());
  }

  const getInitials = (email: string | null | undefined) => {
    if (!email) return '';
    return email.charAt(0).toUpperCase();
  }

  const isNotAdminArea = !pathname.startsWith('/admin');

  const renderNavLinks = (isDropdown = false) => {
    const Comp = isDropdown ? DropdownMenuItem : NavigationMenuItem;
    
    if (user && isNotAdminArea) {
      return (
        <>
          <Comp asChild>
            <Link href="/dashboard" className={!isDropdown ? navigationMenuTriggerStyle() : 'w-full'}>
              Metadata Generator
            </Link>
          </Comp>
          <Comp asChild>
            <Link href="/wp-alt-text" className={!isDropdown ? navigationMenuTriggerStyle() : 'w-full'}>
              WP Alt Text
            </Link>
          </Comp>
          <Comp asChild>
            <Link href="/meta-description" className={!isDropdown ? navigationMenuTriggerStyle() : 'w-full'}>
              Meta Description
            </Link>
          </Comp>
        </>
      );
    }
    if (!user) {
       return (
        <>
            <NavigationMenuItem asChild>
                <Link href="/#features" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Features
                    </NavigationMenuLink>
                </Link>
            </NavigationMenuItem>
            <NavigationMenuItem asChild>
                <Link href="/pricing" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Pricing
                    </NavigationMenuLink>
                </Link>
            </NavigationMenuItem>
        </>
       )
    }
    return null;
  }

  const renderMobileNavLinks = () => {
     if (user && isNotAdminArea) {
      return (
        <>
          <DropdownMenuItem asChild>
            <Link href="/dashboard">Metadata Generator</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/wp-alt-text">WP Alt Text</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/meta-description">Meta Description</Link>
          </DropdownMenuItem>
        </>
      );
    }
    if (!user) {
        return (
            <>
                <DropdownMenuItem asChild>
                    <Link href="/#features">Features</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/pricing">Pricing</Link>
                </DropdownMenuItem>
            </>
        )
    }
    return null;
  }

  return (
    <header className="py-4 px-4 md:px-6 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-20">
      <div className="container mx-auto flex justify-between items-center">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
            <Logo className="h-8 w-auto"/>
            <div className="flex flex-col">
              <span className="font-headline font-bold text-xl tracking-tighter text-primary">MetaMagic</span>
              <span className="text-xs text-muted-foreground -mt-1">By Web Brewery</span>
            </div>
        </Link>
        
        {!isMobile && (
          <NavigationMenu>
            <NavigationMenuList>
              {renderNavLinks()}
            </NavigationMenuList>
          </NavigationMenu>
        )}

        <div className="flex items-center gap-2 md:gap-4">
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
                        {userProfile?.isAdmin && (
                            <DropdownMenuItem asChild>
                                <Link href="/admin">
                                    <Shield className="mr-2 h-4 w-4" />
                                    <span>Admin</span>
                                </Link>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Logout</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <>
                    {!isMobile && (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" asChild>
                                <Link href="/login">Login</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/signup">Sign Up</Link>
                            </Button>
                        </div>
                    )}
                </>
            )}

            {isMobile && (
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                          <Menu />
                          <span className="sr-only">Toggle navigation menu</span>
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {renderMobileNavLinks()}
                    {!user && (
                      <>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem asChild>
                           <Link href="/login">Login</Link>
                        </DropdownMenuItem>
                         <DropdownMenuItem asChild>
                           <Link href="/signup">Sign Up</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
              </DropdownMenu>
            )}
            {!isMobile && <ThemeToggle />}
        </div>
      </div>
    </header>
  );
}
