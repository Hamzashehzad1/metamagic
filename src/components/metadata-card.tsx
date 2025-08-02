"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clipboard, ClipboardCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface MetadataCardProps {
  title: string;
  content: string | null;
}

export function MetadataCard({ title, content }: MetadataCardProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if(isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      toast({
        title: "Copied to clipboard!",
        description: `${title} has been copied.`,
      });
      setIsCopied(true);
    }
  };

  return (
    <Card className="bg-background/50 transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold text-primary">{title}</CardTitle>
        <Button variant="ghost" size="icon" onClick={handleCopy} disabled={!content} aria-label={`Copy ${title}`}>
          {isCopied ? (
            <ClipboardCheck className="h-4 w-4 text-green-500" />
          ) : (
            <Clipboard className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground/80 whitespace-pre-wrap min-h-[20px]">
            {content || <span className="text-muted-foreground">Nothing generated.</span>}
        </p>
      </CardContent>
    </Card>
  );
}
