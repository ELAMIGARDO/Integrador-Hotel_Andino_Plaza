interface GanttBlock {
  label: string;
  start: number;
  duration: number;
  colorTailwind: string;
  reservaOriginal: any;
}

interface GanttRowProps {
  days: string[];
  roomBlocks: GanttBlock[];
  setIsModalOpen: (open: boolean) => void;
  setReservaSeleccionada: (reserva: any) => void;
  setIsDetailOpen: (open: boolean) => void;
}

export function AvailabilityGanttRow({ days, roomBlocks, setIsModalOpen, setReservaSeleccionada, setIsDetailOpen }: GanttRowProps) {
  return (
    <div
      onClick={() => setIsModalOpen(true)}
      className="flex-1 flex min-w-[800px] relative bg-emerald-50/30 dark:bg-emerald-950/10 cursor-pointer hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20 transition-colors"
      title="Clic para registrar reserva en esta habitación"
    >
      {days.map((_, idx) => (
        <div key={idx} className="flex-1 min-w-[80px] border-r border-slate-100 dark:border-slate-700/30" />
      ))}

      {roomBlocks.map((block, i) => (
        <div
          key={i}
          onClick={(e) => {
            e.stopPropagation();
            setReservaSeleccionada(block.reservaOriginal);
            setIsDetailOpen(true);
          }}
          className={`absolute top-2 bottom-2 rounded-md px-3 py-1.5 flex items-center text-xs font-medium text-white shadow-sm overflow-hidden transition-all cursor-pointer ${block.colorTailwind}`}
          style={{
            left: `calc((${block.start} / ${days.length}) * 100% + 4px)`,
            width: `calc((${block.duration} / ${days.length}) * 100% - 8px)`,
          }}
          title={`Ocupado por: ${block.label} — Haz clic para ver detalles`}
        >
          <span className="truncate w-full font-semibold">{block.label}</span>
        </div>
      ))}
    </div>
  );
}
