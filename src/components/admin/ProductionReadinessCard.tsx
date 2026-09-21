import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Check, RefreshCw, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/apiClient';

type Props = { language: 'id' | 'en' };

const labels: Array<[string, string]> = [
  ['runtime', 'Runtime'],
  ['encryption', 'Encryption'],
  ['postgres', 'PostgreSQL'],
  ['migrations', 'Migrations'],
  ['mfa', 'MFA'],
  ['backupDr', 'Backup / DR'],
  ['documentStorage', 'Documents'],
  ['notifications', 'Notifications']
];

export const ProductionReadinessCard: React.FC<Props> = ({ language }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ productionReady: boolean; gates: Record<string, boolean>; status: any } | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.system.productionReadiness();
      if (response.data) {
        setResult({
          productionReady: Boolean(response.data.productionReady),
          gates: response.data.gates || {},
          status: response.data.status || { datasource: 'unknown' }
        });
      } else {
        setResult(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <div className="p-5 rounded-2xl bg-[#181B22] border border-white/[0.07] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck size={15} className="text-[#E50914]" />
            <span>Production Readiness Gate</span>
          </h3>
          <p className="text-[11px] text-[#8A94A6] font-mono mt-1">
            {language === 'id' ? 'Status server-side dari seluruh kontrol wajib sebelum cutover PostgreSQL.' : 'Server-side status of all required controls before PostgreSQL cutover.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={'inline-flex items-center min-h-[30px] px-2.5 rounded-lg border text-[10px] font-mono font-bold ' + (result?.productionReady ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300' : 'border-amber-500/30 bg-amber-500/5 text-amber-300')}>
            {result?.productionReady ? 'Production Ready' : language === 'id' ? 'Cutover Ditahan' : 'Cutover Blocked'}
          </span>
          <button type="button" onClick={() => void refresh()} disabled={loading} className="min-h-[30px] px-2.5 rounded-lg bg-[#262930] border border-white/[0.08] text-[#CBD5E1] text-[10px] font-mono font-bold disabled:opacity-50" aria-label="Refresh production readiness">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
      {result && (
        <>
          {result.status?.reason && <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] text-amber-200 font-mono">{result.status.reason}</div>}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {labels.map(([key, label]) => {
              const ready = Boolean(result.gates[key]);
              return <div key={key} className="flex items-center justify-between gap-2 rounded-xl bg-[#111318] border border-white/[0.07] px-3 py-2.5">
                <span className="text-[10px] text-[#8A94A6] font-mono">{label}</span>
                {ready ? <Check size={14} className="text-emerald-300 shrink-0" /> : <AlertCircle size={14} className="text-amber-300 shrink-0" />}
              </div>;
            })}
          </div>
          <div className="text-[10px] text-[#64748B] font-mono">
            {language === 'id' ? 'Datasource: ' + String(result.status?.datasource || 'unknown') + '. Gate dihitung server-side.' : 'Datasource: ' + String(result.status?.datasource || 'unknown') + '. Gates are evaluated server-side.'}
          </div>
        </>
      )}
      {!result && !loading && <div className="text-[11px] text-[#64748B] font-mono">{language === 'id' ? 'Status readiness belum tersedia.' : 'Readiness status is unavailable.'}</div>}
    </div>
  );
};