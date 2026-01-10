import { Home, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <a href="/" className="flex items-center gap-2 font-bold text-xl">
              <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-accent-foreground" />
              </div>
              <span>StudentNest</span>
            </a>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              The trusted platform for student housing. Find verified, safe, and affordable accommodations near your university.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {["Browse Listings", "How It Works", "Universities", "List Property", "Pricing"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Support</h4>
            <ul className="space-y-3">
              {["Help Center", "Contact Us", "FAQs", "Safety Tips", "Terms of Service"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-primary-foreground/70 text-sm">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>hello@studentnest.com</span>
              </li>
              <li className="flex items-center gap-3 text-primary-foreground/70 text-sm">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>1-800-STUDENT</span>
              </li>
              <li className="flex items-start gap-3 text-primary-foreground/70 text-sm">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>123 University Street<br />Boston, MA 02115</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/60 text-sm">
            © 2026 StudentNest. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Use", "Cookie Policy"].map((link) => (
              <a key={link} href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors text-sm">
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
