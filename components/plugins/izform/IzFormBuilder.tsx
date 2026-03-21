import React from 'react';
import { GripVertical, Plus, Trash2, ArrowRight } from 'lucide-react';

export default function IzFormBuilder() {
  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#f7f9fb]">
      {/* Left Pane: Editor */}
      <div className="w-full lg:w-[55%] xl:w-[60%] overflow-y-auto p-6 lg:p-8 space-y-8 bg-[#f7f9fb]">
        {/* Form Basics Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#bbcabf]/20">
          <div className="space-y-6">
            <div>
              <label className="block text-slate-500 text-sm font-semibold mb-2 uppercase tracking-wider">Form Name</label>
              <input 
                className="w-full bg-[#f7f9fb] p-3 rounded-lg border border-[#bbcabf]/20 focus:ring-2 focus:ring-[#4edea3]/30 focus:border-[#006c49] outline-none transition-all text-slate-900 font-medium" 
                type="text" 
                defaultValue="Client Onboarding Survey"
              />
            </div>
            <div>
              <label className="block text-slate-500 text-sm font-semibold mb-2 uppercase tracking-wider">Description</label>
              <textarea 
                className="w-full bg-[#f7f9fb] p-3 rounded-lg border border-[#bbcabf]/20 focus:ring-2 focus:ring-[#4edea3]/30 focus:border-[#006c49] outline-none transition-all text-slate-900" 
                rows={2}
                defaultValue="Gather essential information for initial client strategy sessions."
              />
            </div>
          </div>
        </div>

        {/* Fields Management Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-slate-900 text-lg font-semibold font-['Inter']">Fields</h2>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-[#10b981] text-[#10b981] font-bold hover:bg-[#10b981]/10 transition-all active:scale-95">
              <Plus size={20} />
              Add Field
            </button>
          </div>

          {/* Draggable List */}
          <div className="space-y-3">
            {/* Field Row 1 */}
            <div className="group bg-white rounded-lg p-4 flex items-center gap-4 border border-[#bbcabf]/20 hover:shadow-md transition-all">
              <GripVertical className="text-slate-400 cursor-grab active:cursor-grabbing" size={20} />
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="bg-[#f7f9fb] p-2 rounded-lg border border-[#bbcabf]/20 focus:border-[#006c49] outline-none text-sm text-slate-900" type="text" defaultValue="Full Name"/>
                <select className="bg-[#f7f9fb] p-2 rounded-lg border border-[#bbcabf]/20 focus:border-[#006c49] outline-none text-sm text-slate-900">
                  <option defaultValue="Text">Text</option>
                  <option>Email</option>
                  <option>Phone</option>
                  <option>Number</option>
                </select>
              </div>
              <div className="flex items-center gap-4 px-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input defaultChecked className="rounded border-slate-300 text-[#006c49] focus:ring-[#006c49] h-4 w-4" type="checkbox"/>
                  <span className="text-xs font-semibold text-slate-500 uppercase">Required</span>
                </label>
                <button className="text-red-400 hover:text-red-500 transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            {/* Field Row 2 */}
            <div className="group bg-white rounded-lg p-4 flex items-center gap-4 border border-[#bbcabf]/20 hover:shadow-md transition-all">
              <GripVertical className="text-slate-400 cursor-grab" size={20} />
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="bg-[#f7f9fb] p-2 rounded-lg border border-[#bbcabf]/20 focus:border-[#006c49] outline-none text-sm text-slate-900" type="text" defaultValue="Primary Email"/>
                <select className="bg-[#f7f9fb] p-2 rounded-lg border border-[#bbcabf]/20 focus:border-[#006c49] outline-none text-sm text-slate-900" defaultValue="Email">
                  <option>Text</option>
                  <option value="Email">Email</option>
                  <option>Phone</option>
                  <option>Number</option>
                </select>
              </div>
              <div className="flex items-center gap-4 px-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input defaultChecked className="rounded border-slate-300 text-[#006c49] focus:ring-[#006c49] h-4 w-4" type="checkbox"/>
                  <span className="text-xs font-semibold text-slate-500 uppercase">Required</span>
                </label>
                <button className="text-red-400 hover:text-red-500 transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            {/* Field Row 3 */}
            <div className="group bg-white rounded-lg p-4 flex items-center gap-4 border border-[#bbcabf]/20 hover:shadow-md transition-all">
              <GripVertical className="text-slate-400 cursor-grab" size={20} />
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="bg-[#f7f9fb] p-2 rounded-lg border border-[#bbcabf]/20 focus:border-[#006c49] outline-none text-sm text-slate-900" type="text" defaultValue="Company Size"/>
                <select className="bg-[#f7f9fb] p-2 rounded-lg border border-[#bbcabf]/20 focus:border-[#006c49] outline-none text-sm text-slate-900" defaultValue="Number">
                  <option>Text</option>
                  <option>Email</option>
                  <option>Phone</option>
                  <option value="Number">Number</option>
                </select>
              </div>
              <div className="flex items-center gap-4 px-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input className="rounded border-slate-300 text-[#006c49] focus:ring-[#006c49] h-4 w-4" type="checkbox"/>
                  <span className="text-xs font-semibold text-slate-500 uppercase">Required</span>
                </label>
                <button className="text-red-400 hover:text-red-500 transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-10 flex items-center justify-end gap-4 border-t border-slate-200">
          <button className="px-6 py-3 text-slate-600 font-semibold hover:bg-slate-100 transition-all rounded-lg">Cancel</button>
          <button className="px-8 py-3 bg-gradient-to-br from-[#10b981] to-[#006c49] text-white font-bold rounded-lg shadow-lg active:scale-95 transition-all">Save Form</button>
        </div>
      </div>

      {/* Right Pane: Live Preview */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] bg-[#f2f4f6] items-center justify-center p-8 relative overflow-hidden">
        {/* Abstract background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-br from-[#10b981] to-[#006c49] blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#d5e0f8] blur-3xl"></div>
        </div>

        {/* Glassmorphism Device Frame */}
        <div 
          className="w-full max-w-[380px] h-[720px] rounded-[3rem] p-4 shadow-2xl relative z-[1] flex flex-col border border-white/80"
          style={{
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Notch */}
          <div className="w-32 h-6 bg-slate-200/50 backdrop-blur-sm self-center rounded-b-2xl mb-8 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mx-1"></div>
            <div className="w-8 h-1 rounded-full bg-slate-400 mx-1"></div>
          </div>

          {/* Device Content Area */}
          <div className="flex-1 px-6 overflow-y-auto space-y-8 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-300">
            <div className="space-y-1">
              <h3 className="text-slate-900 text-2xl font-bold font-['Inter'] leading-tight">Client Onboarding Survey</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Gather essential information for initial client strategy sessions.</p>
            </div>

            <form className="space-y-6">
              <div className="space-y-2">
                <label className="text-slate-500 text-xs font-bold uppercase tracking-widest">Full Name</label>
                <input className="w-full bg-white/80 border-none rounded-xl p-4 text-slate-900 placeholder-slate-400 shadow-sm" disabled placeholder="John Doe" type="text"/>
              </div>
              <div className="space-y-2">
                <label className="text-slate-500 text-xs font-bold uppercase tracking-widest">Primary Email</label>
                <input className="w-full bg-white/80 border-none rounded-xl p-4 text-slate-900 placeholder-slate-400 shadow-sm" disabled placeholder="john@example.com" type="email"/>
              </div>
              <div className="space-y-2">
                <label className="text-slate-500 text-xs font-bold uppercase tracking-widest">Company Size</label>
                <input className="w-full bg-white/80 border-none rounded-xl p-4 text-slate-900 placeholder-slate-400 shadow-sm" disabled placeholder="50" type="number"/>
              </div>

              <div className="pt-8">
                <button className="w-full bg-gradient-to-br from-[#10b981] to-[#006c49] text-white py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity" type="button">
                  Submit
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>
          </div>

          {/* Home indicator */}
          <div className="w-24 h-1 bg-slate-400 self-center mb-2 mt-4 rounded-full"></div>
        </div>

        {/* Status Badge */}
        <div className="absolute top-8 right-8 bg-[#4edea3]/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#10b981]/20 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
          <span className="text-[#00422b] text-[11px] font-bold uppercase tracking-wider">Live Preview</span>
        </div>
      </div>
    </div>
  );
}
