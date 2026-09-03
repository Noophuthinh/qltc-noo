import React, { useState } from 'react';
import { 
  Settings, 
  Download, 
  Upload, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Check, 
  FileSpreadsheet, 
  ShieldCheck,
  Server,
  Coins,
  Edit3,
  RefreshCw,
  Trash
} from 'lucide-react';
import { resetDatabase, importDatabase, cleanWipeData, syncTHS } from '../utils/api';
import { formatVND } from '../utils/formatters';

export default function SettingsPage({
  incomeSources = [],
  onCreateIncomeSource,
  onEditIncomeSource,
  onDeleteIncomeSource,
  onSyncTHS,
  isSyncingTHS,
  onReload
}) {
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceCat, setNewSourceCat] = useState('Đầu tư / Kinh doanh');
  const [newSourceTarget, setNewSourceTarget] = useState('');

  const handleAddSource = async (e) => {
    e.preventDefault();
    if (!newSourceName.trim()) return;
    await onCreateIncomeSource({
      name: newSourceName.trim(),
      category: newSourceCat.trim(),
      monthlyTarget: Number(newSourceTarget || 0),
      color: '#34d399'
    });
    setNewSourceName('');
    setNewSourceTarget('');
  };

  const handleExportJSON = () => {
    window.location.href = '/api/backup/export';
  };

  const handleExportCSV = () => {
    window.location.href = '/api/export/csv';
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        await importDatabase(json);
        alert('Đã khôi phục dữ liệu thành công!');
        onReload();
      } catch (err) {
        alert('File không hợp lệ: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleCleanWipe = async () => {
    if (window.confirm('⚠️ Bạn có chắc chắn muốn XÓA SẠCH toàn bộ dữ liệu giao dịch hiện tại? Dữ liệu sau khi xóa sẽ bắt đầu từ trạng thái sạch 0đ.')) {
      await cleanWipeData();
      alert('Đã xóa sạch dữ liệu giao dịch thành công!');
      onReload();
    }
  };

  const handleReset = async () => {
    if (window.confirm('Khôi phục lại cấu hình mặc định?')) {
      await resetDatabase();
      alert('Đã khôi phục thành công!');
      onReload();
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Cài Đặt & Quản Lý Dữ Liệu</h2>
          <p className="text-xs text-slate-400 mt-1">
            Tùy chỉnh các nguồn thu nhập cá nhân (Lương, Quỹ THS, Quỹ Thành 7), đồng bộ online và sao lưu
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-500/30">
          <Server className="w-4 h-4" />
          <span>Server Port: 8889 / 8888</span>
        </div>
      </div>

      {/* Section 1: Quản lý Nguồn Thu Nhập */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800/80 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              Nguồn Thu Nhập Cá Nhân
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Bạn có thể nhấp vào ✏️ để sửa tên, mức lương cứng hoặc mục tiêu thu nhập tháng
            </p>
          </div>
          <button
            onClick={onSyncTHS}
            disabled={isSyncingTHS}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-indigo-600/30 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingTHS ? 'animate-spin' : ''}`} />
            <span>Đồng bộ từ THS Chrono</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {incomeSources.map((s, idx) => (
            <div 
              key={s.id} 
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs"
                  style={{ backgroundColor: `${s.color || '#10b981'}25`, color: s.color || '#10b981' }}
                >
                  #{idx + 1}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span>{s.name}</span>
                    {s.syncUrl && (
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-mono">
                        THS Online
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{s.category}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">Lương/Mục tiêu: {formatVND(s.monthlyTarget || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                {/* Sửa nguồn thu / lương */}
                <button
                  onClick={() => onEditIncomeSource(s)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors"
                  title="Chỉnh sửa nguồn thu / số tiền lương"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                {idx >= 4 && (
                  <button
                    onClick={() => onDeleteIncomeSource(s.id)}
                    className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 transition-colors"
                    title="Xóa nguồn thu"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add new Income Source */}
        <div className="pt-3 border-t border-slate-800/80">
          <form onSubmit={handleAddSource} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newSourceName}
              onChange={(e) => setNewSourceName(e.target.value)}
              placeholder="Tên nguồn thu mới..."
              className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <input
              type="number"
              value={newSourceTarget}
              onChange={(e) => setNewSourceTarget(e.target.value)}
              placeholder="Mức lương / mục tiêu tháng (VNĐ)"
              className="w-full sm:w-56 bg-slate-950 border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              value={newSourceCat}
              onChange={(e) => setNewSourceCat(e.target.value)}
              placeholder="Phân loại..."
              className="w-full sm:w-44 bg-slate-950 border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Nguồn</span>
            </button>
          </form>
        </div>
      </div>

      {/* Section 2: Quản lý Dữ liệu & Xóa sạch */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800/80 p-6 shadow-xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Sao Lưu & Quản Lý Dữ Liệu
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Dữ liệu luôn được lưu an toàn trong file `data/finance_db.json`.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Export JSON */}
          <button
            onClick={handleExportJSON}
            className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 flex flex-col items-center text-center space-y-2 group transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Download className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-200">Tải Bản Sao Lưu (JSON)</span>
            <span className="text-[10px] text-slate-500">Lưu toàn bộ giao dịch & cấu hình</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 flex flex-col items-center text-center space-y-2 group transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-200">Xuất File Excel / CSV</span>
            <span className="text-[10px] text-slate-500">Mở và tính toán trong Excel</span>
          </button>

          {/* Import JSON */}
          <label className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/50 flex flex-col items-center text-center space-y-2 group cursor-pointer transition-all">
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-200">Nhập File Sao Lưu</span>
            <span className="text-[10px] text-slate-500">Khôi phục từ file JSON</span>
          </label>
        </div>

        {/* Action Bar: Xóa sạch dữ liệu & Reset */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-rose-400">Xóa hết toàn bộ giao dịch & làm sạch dữ liệu</div>
            <div className="text-[10px] text-slate-500">Đặt lại số dư các ví về 0 và xóa sạch giao dịch mẫu</div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCleanWipe}
              className="px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-bold border border-rose-800/60 transition-colors flex items-center space-x-1.5 shadow-sm"
            >
              <Trash className="w-3.5 h-3.5" />
              <span>Xóa Sạch Dữ Liệu</span>
            </button>
            <button
              onClick={handleReset}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi phục mẫu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
