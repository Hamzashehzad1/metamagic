
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { CheckCircle2, KeyRound } from "lucide-react";

interface HeaderProps {
    isConnected: boolean;
    onConnectClick: () => void;
}

export function Header({ isConnected, onConnectClick }: HeaderProps) {
  return (
    <header className="py-4 px-4 md:px-6 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-20">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl md:text-3xl font-bold font-headline text-primary">MetaMagic</Link>
        
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <Link href="/" passHref>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            Metadata Generator
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link href="/wp-alt-text" passHref>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            WP Alt Text
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-2">
            {isConnected ? (
                <Badge variant="secondary" className="border-green-500/50 text-green-700 dark:text-green-400">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Connected
                </Badge>
            ) : (
                <Button variant="outline" size="sm" onClick={onConnectClick}>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Connect API
                </Button>
            )}
            <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
