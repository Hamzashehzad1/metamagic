import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { Button } from "./ui/button";

export function Header() {
  return (
    <header className="py-4 px-4 md:px-6 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-20">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl md:text-3xl font-bold font-headline text-primary">MetaMagic</Link>
        <nav className="hidden md:flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/">Metadata Generator</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/upscaler">Image Upscaler</Link>
          </Button>
        </nav>
        <div className="flex items-center gap-2">
            <ThemeToggle />
            {/* Mobile Menu Trigger can be added here */}
        </div>
      </div>
    </header>
  );
}
