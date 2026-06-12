const StatsCard = ({ icon: Icon, label, value, color = 'terracotta' }) => {
  const colorMap = {
    terracotta: { bg: 'bg-[#C17A5E]/10', text: 'text-[#C17A5E]', border: 'border-[#C17A5E]/20' },
    sage: { bg: 'bg-[#8FAA7B]/10', text: 'text-[#8FAA7B]', border: 'border-[#8FAA7B]/20' },
    amber: { bg: 'bg-[#D4A853]/10', text: 'text-[#D4A853]', border: 'border-[#D4A853]/20' },
    rose: { bg: 'bg-[#D4694A]/10', text: 'text-[#D4694A]', border: 'border-[#D4694A]/20' },
    brown: { bg: 'bg-[#8B6F5E]/10', text: 'text-[#8B6F5E]', border: 'border-[#8B6F5E]/20' },
  };

  const colors = colorMap[color] || colorMap.terracotta;

  return (
    <div className={`bg-white rounded-2xl p-5 border border-[#E0D3C5] shadow-sm hover:shadow-md transition-all duration-200`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center border ${colors.border}`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
      </div>
      <div className="text-2xl font-bold text-[#3E2F24]">{value}</div>
      <p className="text-sm text-[#6B5A4E] mt-1">{label}</p>
    </div>
  );
};

export default StatsCard;