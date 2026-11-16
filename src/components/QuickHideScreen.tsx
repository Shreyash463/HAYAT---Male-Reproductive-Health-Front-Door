import React from 'react';
import { useApp } from '../store/AppContext';
import { Droplet, Moon, Activity, ArrowRight, Heart } from 'lucide-react';

export const QuickHideScreen: React.FC = () => {
  const { exitQuickHide, t } = useApp();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] p-4 sm:p-6 flex flex-col justify-between selection:bg-blue-100 font-sans">
      <div className="max-w-3xl mx-auto w-full pt-6">
        {/* Disguised Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">{t.wellnessTipsTitle}</h1>
              <p className="text-sm text-slate-600">{t.wellnessTipsSub}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={exitQuickHide}
            className="text-sm text-slate-600 hover:text-slate-900 px-4 min-h-[44px] rounded-xl border border-slate-300 hover:border-slate-400 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>{t.returnToHayat}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Harmless Wellness Cards */}
        <div className="mt-8 grid md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Droplet className="w-5 h-5" />
            </div>
            <h2 className="font-semibold text-slate-800 text-base">Optimal Hydration</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Drinking 2.5L of mineral water throughout the morning helps maintain focus and supports steady energy.
            </p>
            <div className="mt-auto pt-2">
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 w-3/4 rounded-full" />
              </div>
              <span className="text-xs text-slate-500 mt-1.5 inline-block">1.9L of 2.5L target</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Moon className="w-5 h-5" />
            </div>
            <h2 className="font-semibold text-slate-800 text-base">Circadian Rhythm</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Dimming screen lights 45 minutes before sleep supports natural evening rest and morning alertness.
            </p>
            <span className="mt-auto text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg w-fit">
              Healthy rhythm
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <h2 className="font-semibold text-slate-800 text-base">Active Movement</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              A 20-minute brisk walk after lunch helps maintain steady afternoon focus and cardiovascular ease.
            </p>
            <span className="mt-auto text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg w-fit">
              6,420 steps today
            </span>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-base text-slate-800 mb-2">Three daily micro-habits for sustained clarity</h3>
          <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
            <li>Step outside into natural daylight within 30 minutes of waking.</li>
            <li>Take a 90-second posture reset after every 50 minutes of desk work.</li>
            <li>Swap late-afternoon coffee for chamomile or cooled peppermint tea.</li>
          </ul>
        </div>
      </div>

      <div className="max-w-3xl mx-auto w-full pt-8 pb-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
        <span>Daily Health Magazine • Universal Reader</span>
        <button
          type="button"
          onClick={exitQuickHide}
          className="text-slate-700 hover:text-slate-950 underline font-medium min-h-[44px] px-2 cursor-pointer"
        >
          {t.returnToHayat}
        </button>
      </div>
    </div>
  );
};
