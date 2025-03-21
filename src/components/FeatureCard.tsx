interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  delay?: number; // ✅ Ensures delay is optional
}

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }: FeatureCardProps) => {
  return (
    <div 
      className="rounded-2xl p-8 bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="rounded-full bg-red-100 w-16 h-16 flex items-center justify-center mb-6">
        <Icon className="text-red-500 w-8 h-8" />
      </div>
      <h3 className="text-2xl font-semibold mb-4">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default FeatureCard;