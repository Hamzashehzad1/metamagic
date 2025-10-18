"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clipboard, ClipboardCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "./ui/textarea";

interface MetadataCardProps {
  title: string;
  content: string | null;
  onContentChange: (newContent: string) => void;
}

export function MetadataCard({ title, content, onContentChange }: MetadataCardProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [currentContent, setCurrentContent] = useState(content || '');

  useEffect(() => {
    setCurrentContent(content || '');
  }, [content]);

  useEffect(() => {
    if(isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const handleCopy = () => {
    if (currentContent) {
      navigator.clipboard.writeText(currentContent);
      toast({
        title: "Copied to clipboard!",
        description: `${title} has been copied.`,
      });
      setIsCopied(true);
    }
  };

  const handleBlur = () => {
    onContentChange(currentContent);
  }
  
  const renderContent = () => {
    if (content === null) {
      return <span className="text-muted-foreground">Nothing generated.</span>;
    }

    if (title === 'Stock Keywords') {
        return (
            <Textarea
              value={currentContent}
              onChange={(e) => setCurrentContent(e.target.value)}
              onBlur={handleBlur}
              className="text-sm text-foreground/80 whitespace-pre-wrap min-h-[120px] bg-background"
              placeholder="Keywords, separated by commas"
            />
        )
    }

    return (
      <Textarea
        value={currentContent}
        onChange={(e) => setCurrentContent(e.target.value)}
        onBlur={handleBlur}
        className="text-sm text-foreground/80 whitespace-pre-wrap min-h-[120px] bg-background"
        placeholder={`Enter ${title}`}
      />
    );
  };

  return (
    <Card className="bg-background/50 transition-shadow hover:shadow-md h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold text-primary">{title}</CardTitle>
        <Button variant="ghost" size="icon" onClick={handleCopy} disabled={!currentContent} aria-label={`Copy ${title}`}>
          {isCopied ? (
            <ClipboardCheck className="h-4 w-4 text-green-500" />
          ) : (
            <Clipboard className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
