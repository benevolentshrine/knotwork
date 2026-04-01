import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { User, Cpu, Database, Settings2, FileText, Folder } from 'lucide-react';

export const themes = {
    brain: {
        bg: 'bg-rose-500',
        text: 'text-rose-500',
        color: '#f43f5e',
        icon: <Cpu size={14} />,
    },
    agent: {
        bg: 'bg-violet-500',
        text: 'text-violet-500',
        color: '#8b5cf6',
        icon: <User size={14} />,
    },
    source: {
        bg: 'bg-emerald-500',
        text: 'text-emerald-500',
        color: '#10b981',
        icon: <Database size={14} />,
    }
};

const NodeWrapper: React.FC<{
    type: keyof typeof themes;
    title: string;
    pillText?: string;
    colorOverride?: string | null;
}> = ({ type, title, pillText, colorOverride }) => {
    const theme = themes[type];
    const finalBorderColor = colorOverride || 'rgba(255,255,255,0.1)';

    return (
        <div 
            className="flex flex-col bg-[#18181B] rounded-xl shadow-xl min-w-[220px] max-w-[280px] group overflow-visible relative transition-all duration-200 hover:shadow-2xl"
            style={{ 
                border: `1.5px solid ${finalBorderColor}`, 
                boxShadow: colorOverride ? `0 0 15px ${colorOverride}40` : undefined 
            }}
        >
            
            {/* Header */}
            <div className={`flex items-center gap-3 p-3 border-b bg-white/[0.02] rounded-t-xl`} style={{ borderColor: colorOverride || 'rgba(255,255,255,0.05)' }}>
                <div className={`w-7 h-7 flex flex-shrink-0 items-center justify-center rounded-lg bg-black border border-white/10 ${theme.text} shadow-inner`} style={{ color: colorOverride || undefined }}>
                    {theme.icon}
                </div>
                <span className="text-white font-medium text-[13px] tracking-wide truncate">{title}</span>
            </div>

            {/* Content Area */}
            <div className="p-3 flex flex-col gap-2 bg-[#18181B] rounded-b-xl relative">
                {pillText && (
                    <div className="flex flex-col gap-1.5 mt-1">
                        <span className="text-white/30 text-[9px] uppercase font-bold tracking-widest pl-1">{type === 'agent' ? 'Instructions' : 'Model / File'}</span>
                        <div className="inline-flex items-center gap-2 bg-black/40 border border-white/5 rounded-lg px-2.5 py-1.5 text-[11px] text-gray-300">
                            {type === 'brain' ? <Settings2 size={12} className="text-white/40"/> : type === 'source' ? <FileText size={12} className="text-white/40"/> : <User size={12} className="text-white/40"/>}
                            <span className="font-medium tracking-tight truncate flex-1">{pillText}</span>
                        </div>
                    </div>
                )}
                
                {/* Glowing Handles, resting perfectly on the edge */}
                <Handle
                    type="target"
                    position={Position.Left}
                    className="!w-3.5 !h-3.5 !rounded-full !border-2 !border-[#18181B] !-left-[8px] transition-transform hover:scale-125 z-10"
                    style={{ backgroundColor: colorOverride || theme.color, boxShadow: `0 0 8px ${colorOverride || theme.color}80` }}
                />
                <Handle
                    type="source"
                    position={Position.Right}
                    className="!w-3.5 !h-3.5 !rounded-full !border-2 !border-[#18181B] !-right-[8px] transition-transform hover:scale-125 z-10"
                    style={{ backgroundColor: colorOverride || theme.color, boxShadow: `0 0 8px ${colorOverride || theme.color}80` }}
                />
            </div>
        </div>
    );
};

export const BrainNode = memo(({ data }: NodeProps) => (
    <NodeWrapper type="brain" title={data.label || 'Neural Engine'} pillText={data.model || 'Phi-3-Mini'} colorOverride={data.colorOverride} />
));

export const AgentNode = memo(({ data }: NodeProps) => (
    <NodeWrapper type="agent" title={data.name || 'Nova-Prime'} pillText={data.role || 'Strategic reasoning.'} colorOverride={data.colorOverride} />
));

export const SourceNode = memo(({ data }: NodeProps) => (
    <NodeWrapper type="source" title={data.filename || 'Knowledge Base'} pillText={data.extension || '.pdf'} colorOverride={data.colorOverride} />
));

export const GroupNode = memo(({ data, selected }: NodeProps) => (
    <div 
        className={`w-full h-full bg-white/[0.02] rounded-2xl border-[1.5px] transition-colors ${selected ? 'border-[#007acc]' : 'border-dashed border-white/20 hover:border-white/30'}`}
    >
        <div className="absolute -top-3 left-6 bg-[#18181B] px-3 py-1 text-[#808080] text-[11px] font-bold uppercase tracking-widest border border-[#333] rounded-md shadow-lg flex items-center gap-2">
            <Folder size={12} className="text-[#007acc]" />
            <span className="text-white/90">{data.label || 'System Group'}</span>
        </div>
    </div>
));
