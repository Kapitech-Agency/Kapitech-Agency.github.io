import React, { useState } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Download, 
  Layers, 
  Users, 
  Receipt,
  FileCheck2
} from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { saveCrmLead, CrmLead } from '../../lib/crmStore';
import { saveAgencyProject, AgencyProject } from '../../lib/projectStore';
import { saveAgencyInvoice, AgencyInvoice } from '../../lib/financeStore';

export type MigrationTarget = 'clients' | 'projects' | 'invoices';

interface DataMigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTarget?: MigrationTarget;
}

export const DataMigrationModal: React.FC<DataMigrationModalProps> = ({
  isOpen,
  onClose,
  defaultTarget = 'clients'
}) => {
  const { language } = useLanguage();
  const [targetModule, setTargetModule] = useState<MigrationTarget>(defaultTarget);
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    let headers = '';
    let sampleRow = '';
    let fileName = `kapitech_${targetModule}_template.csv`;

    if (targetModule === 'clients') {
      headers = 'Client Name,Company,Email,Phone,Service Pillar,Deal Value IDR,Stage,Priority\n';
      sampleRow = 'Alexander Wright,Horizon Ventures,alex@horizon.com,+62 811-2233-4455,Web Development,75000000,new,high\n';
    } else if (targetModule === 'projects') {
      headers = 'Project Name,Client Name,Company,Email,Service Category,Budget IDR,Start Date,Target End Date,Team Lead\n';
      sampleRow = 'Fintech Mobile App,Marcus Thorne,Lumina Corp,m@lumina.com,Mobile App,95000000,2026-09-01,2026-10-30,Lead Full-Stack Tech\n';
    } else if (targetModule === 'invoices') {
      headers = 'Invoice Number,Client Name,Company,Email,Line Item Desc,Amount IDR,Status,Issue Date,Due Date\n';
      sampleRow = 'KAPI-INV-2026-901,Alexander Wright,Horizon Ventures,alex@horizon.com,Sprint 1 Frontend Architecture,37500000,sent,2026-09-01,2026-09-15\n';
    }

    const blob = new Blob([headers + sampleRow], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;
    setFile(uploaded);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content);
      parseCsvPreview(content);
    };
    reader.readAsText(uploaded);
  };

  const parseCsvPreview = (csv: string) => {
    const lines = csv.split('\n').filter(l => l.trim().length > 0);
    if (lines.length <= 1) {
      setPreviewRows([]);
      return;
    }
    const headers = lines[0].split(',').map(h => h.trim());
    const parsed = lines.slice(1, 6).map((line, idx) => {
      const values = line.split(',').map(v => v.trim());
      const obj: Record<string, string> = { id: `row_${idx}` };
      headers.forEach((h, i) => {
        obj[h] = values[i] || '';
      });
      return obj;
    });
    setPreviewRows(parsed);
  };

  const handleExecuteImport = () => {
    if (!rawText.trim()) {
      setStatusMessage({
        success: false,
        message: language === 'id' ? 'Silakan pilih file CSV terlebih dahulu.' : 'Please upload a CSV file first.'
      });
      return;
    }

    setParsing(true);
    setStatusMessage(null);

    try {
      const lines = rawText.split('\n').filter(l => l.trim().length > 0);
      if (lines.length <= 1) {
        throw new Error('CSV file is empty or missing data rows.');
      }

      let count = 0;
      const dataLines = lines.slice(1);

      if (targetModule === 'clients') {
        dataLines.forEach(line => {
          const cols = line.split(',').map(c => c.trim());
          if (cols.length >= 3 && cols[0]) {
            const lead: CrmLead = {
              id: 'crm_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
              clientName: cols[0],
              company: cols[1] || 'Enterprise Client',
              email: cols[2],
              phone: cols[3] || '',
              servicePillar: (cols[4] as any) || 'Web Development',
              dealValue: Number(cols[5]) || 45000000,
              stage: (cols[6] as any) || 'new',
              priority: (cols[7] as any) || 'medium',
              source: 'Referral',
              description: 'Migrated via enterprise CSV import utility.',
              assignedTo: 'Account Executive',
              notes: [
                {
                  id: 'n_' + Date.now(),
                  author: 'CSV Import Utility',
                  text: 'Migrated via enterprise CSV import utility.',
                  createdAt: new Date().toISOString()
                }
              ],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            saveCrmLead(lead);
            count++;
          }
        });
      } else if (targetModule === 'projects') {
        dataLines.forEach(line => {
          const cols = line.split(',').map(c => c.trim());
          if (cols.length >= 3 && cols[0]) {
            const proj: AgencyProject = {
              id: 'proj_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
              name: cols[0],
              clientName: cols[1] || 'Client',
              clientCompany: cols[2] || 'Company',
              clientEmail: cols[3] || 'client@example.com',
              serviceCategory: cols[4] || 'Web Development',
              budget: Number(cols[5]) || 65000000,
              progressPercent: 10,
              status: 'planning',
              startDate: cols[6] || new Date().toISOString().split('T')[0],
              targetEndDate: cols[7] || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              teamLead: cols[8] || 'Lead Full-Stack Tech',
              teamMembers: ['Senior Frontend Dev', 'UI/UX Specialist'],
              techStack: ['Next.js', 'TypeScript', 'Tailwind CSS'],
              milestones: [
                { id: 'm1', title: 'Sprint 1 Architecture', dueDate: '2026-09-15', completed: false }
              ],
              tasks: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            saveAgencyProject(proj);
            count++;
          }
        });
      } else if (targetModule === 'invoices') {
        dataLines.forEach(line => {
          const cols = line.split(',').map(c => c.trim());
          if (cols.length >= 4 && cols[0]) {
            const amount = Number(cols[5]) || 25000000;
            const tax = Math.round(amount * 0.11);
            const inv: AgencyInvoice = {
              id: 'inv_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
              invoiceNumber: cols[0],
              clientName: cols[1] || 'Client',
              clientCompany: cols[2] || 'Company',
              clientEmail: cols[3] || 'billing@example.com',
              items: [
                {
                  id: 'item_1',
                  description: cols[4] || 'Deliverable Milestone Billing',
                  quantity: 1,
                  unitPrice: amount,
                  amount: amount
                }
              ],
              subtotal: amount,
              taxPercent: 11,
              taxAmount: tax,
              total: amount + tax,
              currency: 'IDR',
              status: (cols[6] as any) || 'sent',
              issueDate: cols[7] || new Date().toISOString().split('T')[0],
              dueDate: cols[8] || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            saveAgencyInvoice(inv);
            count++;
          }
        });
      }

      setStatusMessage({
        success: true,
        message: language === 'id'
          ? `Sukses! Berhasil mengimpor ${count} data record ke sistem Kapitech.`
          : `Success! Successfully imported ${count} records into Kapitech AMS.`
      });
      setPreviewRows([]);
      setFile(null);
      setRawText('');
    } catch (err: any) {
      setStatusMessage({
        success: false,
        message: err.message || 'Gagal memproses file CSV.'
      });
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-2xl bg-[#0D0F12] border-0 sm:border sm:border-[#262930] rounded-none sm:rounded-2xl shadow-2xl z-10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-[#0D0F12]/95 backdrop-blur-md px-5 sm:px-6 py-4 border-b border-[#262930] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E60023]/15 text-[#FF1F3D] border border-[#E60023]/30 flex items-center justify-center shrink-0">
              <FileSpreadsheet size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">
                {language === 'id' ? 'Impor Data & Migrasi Skema' : 'Data Migration & CSV Import'}
              </h3>
              <p className="text-[11px] font-mono text-[#8A909D]">
                {language === 'id' ? 'Unggah file spreadsheet CSV dengan pemetaan otomatis' : 'Upload structured CSV templates with instant schema ingestion'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-lg bg-[#121418] text-[#8A909D] hover:text-white border border-[#262930] flex items-center justify-center transition-colors shrink-0 ml-3"
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
          <div>
            <label className="text-[11px] font-mono text-[#8A909D] uppercase block mb-2">
              {language === 'id' ? 'Pilih Modul Tujuan Migrasi' : 'Select Target Destination Module'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setTargetModule('clients');
                  setPreviewRows([]);
                }}
                className={`p-3 rounded-xl border flex flex-row sm:flex-col items-center gap-2 sm:gap-1.5 text-xs font-sans transition-all min-h-[44px] sm:min-h-[auto] ${
                  targetModule === 'clients'
                    ? 'bg-[#E60023]/15 border-[#E60023] text-white font-bold shadow-sm'
                    : 'bg-[#121418] border-[#262930] text-[#8A909D] hover:text-white'
                }`}
              >
                <Users size={16} className={targetModule === 'clients' ? 'text-[#FF1F3D]' : 'text-[#8A909D]'} />
                <span>{language === 'id' ? 'Klien & Leads' : 'Clients & Leads'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTargetModule('projects');
                  setPreviewRows([]);
                }}
                className={`p-3 rounded-xl border flex flex-row sm:flex-col items-center gap-2 sm:gap-1.5 text-xs font-sans transition-all min-h-[44px] sm:min-h-[auto] ${
                  targetModule === 'projects'
                    ? 'bg-[#E60023]/15 border-[#E60023] text-white font-bold shadow-sm'
                    : 'bg-[#121418] border-[#262930] text-[#8A909D] hover:text-white'
                }`}
              >
                <Layers size={16} className={targetModule === 'projects' ? 'text-[#FF1F3D]' : 'text-[#8A909D]'} />
                <span>{language === 'id' ? 'Proyek Sprint' : 'Active Projects'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTargetModule('invoices');
                  setPreviewRows([]);
                }}
                className={`p-3 rounded-xl border flex flex-row sm:flex-col items-center gap-2 sm:gap-1.5 text-xs font-sans transition-all min-h-[44px] sm:min-h-[auto] ${
                  targetModule === 'invoices'
                    ? 'bg-[#E60023]/15 border-[#E60023] text-white font-bold shadow-sm'
                    : 'bg-[#121418] border-[#262930] text-[#8A909D] hover:text-white'
                }`}
              >
                <Receipt size={16} className={targetModule === 'invoices' ? 'text-[#FF1F3D]' : 'text-[#8A909D]'} />
                <span>{language === 'id' ? 'Invoice & Transaksi' : 'Invoices & Billing'}</span>
              </button>
            </div>
          </div>

          {/* Template Download Utility */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#121418] border border-[#262930]">
            <div className="text-xs font-sans text-[#8A909D]">
              <span className="text-white font-semibold block">{language === 'id' ? 'Download Format Template Resmi' : 'Download Predefined Template'}</span>
              <span className="text-[11px] font-mono text-[#5C626E]">CSV format formatted for {targetModule}</span>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="h-9 px-3 rounded-lg bg-[#1E2128] hover:bg-[#262930] border border-[#262930] text-xs font-mono text-white flex items-center justify-center gap-1.5 transition-colors shrink-0 min-h-[36px]"
            >
              <Download size={13} className="text-emerald-400" />
              <span>Download .CSV</span>
            </button>
          </div>

          {/* Drag & Drop File Ingestion Area */}
          <div className="relative border-2 border-dashed border-[#262930] hover:border-[#E60023]/50 rounded-2xl p-6 text-center transition-colors bg-[#121418]/50">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload size={24} className="mx-auto text-[#8A909D] mb-2" />
            <p className="text-xs font-sans text-white font-semibold">
              {file ? file.name : language === 'id' ? 'Klik atau tarik file CSV ke sini' : 'Click or drag & drop CSV file here'}
            </p>
            <p className="text-[10px] font-mono text-[#5C626E] mt-1">
              Max file size 10MB • UTF-8 CSV Encoding
            </p>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div className={`p-3 rounded-xl border text-xs font-sans flex items-center gap-2 ${
              statusMessage.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {statusMessage.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{statusMessage.message}</span>
            </div>
          )}

          {/* Preview rows if available */}
          {previewRows.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono text-[#8A909D] uppercase">
                {language === 'id' ? 'Pratinjau 5 Baris Data Pertama' : 'Preview (First 5 Rows Ingested)'}
              </div>
              <div className="max-h-36 overflow-auto custom-scrollbar border border-[#262930] rounded-xl bg-[#121418] p-2 text-[10px] font-mono text-[#8A909D]">
                <pre>{JSON.stringify(previewRows, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-20 bg-[#0D0F12]/95 backdrop-blur-md px-5 sm:px-6 py-3.5 border-t border-[#262930] flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 min-h-[40px] rounded-xl bg-[#121418] hover:bg-[#1E2128] border border-[#262930] text-xs font-mono text-white transition-colors"
          >
            {language === 'id' ? 'Tutup' : 'Close'}
          </button>
          <button
            type="button"
            onClick={handleExecuteImport}
            disabled={parsing || !file}
            className="h-10 px-5 min-h-[40px] rounded-xl bg-[#E60023] hover:bg-[#FF1F3D] disabled:opacity-50 text-white text-xs font-mono font-bold shadow-lg shadow-[#E60023]/25 flex items-center gap-2 transition-all"
          >
            <FileCheck2 size={15} />
            <span>{parsing ? 'Processing...' : language === 'id' ? 'Mulai Impor Data' : 'Execute Import'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
