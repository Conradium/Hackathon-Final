
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }: FeatureCardProps) => {
  return (
    <div 
      className="scroll-reveal feature-card rounded-2xl p-6 glass-card"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="rounded-full bg-primary/10 w-14 h-14 flex items-center justify-center mb-5">
        <Icon className="text-primary w-7 h-7" />
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default FeatureCard;
