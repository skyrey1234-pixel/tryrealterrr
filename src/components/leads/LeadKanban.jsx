import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import KanbanCard from '@/components/leads/KanbanCard';
import { money, leadCommission } from '@/lib/commission';

export const STAGES = [
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'qualified', label: 'Qualified' },
  { key: 'showing', label: 'Showing' },
  { key: 'under_contract', label: 'Under Contract' },
  { key: 'closed', label: 'Closed' },
];

export default function LeadKanban({ leads, onMove }) {
  const handleDragEnd = (result) => {
    const { destination, draggableId, source } = result;
    if (!destination || destination.droppableId === source.droppableId) return;
    onMove(draggableId, destination.droppableId);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const items = leads.filter((l) => (l.status || 'new') === stage.key);
          const total = items.reduce((t, l) => t + leadCommission(l), 0);
          return (
            <Droppable key={stage.key} droppableId={stage.key}>
              {(provided, snapshot) => (
                <div ref={provided.innerRef} {...provided.droppableProps}
                  className={`w-72 shrink-0 rounded-2xl border p-3 transition-colors duration-200 ${snapshot.isDraggingOver ? 'border-amber-500/30 bg-amber-500/[0.04]' : 'border-white/[0.06] bg-white/[0.02]'}`}>
                  <div className="mb-3 flex items-baseline justify-between px-1">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-neutral-400">{stage.label}</div>
                    <div className="text-[11px] text-neutral-600 tabular-nums">{items.length}</div>
                  </div>
                  <div className="mb-3 px-1 text-[11px] text-neutral-600 tabular-nums">{money(total)} est.</div>
                  <div className="space-y-2.5 min-h-[80px]">
                    {items.map((lead, i) => (
                      <Draggable key={lead.id} draggableId={lead.id} index={i}>
                        {(dp, ds) => (
                          <div ref={dp.innerRef} {...dp.draggableProps} {...dp.dragHandleProps}>
                            <KanbanCard lead={lead} dragging={ds.isDragging} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}