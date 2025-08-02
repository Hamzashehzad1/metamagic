import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header className="py-4 px-4 md:px-6 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold font-headline text-primary">MetaMagic</h1>
        <ThemeToggle />
      </div>
    </header>
  );
}
