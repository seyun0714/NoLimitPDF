// hooks/useDndReorder.ts
import { useSensor, useSensors, PointerSensor, DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

export function useDndReorder<T extends { id: string }>(setItems: React.Dispatch<React.SetStateAction<T[]>>) {
    const sensors = useSensors(useSensor(PointerSensor));

    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    return { sensors, onDragEnd };
}
