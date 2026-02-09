const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-heading font-bold text-sm">M</span>
          </div>
          <span className="font-heading font-bold text-lg">MUSES</span>
        </div>
        <nav className="flex gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">About</a>
          <a href="#" className="hover:text-foreground transition-colors">Docs</a>
          <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
          <a href="#" className="hover:text-foreground transition-colors">Devpost</a>
          <a href="#" className="hover:text-foreground transition-colors">Contact</a>
        </nav>
        <p className="text-sm text-muted-foreground">© 2026 MUSES. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
