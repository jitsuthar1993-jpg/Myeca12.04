import { Facebook, Twitter, Linkedin, Share2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonsProps {
  url?: string;
  title?: string;
  description?: string;
  className?: string;
}

export default function ShareButtons({ 
  url = typeof window !== 'undefined' ? window.location.href : '',
  title = "MyeCA.in - Expert Tax Filing & Compliance Services",
  description = "Save taxes with India's most trusted tax filing platform. Get expert CA assistance.",
  className = ""
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch (error) {
        // User cancelled sharing
      }
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Desktop Share Buttons */}
      <div className="hidden md:flex items-center gap-2">
        <span className="text-sm text-gray-600 mr-2">Share:</span>
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 transition-all duration-300 hover:scale-110"
          aria-label="Share on Facebook"
        >
          <Facebook className="w-4 h-4" />
        </a>
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-600 transition-all duration-300 hover:scale-110"
          aria-label="Share on Twitter"
        >
          <Twitter className="w-4 h-4" />
        </a>
        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-all duration-300 hover:scale-110"
          aria-label="Share on LinkedIn"
        >
          <Linkedin className="w-4 h-4" />
        </a>
        <button
          onClick={handleCopyLink}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all duration-300 hover:scale-110"
          aria-label="Copy link"
        >
          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Share Button */}
      <div className="md:hidden">
        {navigator.share ? (
          <Button
            onClick={handleNativeShare}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <a
                  href={shareLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Facebook className="w-4 h-4 text-blue-600" />
                  Facebook
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href={shareLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Twitter className="w-4 h-4 text-sky-600" />
                  Twitter
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href={shareLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Linkedin className="w-4 h-4 text-blue-700" />
                  LinkedIn
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href={shareLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4 text-green-600" />
                  WhatsApp
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyLink} className="flex items-center gap-2">
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}