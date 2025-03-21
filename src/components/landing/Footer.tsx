import { Leaf, Github, Twitter, Linkedin, Globe, Sprout } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary/20 pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Sprout className="h-6 w-6 text-emerald-500" strokeWidth={2.5} />
              <span className="text-xl font-bold">Eco सत्वा</span>
            </div>
            <p className="text-muted-foreground">
              Empowering businesses with AI-driven carbon management solutions.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-emerald-500">Features</a></li>
              <li><a href="#modules" className="text-muted-foreground hover:text-emerald-500">Free Services</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-emerald-500">Case Studies</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-emerald-500">Documentation</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-emerald-500">About</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-emerald-500">Blog</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-emerald-500">Careers</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-emerald-500">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-emerald-500">Privacy Policy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-emerald-500">Terms of Service</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-emerald-500">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <Separator className="mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Eco सत्वा. All rights reserved.
          </p>

          <div className="flex space-x-4">
            <a href="#" className="text-muted-foreground hover:text-emerald-500">
              <Github className="h-5 w-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-emerald-500">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-emerald-500">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;