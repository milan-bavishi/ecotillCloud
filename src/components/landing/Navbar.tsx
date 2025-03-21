import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Menu, X, Moon, Sun, Sprout } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const menuItems = [
    { label: 'Home', href: '#' },
    { label: 'Features', href: '#features' },
    { label: 'About', href: '#about' },
    { label: 'Modules', href: '#modules' },
    { label: 'Solutions', href: '#solutions' },
    { label: 'Contact', href: '#contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    
    // Check localStorage for theme on mount
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <nav className={`sticky top-0 w-full z-[100] pt-0 transition-all duration-300 ${
      isScrolled ? 'bg-background/95 shadow-lg backdrop-blur-md' : 'bg-background/80 backdrop-blur-sm'
    } border-b border-border/40`}>
      <div className="max-w-6xl mx-auto px-4 py-0">
        <div className="flex items-center justify-center h-12 relative">
          {/* Logo - Now centered */}
          <div className="flex items-center space-x-2 absolute left-4">
            <Sprout className="h-6 w-6 text-emerald-500" strokeWidth={2.5} />
            <span className="text-xl font-bold">Eco सत्वा</span>
          </div>

          {/* Desktop Menu - Now centered */}
          <div className="hidden md:flex items-center justify-center space-x-8">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-foreground/80 hover:text-emerald-500 transition-colors text-sm"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Desktop Actions - Now at right */}
          <div className="hidden md:flex items-center space-x-3 absolute right-4">
            <button
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            <a href="/signup">
              <Button className="bg-emerald-500 hover:bg-emerald-600">Get Started</Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center absolute right-4">
            <button
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground p-1 mr-3"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground p-1"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0 }}
        className="md:hidden overflow-hidden bg-background border-t"
      >
        <div className="px-4 py-2 space-y-1">
          {menuItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="block py-2 text-foreground/80 hover:text-emerald-500"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <div className="pt-4 pb-2">
            <a href="/signup" className="block w-full">
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600">Get Started</Button>
            </a>
          </div>
        </div>
      </motion.div>
    </nav>
  );
};

export default Navbar;