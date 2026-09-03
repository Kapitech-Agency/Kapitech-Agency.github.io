import React, { useState } from 'react';
import { 
  Briefcase, 
  X, 
  Check, 
  DollarSign, 
  Building2, 
  User, 
  Calendar, 
  Layers, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { ContactSubmission } from '../../../lib/submissions';
import { 
  convertInquiryToCrmLead, 
  CrmStage, 
  CrmServicePillar, 
  formatIDR 
} from '../../../lib/crmStore';
import { useLanguage } from '../../../lib/LanguageContext';
import { formatAmount, getActiveCurrency, CurrencyCode } from '../../../lib/currency';

interface ConvertToCrmModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: ContactSubmission;
  onConverted: (leadId: string, dealValue: number) => void;
}

export const ConvertToCrmModal: React.FC<ConvertToCrmModalProps> = ({
  isOpen,
  onClose,
  submission,
  onConverted
}) => {
  const { language } = useLanguage();
  const currency: CurrencyCode = getActiveCurrency();

  // Auto-calculate smart default deal value
  const calculateDefaultValue = () => {
    if (submission.budget) {
      const b = submission.budget.toLowerCase();
      if (b.includes('25,000') || b.includes('50,000') || b.includes('100jt') || b.includes('100m')) {
        return 120000000;
      } else if (b.includes('10,000') || b.includes('25,000') || b.includes('50jt')) {
        return 75000000;
      } else if (b.includes('5,000') || b.includes('15,000') || b.includes('25jt')) {
        return 45000000;
      }
    }
    return 35000000;
  };

  const calculateDefaultPillar = (): CrmServicePillar => {
    const servicesJoined = (submission.services || []).join(' ').toLowerCase() + ' ' + (submission.specialty || '').toLowerCase();
    if (servicesJoined.includes('ui/ux') || servicesJoined.includes('design') || servicesJoined.includes('figma')) {
      return 'UI/UX Design';
    } else if (servicesJoined.includes('mobile') || servicesJoined.includes('app') || servicesJoined.includes('ios') || servicesJoined.includes('android')) {
      return 'Mobile App';
    } else if (servicesJoined.includes('brand') || servicesJoined.includes('logo') || servicesJoined.includes('identity')) {
      return 'Branding & Identity';
    } else if (servicesJoined.includes('ai') || servicesJoined.includes('cloud') || servicesJoined.includes('machine learning')) {
      return 'AI & Cloud Solutions';
    } else if (servicesJoined.includes('mvp') || servicesJoined.includes('saas') || servicesJoined.includes('prototype')) {
      return 'Digital Product MVP';
    }
    return 'Web Development';
  };

  const [dealValue, setDealValue] = useState<number>(calculateDefaultValue());
  const [stage, setStage] = useState<CrmStage>('new');
  const [pillar, setPillar] = useState<CrmServicePillar>(calculateDefaultPillar());
  const [assignedTo, setAssignedTo] = useState<string>('Lead Full-Stack Tech');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConvert = () => {
    setIsSubmitting(true);
    try {
      const res = convertInquiryToCrmLead(submission, dealValue, {
        stage,
        pillar,
        assignedTo
      });
      if (res.success) {
        onConverted(res.lead.id, res.lead.dealValue);
        onClose();
      }
    } catch (err) {
      console.error('Failed to convert inquiry to CRM lead:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const servicePillars: CrmServicePillar[] = [
    'Web Development',
    'UI/UX Design',
    'Mobile App',
    'Branding & Identity',
    'AI & Cloud Solutions',
    'Digital Product MVP'
  ];

  const stages: { value: CrmStage; labelId: string; labelEn: string; desc: string }[] = [
    { value: 'new', labelId: 'Lead Baru (Inbound)', labelEn: 'New Lead Inbound', desc: 'Brief masuk menunggu kualifikasi' },
    { value: 'contacted', labelId: 'Discovery Call', labelEn: 'Discovery Call', desc: 'Sudah dihubungi & dijadwalkan' },
    { value: 'proposal', labelId: 'Proposal & Scope', labelEn: 'Proposal & Scope', desc: 'RAB & Spesifikasi dikirim' },
    { value: 'negotiation', labelId: 'Negosiasi SOW', labelEn: 'Contract Negotiation', desc: 'Finalisasi kontrak & pembayaran DP' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-[rgba(255,255,255,0.07)] flex items-center justify-between bg-[#111318]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Briefcase size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <span>{language === 'id' ? 'Konversi ke Agency CRM Pipeline' : 'Convert to Agency CRM Pipeline'}</span>
                <Sparkles size={14} className="text-emerald-400" />
              </h3>
              <p className="text-xs text-[#8A94A6] font-mono">
                {language === 'id' ? 'Sinkronisasi prospek klien ke sistem tracking deal agensi.' : 'Bridge inbound brief into an active sales pipeline opportunity.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#181B22] hover:bg-[#21252F] text-[#8A94A6] hover:text-white transition-colors flex items-center justify-center border border-[rgba(255,255,255,0.07)]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh] custom-scrollbar">
          
          {/* Client Summary Card */}
          <div className="p-4 rounded-xl bg-[#181B22] border border-[rgba(255,255,255,0.07)] grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] font-mono text-[#8A94A6] block mb-0.5">{language === 'id' ? 'Nama Klien' : 'Client Name'}</span>
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <User size={13} className="text-emerald-400" />
                {submission.fullName}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#8A94A6] block mb-0.5">{language === 'id' ? 'Perusahaan / Organisasi' : 'Company / Brand'}</span>
              <span className="text-xs font-medium text-[#D0D4DC] flex items-center gap-1.5">
                <Building2 size={13} className="text-emerald-400" />
                {submission.company || 'Individual Client'}
              </span>
            </div>
          </div>

          {/* Deal Value Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-[#8A94A6] flex items-center gap-1.5">
                <DollarSign size={13} className="text-emerald-400" />
                <span>{language === 'id' ? 'Estimasi Nilai Kontrak (Deal Value in IDR)' : 'Estimated Deal Value (IDR)'}</span>
              </label>
              <span className="text-[11px] font-mono font-bold text-emerald-400">
                {formatAmount(dealValue, currency)}
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                min="1000000"
                step="1000000"
                value={dealValue}
                onChange={(e) => setDealValue(Number(e.target.value) || 0)}
                className="w-full pl-4 pr-16 py-2.5 bg-[#181B22] border border-[rgba(255,255,255,0.08)] rounded-xl text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[#64748B]">
                IDR
              </span>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {[25000000, 45000000, 75000000, 120000000, 200000000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDealValue(preset)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-colors border ${
                    dealValue === preset
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                      : 'bg-[#181B22] text-[#8A94A6] border-white/5 hover:text-white'
                  }`}
                >
                  {formatIDR(preset)}
                </button>
              ))}
            </div>
          </div>

          {/* Service Pillar Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#8A94A6] flex items-center gap-1.5">
              <Layers size={13} className="text-emerald-400" />
              <span>{language === 'id' ? 'Pilar Layanan Agensi' : 'Agency Service Pillar'}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {servicePillars.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPillar(p)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-mono transition-all ${
                    pillar === p
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40 font-bold shadow-sm'
                      : 'bg-[#181B22] text-[#8A94A6] border-white/5 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Target Stage Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#8A94A6] flex items-center gap-1.5">
              <Calendar size={13} className="text-emerald-400" />
              <span>{language === 'id' ? 'Tahapan Awal di CRM' : 'Initial CRM Stage'}</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {stages.map((stg) => (
                <button
                  key={stg.value}
                  type="button"
                  onClick={() => setStage(stg.value)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    stage === stg.value
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40 font-bold shadow-sm'
                      : 'bg-[#181B22] text-[#8A94A6] border-white/5 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-sans font-semibold">
                    {language === 'id' ? stg.labelId : stg.labelEn}
                  </div>
                  <div className="text-[10px] font-mono text-[#64748B] mt-0.5">
                    {stg.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Assignee */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#8A94A6] flex items-center gap-1.5">
              <User size={13} className="text-emerald-400" />
              <span>{language === 'id' ? 'Penanggung Jawab (Owner)' : 'Assigned Team Lead'}</span>
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#181B22] border border-[rgba(255,255,255,0.08)] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            >
              <option value="Lead Full-Stack Tech">Lead Full-Stack Tech (Engineering)</option>
              <option value="Senior UI/UX Designer">Senior UI/UX Designer (Product)</option>
              <option value="Technical Project Manager">Technical Project Manager (Delivery)</option>
              <option value="Business Director">Business Director (Account Closing)</option>
            </select>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[rgba(255,255,255,0.07)] bg-[#111318] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#181B22] text-xs font-mono text-[#8A94A6] hover:text-white border border-white/5 transition-colors"
          >
            {language === 'id' ? 'Batal' : 'Cancel'}
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConvert}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <span>{language === 'id' ? 'Konfirmasi & Buat Lead CRM' : 'Confirm & Create CRM Deal'}</span>
            <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
};
