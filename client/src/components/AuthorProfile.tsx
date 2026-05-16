import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Linkedin, ExternalLink } from "lucide-react";

interface AuthorProfileProps {
  name: string;
  role: string;
  credentials?: string[];
  bio: string;
  avatarUrl?: string;
  linkedinUrl?: string;
  isVerified?: boolean;
}

const AuthorProfile: React.FC<AuthorProfileProps> = ({
  name,
  role,
  credentials = ['Chartered Accountant'],
  bio,
  avatarUrl,
  linkedinUrl,
  isVerified = true,
}) => {
  return (
    <Card className="my-8 overflow-hidden border-blue-100 bg-blue-50/30">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <Avatar className="h-20 w-20 border-2 border-white shadow-sm">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback className="bg-blue-600 text-white text-xl">
              {name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-slate-900">{name}</h3>
              {isVerified && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none flex gap-1 items-center px-2 py-0">
                  <UserCheck className="w-3 h-3" />
                  Verified Expert
                </Badge>
              )}
            </div>
            
            <p className="text-blue-600 font-medium text-sm mb-3">{role}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {credentials.map((cert) => (
                <Badge key={cert} variant="outline" className="bg-white text-slate-600 border-slate-200">
                  {cert}
                </Badge>
              ))}
            </div>
            
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              {bio}
            </p>
            
            <div className="flex items-center gap-4">
              {linkedinUrl && (
                <a 
                  href={linkedinUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              <a 
                href="/experts"
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                View Full Profile
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthorProfile;
