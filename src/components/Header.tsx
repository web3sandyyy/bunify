import { User } from "lucide-react";
import logo from "../assets/logo/logo1.png";
import { Button } from "./ui/button";
import { ImageIcon, LogOut } from "lucide-react";

interface HeaderProps {
  user: { email: string } | null;
  onLogout: () => Promise<void>;
  onOpenGallery: () => void;
}

const Header = ({ user, onLogout, onOpenGallery }: HeaderProps) => {
  return (
    <header className="bg-card shadow-medium p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground flex items-center">
          <img src={logo} alt="Bunify" className="mr-2 h-10 w-10" />
          Bunify
        </h1>
        <div className="flex items-center gap-2">
          {user && (
            <div className="flex items-center bg-muted rounded-full px-3 py-1 text-sm">
              <User className="h-4 w-4 mr-2 text-accent" />
              <span className="text-foreground">{user.email}</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenGallery}
            className="rounded-full"
            title="Gallery"
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="rounded-full"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
