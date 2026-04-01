import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  addEdge, Background, Connection, Edge, Node,
  applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange,
  ReactFlowProvider, useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';

import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';

import { BrainNode, AgentNode, SourceNode, GroupNode, themes } from './CustomNodes';
import { 
  Folder, File, Play, ChevronLeft,
  MessageSquare, Terminal as TerminalIcon,
  X, MousePointer2, Hand, BoxSelect, Palette,
  PanelLeft, PanelBottom, PanelRight,
  TestTubeDiagonal, Send
} from 'lucide-react';

const nodeTypes = {
  brain: BrainNode,
  agent: AgentNode,
  source: SourceNode,
  groupNode: GroupNode,
};

const KnotworkLogo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="11" height="11" rx="2.5" stroke="#FFFFFF" strokeWidth="2.5" />
    <rect x="10" y="10" width="11" height="11" rx="2.5" stroke="#FFFFFF" strokeWidth="2.5" />
  </svg>
);

const FramelessTitlebar: React.FC<{
  leftOpen: boolean; toggleLeft: () => void;
  bottomOpen: boolean; toggleBottom: () => void;
  rightOpen: boolean; toggleRight: () => void;
  onMenuAction: (action: string) => void;
}> = ({ leftOpen, toggleLeft, bottomOpen, toggleBottom, rightOpen, toggleRight, onMenuAction }) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const menus = {
    File: ['New Workspace', 'Open Folder', 'Save Canvas', 'Export Layout JSON', 'Export as GGUF', 'Exit Knotwork'],
    Edit: ['Undo', 'Redo', 'Cut Node', 'Copy Node', 'Paste Node', 'Preferences'],
    View: ['Zoom In', 'Zoom Out', 'Fit Canvas to Screen', 'Toggle Sidebars', 'Theme Settings'],
    Help: ['Documentation', 'Report Issue', 'About Antigravity']
  };

  const handleMenuClick = (opt: string) => {
    onMenuAction(opt);
    setActiveMenu(null);
  };

  const appWindow = getCurrentWindow();

  return (
    <div 
      className="h-[35px] bg-[#181818] flex items-center justify-between w-full select-none text-[13px] text-[#CCCCCC] shrink-0 border-b border-black relative z-[100]"
      data-tauri-drag-region="true"
    >
      <div className="flex items-center h-full" data-tauri-drag-region="true">
        <div className="ml-3 mr-3 pointer-events-none flex items-center justify-center text-white">
          <KnotworkLogo />
        </div>
        <div className="flex items-center h-full pointer-events-auto relative" onClick={(e) => e.stopPropagation()}>
          {Object.entries(menus).map(([item, options]) => (
            <div key={item} className="relative h-full flex items-center">
              <div 
                className={`px-2.5 py-1 mx-0.5 rounded-md cursor-default transition-none text-[13px] font-medium tracking-wide flex items-center ${activeMenu === item ? 'bg-[#333333] text-white' : 'hover:bg-[#ffffff1a] hover:text-white'}`}
                onClick={() => setActiveMenu(activeMenu === item ? null : item)}
                onMouseEnter={() => { if (activeMenu && activeMenu !== item) setActiveMenu(item) }}
              >
                {item}
              </div>

              {activeMenu === item && (
                <div className="absolute top-[35px] left-0 bg-[#252526] border border-[#454545] shadow-2xl py-1.5 min-w-[220px] rounded-lg z-[200] flex flex-col">
                  {options.map((opt) => (
                    opt === 'Exit Knotwork' || opt === 'Preferences' || opt === 'Theme Settings' || opt === 'About Antigravity' || opt === 'Export as GGUF' ? (
                       <React.Fragment key={opt}>
                         {opt === 'Exit Knotwork' || opt === 'Export as GGUF' || opt === 'Preferences' || opt === 'Theme Settings' || opt === 'About Antigravity' ? <div className="h-[1px] bg-[#454545] my-1 mx-2" /> : null}
                         <div onClick={() => handleMenuClick(opt)} className="px-6 py-1.5 hover:bg-[#007acc] hover:text-white cursor-default text-[13px] transition-none text-[#CCCCCC] flex justify-between">
                           <span>{opt}</span>
                         </div>
                       </React.Fragment>
                    ) : (
                       <div key={opt} onClick={() => handleMenuClick(opt)} className="px-6 py-1.5 hover:bg-[#007acc] hover:text-white cursor-default text-[13px] transition-none text-[#CCCCCC] flex justify-between">
                         <span>{opt}</span>
                       </div>
                    )
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center h-full pointer-events-none absolute left-1/2 -translate-x-1/2">
        <span className="text-[#808080] text-[12px] font-medium tracking-wide">knotwork - local_workspace</span>
      </div>

      <div className="flex items-center h-full pointer-events-auto">
        <div className="flex items-center gap-1.5 mr-4 opacity-80">
          <PanelLeft size={16} onClick={toggleLeft} className={`cursor-pointer hover:text-white ${leftOpen ? 'text-white' : 'text-[#666]'}`} />
          <PanelBottom size={16} onClick={toggleBottom} className={`cursor-pointer hover:text-white ${bottomOpen ? 'text-white' : 'text-[#666]'}`} />
          <PanelRight size={16} onClick={toggleRight} className={`cursor-pointer hover:text-white ${rightOpen ? 'text-white' : 'text-[#666]'}`} />
        </div>

        <button onClick={() => onMenuAction('Dry Test Initiated')} className="bg-[#333333] hover:bg-[#444444] text-[#CCCCCC] hover:text-white px-2.5 py-1 rounded-sm flex items-center gap-1.5 font-medium text-[11px] transition-none border border-white/5 mr-2">
          <TestTubeDiagonal size={12} className="text-purple-400" />
          Dry Test
        </button>

        <button onClick={() => onMenuAction('Execution Started')} className="bg-[#007acc] hover:bg-[#005c99] text-white px-3 py-1 rounded-sm flex items-center gap-1.5 font-medium text-[11px] transition-none mr-3">
          <Play size={10} />
          Execute
        </button>

        <div className="flex h-full border-l border-white/10 px-4 items-center gap-2.5">
          {/* Close */}
          <div onClick={() => appWindow.close()} className="w-[12px] h-[12px] rounded-full bg-[#FF5F56] border border-[#E0443E] cursor-pointer hover:opacity-80 transition-opacity" title="Close"></div>
          {/* Maximize */}
          <div onClick={() => appWindow.toggleMaximize()} className="w-[12px] h-[12px] rounded-full bg-[#FFBD2E] border border-[#DEA123] cursor-pointer hover:opacity-80 transition-opacity" title="Maximize"></div>
          {/* Minimize */}
          <div onClick={() => appWindow.minimize()} className="w-[12px] h-[12px] rounded-full bg-[#27C93F] border border-[#1AAB29] cursor-pointer hover:opacity-80 transition-opacity" title="Minimize"></div>
        </div>
      </div>
    </div>
  );
};

// [fileName, isDir, fullPath]
type FSEntry = [string, boolean, string];

const FilesPanel: React.FC<{ 
  currentPath: string; 
  setCurrentPath: (path: string) => void;
  onDragStart: any; 
  onMenuAction: any; 
}> = ({ currentPath, setCurrentPath, onDragStart, onMenuAction }) => {
  const [files, setFiles] = useState<FSEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadDirectory = async (tgt: string) => {
    try {
      setError(null);
      const items = await invoke<FSEntry[]>('read_dir', { path: tgt });
      setFiles(items);
      setCurrentPath(tgt);
    } catch (e: any) {
      console.error(e);
      setError(e.toString());
      onMenuAction(`FS Error: ${e.toString()}`);
    }
  };

  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath]);

  const goUp = () => {
    if (currentPath === '/') return;
    const parts = currentPath.split('/');
    parts.pop();
    loadDirectory(parts.length > 1 ? parts.join('/') : '/');
  };

  return (
    <div className="w-[250px] bg-[#111111] border-r border-[#262626] flex flex-col flex-shrink-0 relative z-10">
      <div className="p-3 text-[11px] uppercase tracking-widest text-[#808080] font-semibold border-b border-[#262626] flex items-center justify-between">
        <div className="flex items-center gap-2"><Folder size={14} /> FILES</div>
      </div>
      
      <div className="px-2 py-1.5 flex items-center bg-[#1A1A1A] border-b border-[#222]">
        <button onClick={goUp} className="text-[#888] hover:text-white p-1 rounded-md transition-colors"><ChevronLeft size={14} /></button>
        <div className="flex-1 ml-2 text-[11px] font-mono text-[#AAA] whitespace-nowrap overflow-x-auto custom-scrollbar">{currentPath}</div>
      </div>

      <div className="p-2 flex-1 overflow-y-auto space-y-0.5 text-[13px] text-[#CCCCCC] custom-scrollbar">
        {error ? (
          <div className="text-red-400 p-2 text-[11px]">{error}</div>
        ) : (
          files.map(([name, isDir, fullPath], i) => (
            isDir ? (
              <div 
                key={i}
                onClick={() => loadDirectory(fullPath)}
                className="px-2 py-1.5 hover:bg-[#2A2D2E] rounded flex items-center gap-2 cursor-pointer transition-none group"
              >
                <Folder size={14} className="text-blue-400 group-hover:text-blue-300" /> 
                <span className="truncate">{name}</span>
              </div>
            ) : (
              <div 
                key={i}
                draggable onDragStart={(e) => onDragStart(e, 'source', name, fullPath)}
                className="px-2 py-1.5 hover:bg-[#2A2D2E] rounded flex items-center gap-2 cursor-grab pl-6 transition-none group"
              >
                <File size={14} className="text-[#888] group-hover:text-white" /> 
                <span className="truncate">{name}</span>
              </div>
            )
          ))
        )}
      </div>
    </div>
  );
};

const ChatPanel: React.FC<{
  chatLog: { role: 'user' | 'bot' | 'telemetry', text: string }[];
  onSendMessage: (msg: string) => void;
  isProcessing: boolean;
}> = ({ chatLog, onSendMessage, isProcessing }) => {
  const [inputStr, setInputStr] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatLog]);

  const handleSend = () => {
    if (inputStr.trim() && !isProcessing) {
      onSendMessage(inputStr);
      setInputStr('');
    }
  };

  return (
    <div className="w-[300px] bg-[#111111] border-l border-[#262626] flex flex-col flex-shrink-0 relative z-10">
      <div className="p-3 text-[11px] uppercase tracking-widest text-[#808080] font-semibold border-b border-[#262626] flex items-center gap-2">
        <MessageSquare size={14} /> KNOTWORK CHAT
      </div>
      
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 text-[13px] custom-scrollbar bg-[#0A0A0A]">
        {chatLog.length === 0 && (
          <div className="text-center text-[#666] mt-10 text-[12px]">Chat locally with your AI engine.</div>
        )}
        {chatLog.map((log, i) => (
          <div key={i} className={`flex ${log.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`
              max-w-[90%] p-3 rounded-lg text-[13px] shadow-lg leading-relaxed whitespace-pre-wrap
              ${log.role === 'user' ? 'bg-[#007acc] text-white rounded-br-none' : ''}
              ${log.role === 'bot' ? 'bg-[#18181A] border border-[#222] text-[#E0E0E0] rounded-bl-none' : ''}
              ${log.role === 'telemetry' ? 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-[10px] uppercase tracking-wide px-3 py-1.5' : ''}
            `}>
              {log.text}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
             <div className="px-4 py-2 rounded-lg bg-[#18181A] border border-[#333] text-[#888] text-[12px] flex items-center gap-2 shadow-lg rounded-bl-none">
               <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping"></div>
               Evaluating vectors...
             </div>
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-[#262626] bg-[#181818]">
        <div className={`flex items-center gap-2 bg-[#2A2D2E] border rounded-md p-1.5 transition-colors ${isProcessing ? 'border-[#333] opacity-50' : 'border-[#3A3D3E] focus-within:border-blue-500/50'}`}>
          <input 
            type="text" 
            value={inputStr}
            disabled={isProcessing}
            onChange={(e) => setInputStr(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Query your RAG network..." 
            className="flex-1 bg-transparent text-[12px] text-[#CCCCCC] outline-none placeholder:text-[#666] px-1 disabled:cursor-not-allowed"
          />
          <button disabled={isProcessing} onClick={handleSend} className="p-1 hover:text-white text-[#666] transition-colors disabled:cursor-not-allowed"><Send size={14} /></button>
        </div>
      </div>
    </div>
  );
};

type LogLine = { type: 'ok' | 'err' | 'cmd', text: string };

const App: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  
  const [contextMenu, setContextMenu] = useState<{ id: string, top: number, left: number } | null>(null);
  const [propertiesModal, setPropertiesModal] = useState<Node | null>(null);

  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [bottomOpen, setBottomOpen] = useState(true);
  const [openedFolder, setOpenedFolder] = useState<string>('/home/lichi');

  const [interactionMode, setInteractionMode] = useState<'pointer' | 'hand' | 'marquee'>('pointer');
  
  const [logs, setLogs] = useState<LogLine[]>([
    { type: 'ok', text: 'Knotwork Terminal v1.1.0' },
    { type: 'ok', text: 'REPL actively bound to host OS.' },
    { type: 'ok', text: 'PURPOSE: Execute physical system commands (e.g., install pip vectors, run local ollama instances), and monitor deep structural graph validation outputs.' }
  ]);
  const [cmd, setCmd] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const [chatLog, setChatLog] = useState<{ role: 'user' | 'bot' | 'telemetry', text: string }[]>([]);
  const [activeTelemetryEdges, setActiveTelemetryEdges] = useState<Set<string>>(new Set());
  const [isProcessingModel, setIsProcessingModel] = useState(false);

  const { project, zoomIn, zoomOut, fitView, getNodes, getEdges } = useReactFlow();

  const selectedNodes = nodes.filter(n => n.selected);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  const handleExecuteConsole = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && cmd.trim()) {
      const execStr = cmd;
      setCmd('');
      setLogs(prev => [...prev, { type: 'cmd', text: `knotwork@host:~$ ${execStr}` }]);
      try {
        const out = await invoke<string>('execute_shell', { cmd: execStr });
        const lines = out.split('\n').filter(Boolean);
        setLogs(prev => [...prev, ...lines.map((l: string) => ({ type: 'ok', text: l } as LogLine))]);
      } catch (err: any) {
        const errLines = err.toString().split('\n').filter(Boolean);
        setLogs(prev => [...prev, ...errLines.map((l: string) => ({ type: 'err', text: l } as LogLine))]);
      }
    }
  };

  const applyColorToSelected = (color: string | null) => {
    setNodes(nds => nds.map(n => {
      if (n.selected && n.type !== 'groupNode') {
        return { ...n, data: { ...n.data, colorOverride: color } };
      }
      return n;
    }));
  };

  const deleteSelected = () => {
    const selectedIds = new Set(selectedNodes.map(n => n.id));
    setNodes(nds => nds.filter(n => !selectedIds.has(n.id)));
    setEdges(eds => eds.filter(e => !selectedIds.has(e.source) && !selectedIds.has(e.target)));
    setToast(`Deleted ${selectedIds.size} elements.`);
    setTimeout(() => setToast(null), 3000);
  };

  const handleGroupNodes = () => {
    if (selectedNodes.length < 1) return;
    
    // Bounds Calculation
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    selectedNodes.forEach(n => {
      if (n.position.x < minX) minX = n.position.x;
      if (n.position.y < minY) minY = n.position.y;
      if (n.position.x + 280 > maxX) maxX = n.position.x + 280; 
      if (n.position.y + 150 > maxY) maxY = n.position.y + 150; 
    });

    const padding = 60;
    const groupX = minX - padding;
    const groupY = minY - padding;
    const groupWidth = (maxX - minX) + (padding * 2);
    const groupHeight = (maxY - minY) + (padding * 2);

    const groupId = `group-${Date.now()}`;
    const newGroupNode: Node = {
      id: groupId,
      type: 'groupNode',
      position: { x: groupX, y: groupY },
      style: { width: groupWidth, height: groupHeight, zIndex: -1 },
      data: { label: 'New System Group', properties: '{\n  "execution_priority": "high"\n}' },
    };

    setNodes(nds => {
      const remaining = nds.filter(n => !n.selected);
      // Remap children to be relative to parent group node
      const updatedChildren = selectedNodes.map(n => ({
        ...n,
        parentId: groupId,
        position: { x: n.position.x - groupX, y: n.position.y - groupY },
        selected: false
      }));
      return [...remaining, newGroupNode, ...updatedChildren];
    });

    setToast(`Wrapped ${selectedNodes.length} nodes into a Group.`);
    setTimeout(() => setToast(null), 3000);
  };

  const executeDryTest = () => {
    const logsToAdd: LogLine[] = [];
    logsToAdd.push({ type: 'cmd', text: 'knotwork@host:~$ executing dry-run validation...' });

    const brains = nodes.filter(n => n.type === 'brain');
    const agents = nodes.filter(n => n.type === 'agent');
    const sources = nodes.filter(n => n.type === 'source');

    let errors = 0;

    if (brains.length === 0) {
      logsToAdd.push({ type: 'err', text: '[ERROR] Missing Neural Engine: Workspace requires at least 1 Brain Node.' });
      errors++;
    } else {
      logsToAdd.push({ type: 'ok', text: `[OK] Found ${brains.length} Brain Node(s).` });
    }

    if (agents.length === 0) {
      logsToAdd.push({ type: 'ok', text: '[INFO] No Intermediary Agents detected. Brain will ingest raw Sources directly.' });
    } else {
      logsToAdd.push({ type: 'ok', text: `[OK] Found ${agents.length} Logic Agent(s).` });
    }

    // Verify connections to Brain
    const connectionsToBrain = edges.filter(e => {
      const source = nodes.find(n => n.id === e.source);
      const target = nodes.find(n => n.id === e.target);
      return (source?.type === 'agent' || source?.type === 'source') && target?.type === 'brain';
    });

    if (connectionsToBrain.length === 0) {
      logsToAdd.push({ type: 'err', text: '[WARNING] Unlinked Topology: Elements must connect to the Brain Node.' });
      errors++;
    } else {
      logsToAdd.push({ type: 'ok', text: `[OK] Verified ${connectionsToBrain.length} valid logic path(s) to Brain Engine.` });
    }

    if (sources.length > 0) {
      const unlinkedSources = sources.filter(s => {
        return !edges.find(e => {
          const target = nodes.find(n => n.id === e.target);
          return e.source === s.id && (target?.type === 'agent' || target?.type === 'brain');
        });
      });
      
      if (unlinkedSources.length > 0) {
        logsToAdd.push({ type: 'err', text: `[WARNING] Orphanned Sources: ${unlinkedSources.length} Source Document(s) are not connected anywhere.` });
        errors++;
      } else {
        logsToAdd.push({ type: 'ok', text: `[OK] All ${sources.length} Source Node(s) mapped successfully.` });
      }
    }

    if (errors === 0) {
      logsToAdd.push({ type: 'ok', text: '[SUCCESS] Node topology is strictly valid. Ready for execution.' });
      setToast('Dry Test Passed!');
    } else {
      logsToAdd.push({ type: 'err', text: `[FAILED] Dry run validation failed with ${errors} warning(s).` });
      setToast('Dry Test Failed - Check Terminal');
    }

    setBottomOpen(true);
    setLogs(prev => [...prev, ...logsToAdd]);
  };

  const handleMenuAction = async (action: string) => {
    switch (action) {
      case 'New Workspace':
        setNodes([]);
        setEdges([]);
        setToast('Created New Workspace');
        break;
      case 'Open Folder':
        try {
          const folder = await invoke<string>('open_folder_dialog');
          if (folder) setOpenedFolder(folder);
        } catch (e) {
          /* Cancelled */
        }
        break;
      case 'Save Canvas':
      case 'Export Layout JSON':
        const data = JSON.stringify({ nodes: getNodes(), edges: getEdges() }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'knotwork_workspace.json';
        a.click();
        URL.revokeObjectURL(url);
        break;
      case 'Export as GGUF':
        const ggufBlob = new Blob(["GGUF_MOCK_DATA"], { type: 'application/octet-stream' });
        const ggufUrl = URL.createObjectURL(ggufBlob);
        const a2 = document.createElement('a');
        a2.href = ggufUrl;
        a2.download = 'model_export.gguf';
        a2.click();
        URL.revokeObjectURL(ggufUrl);
        break;
      case 'Exit Knotwork':
        getCurrentWindow().close();
        break;
      case 'Zoom In':
        zoomIn();
        break;
      case 'Zoom Out':
        zoomOut();
        break;
      case 'Fit Canvas to Screen':
        fitView({ duration: 800 });
        break;
      case 'Toggle Sidebars':
        const anyOpen = leftOpen || rightOpen || bottomOpen;
        setLeftOpen(!anyOpen); setRightOpen(!anyOpen); setBottomOpen(!anyOpen);
        break;
      case 'Dry Test Initiated':
        executeDryTest();
        break;
      default:
        setToast(`[Hook Triggered]: ${action}`);
    }
  };

  const handleChatExecution = async (userText: string) => {
    setChatLog(prev => [...prev, { role: 'user', text: userText }]);
    setIsProcessingModel(true);

    const brains = nodes.filter(n => n.type === 'brain');
    if (brains.length === 0) {
      setChatLog(prev => [...prev, { role: 'bot', text: 'Node Graph Architectural Error: Strictly relies on at least (1) Brain Node to process inference.'}]);
      setIsProcessingModel(false);
      return;
    }

    const brain = brains[0];
    const baseUrl = brain.data.baseUrl || 'http://127.0.0.1:11434';
    const modelTarget = brain.data.model || 'phi3';

    // 1. Calculate the glowing UI edges (trace EVERYTHING connected to the canvas network targeting the brain)
    const activeSourceNodes = nodes.filter(n => n.type === 'source' && edges.some(e => e.source === n.id));
    const activeEdges = edges.filter(e => activeSourceNodes.some(s => s.id === e.source) || e.target === brain.id);
    
    setActiveTelemetryEdges(new Set(activeEdges.map(e => e.id)));

    // 2. Extract Native Rust Hardware Vectors into explicit context variables
    let extractedContexts = "";
    if (activeSourceNodes.length > 0) {
        setBottomOpen(true);
        for (const rawNode of activeSourceNodes) {
            const proof = `${rawNode.data.filename || 'local_file'}`;
            setLogs(prev => [...prev, { type: 'cmd', text: `[TRACE] Mounting hardware vectors from native OS path: ${rawNode.data.fullPath}` }]);
            
            try {
                // Call Rust natively out of Tauri to open the OS file locally and extract its UTF8 bits
                const rawContent = await invoke<string>('read_document', { path: rawNode.data.fullPath });
                extractedContexts += `\n\n--- DOCUMENT SOURCE: ${proof} ---\n${rawContent}\n`;
                setChatLog(prev => [...prev, { role: 'telemetry', text: `Vector Context Extracted & Loaded: 📄 ${proof}` }]);
            } catch (err: any) {
                setLogs(prev => [...prev, { type: 'err', text: `[FS ERROR] Could not securely parse ${proof}: ${err}` }]);
                setChatLog(prev => [...prev, { role: 'bot', text: `Graph Isolation Error: I failed to securely connect to your local file at ${rawNode.data.fullPath}.` }]);
            }
        }
    } else {
        setLogs(prev => [...prev, { type: 'ok', text: `[INFO] ${modelTarget} executed purely on internal instruction bounds (No source vectors mapped).` }]);
    }

    // 3. Synthesize payload into local local execution matrix logic
    const finalPrompt = extractedContexts.trim() !== "" 
        ? `System Directive: You are an intelligent logical assistant processing specific provided documents. Strictly utilize the following source documents to answer the user query accurately without deviation: \n\n${extractedContexts}\n\nUSER QUERY: ${userText}`
        : `Answer this strictly and accurately using standard intelligence: ${userText}`;

    // 4. Initiate actual LLM HTTP POST to Ollama API
    try {
        const response = await fetch(`${baseUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: modelTarget, 
                prompt: finalPrompt,
                stream: false
            })
        });
        
        if (!response.ok) throw new Error("Ollama endpoint rejected the connection. Is the model pulled locally?");

        const data = await response.json();
        setChatLog(prev => [...prev, { role: 'bot', text: data.response }]);

    } catch (err: any) {
        setChatLog(prev => [...prev, { role: 'bot', text: `API Socket Refused: Failed to establish native routing to Ollama engine at ${baseUrl}. Ensure physical model is pulled and engine is active via Terminal.`}]);
        setLogs(prev => [...prev, { type: 'err', text: `[ERROR] LLM API Refused Data Stream: HTTP execution crashed on attempt to hook natively into ${baseUrl}.` }]);
        setBottomOpen(true);
    }

    setIsProcessingModel(false);
    
    // Terminate glowing physical UI edges exactly 4 seconds after streaming closure to demonstrate real-time data tracing physics natively
    setTimeout(() => setActiveTelemetryEdges(new Set()), 4000);
  };

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

  const onConnect = useCallback((params: Connection) => {
    const sourceNode = nodes.find((n) => n.id === params.source);
    const sourceTheme = sourceNode && sourceNode.type !== 'groupNode' ? themes[sourceNode.type as keyof typeof themes] : null;
    const strokeColor = sourceTheme?.color || '#333333';

    setEdges((eds) => addEdge({
      ...params,
      type: 'default',
      style: { strokeWidth: 2.5, stroke: strokeColor }
    }, eds));
  }, [nodes]);

  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setContextMenu({ id: node.id, top: event.clientY, left: event.clientX });
  }, []);

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setPropertiesModal(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setContextMenu(null);
  }, []);

  const onDragStart = (event: React.DragEvent, nodeType: string, label: string, absolutePath: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('nodeLabel', label);
    event.dataTransfer.setData('absolutePath', absolutePath);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('nodeLabel');
      const absolutePath = event.dataTransfer.getData('absolutePath');

      if (typeof type === 'undefined' || !type) return;

      const position = project({
        x: event.clientX - (leftOpen ? 250 : 0) - 100, 
        y: event.clientY - 35 - 40,
      });

      const newNode: Node = {
        id: `${Date.now()}`,
        type,
        position,
        data: { 
          label: type === 'brain' ? label : undefined,
          name: type === 'agent' ? label : undefined,
          filename: type === 'source' ? label : undefined,
          extension: type === 'source' ? '' : undefined,
          fullPath: type === 'source' ? absolutePath : undefined,
          model: type === 'brain' ? 'phi3' : undefined
        },
      };

      setNodes((nds) => nds.concat(newNode));
    }, [project, leftOpen]
  );

  useEffect(() => {
    // Canvas initialized empty for production
  }, []);

  // Compute glowing physics conditionally prior to rendering Canvas engine
  const telemetryAppliedEdges = edges.map(e => {
      if (activeTelemetryEdges.has(e.id)) {
          return {
              ...e,
              animated: true,
              style: { stroke: '#06b6d4', strokeWidth: 4, filter: 'drop-shadow(0 0 10px rgba(6, 182, 212, 1))' }
          };
      }
      return e;
  });

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0A0A0A] text-white overflow-hidden font-sans">
      
      <FramelessTitlebar 
        leftOpen={leftOpen} toggleLeft={() => setLeftOpen(!leftOpen)}
        bottomOpen={bottomOpen} toggleBottom={() => setBottomOpen(!bottomOpen)}
        rightOpen={rightOpen} toggleRight={() => setRightOpen(!rightOpen)}
        onMenuAction={handleMenuAction}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {leftOpen && <FilesPanel currentPath={openedFolder} setCurrentPath={setOpenedFolder} onDragStart={onDragStart} onMenuAction={handleMenuAction} />}
        
        <div className="flex-1 flex flex-col min-w-0 relative">
          <div className={`flex-1 relative w-full h-full ${interactionMode === 'marquee' ? 'crosshair-canvas' : ''}`} onDragOver={onDragOver} onDrop={onDrop}>
            <ReactFlow
              nodes={nodes}
              edges={telemetryAppliedEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeContextMenu={onNodeContextMenu}
              onNodeDoubleClick={onNodeDoubleClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              panOnDrag={interactionMode === 'pointer' || interactionMode === 'hand'}
              selectionOnDrag={interactionMode === 'marquee'}
              panOnScroll={true}
              zoomOnPinch={true}
              deleteKeyCode={['Backspace', 'Delete']}
              nodesDraggable={interactionMode === 'pointer'}
              nodesConnectable={interactionMode === 'pointer'}
              elementsSelectable={interactionMode === 'pointer' || interactionMode === 'marquee'}
              defaultEdgeOptions={{
                 type: 'default',
                 style: { strokeWidth: 2.5, stroke: '#333' }
              }}
              defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
              minZoom={0.2}
              maxZoom={2}
            >
              <Background
                id="bg1"
                variant={"dots" as any}
                gap={24}
                size={2}
                color="#444"
                style={{ opacity: 0.5 }}
              />
            </ReactFlow>

            {/* Multi-Select Floating Action Bar */}
            {selectedNodes.length > 0 && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-[#252526] border border-[#454545] rounded-xl px-4 py-2 flex items-center gap-4 shadow-2xl z-50 animate-in slide-in-from-top-4 fade-in">
                <div className="flex items-center gap-2 pr-4 border-r border-[#454545] cursor-default text-[#CCCCCC]">
                  <span className="text-[#007acc] font-bold text-[13px]">{selectedNodes.length}</span>
                  <span className="text-[11px] uppercase tracking-wider font-semibold">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleGroupNodes()} className="text-[#888] hover:text-white transition-colors p-1" title="Group Selected Nodes"><Folder size={14} /></button>
                  
                  <div className="flex items-center gap-2 px-3 border-l border-[#454545] ml-1 pl-4 opacity-90 hover:opacity-100 transition-opacity">
                    <button onClick={() => applyColorToSelected(null)} className="w-[14px] h-[14px] rounded-full border border-white/20 hover:scale-125 transition-transform bg-[#18181B]" title="Reset Theme"></button>
                    <button onClick={() => applyColorToSelected('#F87171')} className="w-[14px] h-[14px] rounded-full hover:scale-125 transition-transform bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.4)]" title="Red"></button>
                    <button onClick={() => applyColorToSelected('#3b82f6')} className="w-[14px] h-[14px] rounded-full hover:scale-125 transition-transform bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" title="Blue"></button>
                    <button onClick={() => applyColorToSelected('#10b981')} className="w-[14px] h-[14px] rounded-full hover:scale-125 transition-transform bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" title="Green"></button>
                    <button onClick={() => applyColorToSelected('#FBBF24')} className="w-[14px] h-[14px] rounded-full hover:scale-125 transition-transform bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]" title="Yellow"></button>
                    <button onClick={() => applyColorToSelected('#c084fc')} className="w-[14px] h-[14px] rounded-full hover:scale-125 transition-transform bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.4)]" title="Purple"></button>
                  </div>

                  <button onClick={() => deleteSelected()} className="text-[#e81123] hover:text-red-400 transition-colors p-1 border-l border-[#454545] pl-4 ml-1" title="Delete Selected Nodes"><X size={16} /></button>
                </div>
              </div>
            )}

            {/* Floating Interaction Toolbar */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#1A1A1A] border border-[#333] rounded-full px-2 py-1.5 flex items-center gap-1.5 shadow-2xl z-50">
              <button 
                onClick={(e) => { e.stopPropagation(); setInteractionMode('pointer'); }}
                className={`p-2 rounded-full transition-colors ${interactionMode === 'pointer' ? 'bg-[#007acc] text-white' : 'text-[#888] hover:text-white hover:bg-[#333]'}`}
                title="Pointer (Select & Move)"
              ><MousePointer2 size={16} /></button>
              <button 
                onClick={(e) => { e.stopPropagation(); setInteractionMode('hand'); }}
                className={`p-2 rounded-full transition-colors ${interactionMode === 'hand' ? 'bg-[#007acc] text-white' : 'text-[#888] hover:text-white hover:bg-[#333]'}`}
                title="Hand (Pan Canvas)"
              ><Hand size={16} /></button>
              <button 
                onClick={(e) => { e.stopPropagation(); setInteractionMode('marquee'); }}
                className={`p-2 rounded-full transition-colors ${interactionMode === 'marquee' ? 'bg-[#007acc] text-white' : 'text-[#888] hover:text-white hover:bg-[#333]'}`}
                title="Marquee (Multi-Select)"
              ><BoxSelect size={16} /></button>
              <div className="w-[1px] h-5 bg-[#333] mx-1"></div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleMenuAction('Color Palette Configuration'); }}
                className="p-2 rounded-full transition-colors text-[#888] hover:text-white hover:bg-[#333]"
                title="Color Palette"
              ><Palette size={16} /></button>
            </div>

            {/* Right-click Context Menu */}
            {contextMenu && (
              <div 
                style={{ top: contextMenu.top, left: contextMenu.left }} 
                className="fixed z-[300] bg-[#252526] border border-[#454545] shadow-2xl py-1.5 rounded-lg flex flex-col min-w-[160px]"
                onMouseLeave={() => setContextMenu(null)}
              >
                <div 
                  className="px-4 py-1.5 hover:bg-[#007acc] hover:text-white cursor-pointer text-[12px] text-[#CCCCCC] transition-none"
                  onClick={() => {
                    setPropertiesModal(nodes.find(n => n.id === contextMenu.id) || null);
                    setContextMenu(null);
                  }}
                >
                  Edit Properties
                </div>
                <div 
                  className="px-4 py-1.5 hover:bg-[#007acc] hover:text-white cursor-pointer text-[12px] text-[#CCCCCC] transition-none"
                  onClick={() => {
                    const node = nodes.find(n => n.id === contextMenu.id);
                    if (node) {
                      const newNode = { ...node, id: `${Date.now()}`, position: { x: node.position.x + 50, y: node.position.y + 50 } };
                      setNodes(ns => ns.concat(newNode));
                      handleMenuAction('Copied Node');
                    }
                    setContextMenu(null);
                  }}
                >
                  Duplicate
                </div>
                <div className="h-[1px] bg-[#454545] my-1 mx-2" />
                <div 
                  className="px-4 py-1.5 hover:bg-[#e81123] hover:text-white cursor-pointer text-[12px] text-red-500 transition-none"
                  onClick={() => {
                    setNodes(ns => ns.filter(n => n.id !== contextMenu.id));
                    setEdges(es => es.filter(e => e.source !== contextMenu.id && e.target !== contextMenu.id));
                    setContextMenu(null);
                    handleMenuAction('Deleted Node');
                  }}
                >
                  Delete Node
                </div>
              </div>
            )}

            {/* Double-Click Properties Modal */}
            {propertiesModal && (
              <div className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const dataObj = Object.fromEntries(formData.entries());
                    setNodes((nds) => nds.map((n) => n.id === propertiesModal.id ? { ...n, data: { ...n.data, ...dataObj } } : n));
                    handleMenuAction(`Updated ${propertiesModal.type} Properties`);
                    setPropertiesModal(null);
                  }}
                  className="bg-[#111111] border border-white/10 shadow-2xl rounded-2xl w-[440px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95"
                >
                  <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-gradient-to-b from-white/[0.04] to-transparent">
                    <span className="text-[12px] font-bold tracking-widest text-white/90 uppercase">{propertiesModal.type} Properties</span>
                    <X size={16} className="text-white/40 hover:text-white cursor-pointer transition-colors" onClick={() => setPropertiesModal(null)} />
                  </div>
                  <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {propertiesModal.type === 'groupNode' && (
                      <>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] uppercase font-bold tracking-wider text-white/40">Group Name</label>
                          <input name="label" type="text" defaultValue={propertiesModal.data.label} className="bg-[#1A1A1A] border border-white/5 rounded-lg px-3.5 py-2.5 text-white/90 text-[12px] focus:border-[#007acc] focus:ring-1 focus:ring-[#007acc] focus:outline-none transition-all" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] uppercase font-bold tracking-wider text-white/40">Group Properties (JSON metadata)</label>
                          <textarea name="properties" rows={4} defaultValue={propertiesModal.data.properties} className="bg-[#1A1A1A] border border-white/5 rounded-lg px-3.5 py-2.5 text-white/90 text-[12px] font-mono focus:border-[#007acc] focus:ring-1 focus:ring-[#007acc] focus:outline-none transition-all resize-none" />
                        </div>
                      </>
                    )}
                    {propertiesModal.type === 'brain' && (
                      <>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] uppercase font-bold tracking-wider text-white/40">Model Engine</label>
                          <input name="model" type="text" defaultValue={propertiesModal.data.model || 'phi3'} className="bg-[#1A1A1A] border border-white/5 rounded-lg px-3.5 py-2.5 text-white/90 text-[12px] focus:border-[#007acc] focus:ring-1 focus:ring-[#007acc] focus:outline-none transition-all" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] uppercase font-bold tracking-wider text-white/40">Base URL (Local API)</label>
                          <input name="baseUrl" type="text" defaultValue={propertiesModal.data.baseUrl || 'http://127.0.0.1:11434'} className="bg-[#1A1A1A] border border-white/5 rounded-lg px-3.5 py-2.5 text-white/90 text-[12px] focus:border-[#007acc] focus:ring-1 focus:ring-[#007acc] focus:outline-none transition-all" />
                        </div>
                      </>
                    )}
                    {propertiesModal.type === 'agent' && (
                      <>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] uppercase font-bold tracking-wider text-white/40">Agent Name</label>
                          <input name="name" type="text" defaultValue={propertiesModal.data.name} className="bg-[#1A1A1A] border border-white/5 rounded-lg px-3.5 py-2.5 text-white/90 text-[12px] focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all" />
                        </div>
                      </>
                    )}
                    {propertiesModal.type === 'source' && (
                      <>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] uppercase font-bold tracking-wider text-white/40">File Source Path</label>
                          <input type="text" defaultValue={propertiesModal.data.fullPath} readOnly className="bg-[#0A0A0A] border border-white/5 text-white/30 rounded-lg px-3.5 py-2.5 outline-none cursor-not-allowed text-[11px]" />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="px-6 py-4 border-t border-white/5 bg-[#0A0A0A] flex justify-end gap-3 rounded-b-2xl">
                    <button type="button" onClick={() => setPropertiesModal(null)} className="px-5 py-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors text-[12px] font-bold tracking-wide">Cancel</button>
                    <button type="submit" className="px-5 py-2 rounded-lg bg-[#007acc] hover:bg-[#005c99] text-white transition-colors text-[12px] font-bold tracking-wide shadow-lg shadow-blue-500/20">Save Changes</button>
                  </div>
                </form>
              </div>
            )}

            {toast && (
              <div className="absolute bottom-4 right-4 z-[400] bg-[#007acc] text-white px-4 py-2 rounded shadow-2xl animate-in slide-in-from-bottom-5 fade-in text-[12px] font-medium tracking-wide">
                {toast}
              </div>
            )}
          </div>

          {bottomOpen && (
            <div className="h-[220px] bg-[#181818] border-t border-[#262626] flex flex-col flex-shrink-0 relative z-10">
              <div className="px-4 py-2 text-[11px] uppercase tracking-widest text-[#808080] font-semibold border-b border-[#262626] flex items-center gap-2 bg-[#111111]">
                <TerminalIcon size={14} /> TERMINAL
              </div>
              <div ref={scrollRef} className="flex-1 p-3 overflow-y-auto font-mono text-[13px] text-[#CCCCCC] leading-relaxed bg-[#0A0A0A] selection:bg-[#264F78] custom-scrollbar">
                {logs.map((L, i) => (
                  <div key={i} className={`${L.type === 'err' ? 'text-rose-400' : L.type === 'cmd' ? 'text-blue-400 font-bold mt-1' : 'text-[#888]'}`}>
                    {L.text}
                  </div>
                ))}
                <div className="flex mt-1">
                  <span className="text-blue-400 font-bold mr-2">knotwork@host:~$</span>
                  <input 
                    type="text" 
                    value={cmd}
                    onChange={(e) => setCmd(e.target.value)}
                    onKeyDown={handleExecuteConsole}
                    className="flex-1 bg-transparent text-white outline-none"
                    spellCheck={false}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {rightOpen && <ChatPanel chatLog={chatLog} onSendMessage={handleChatExecution} isProcessing={isProcessingModel} />}
      </div>
    </div>
  );
};

const AppWithProvider = () => (
  <ReactFlowProvider>
    <App />
  </ReactFlowProvider>
);

export default AppWithProvider;
