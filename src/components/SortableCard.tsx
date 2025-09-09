// components/shared/SortableCard.tsx
import { ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

type Props = {
    id: string;
    index: number;
    onRemove: (id: string) => void;
    children: ReactNode;
    title?: string;
    aspect?: string;
    className?: string;
};

export function SortableCard({ id, index, onRemove, children, title, aspect = '1/1.414', className = '' }: Props) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging, isSorting } = useSortable({ id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 999 : isSorting ? 2 : 1,
        position: 'relative',
    };

    // "1/1.414" -> "1 / 1.414" 로 변환 (CSS aspect-ratio 문법)
    const aspectRatio = aspect.includes('/') ? aspect.replace('/', ' / ') : aspect;

    return (
        <div ref={setNodeRef} style={style} {...attributes} className={`relative group touch-none ${className}`}>
            <div {...listeners} className="cursor-grab active:cursor-grabbing">
                {/* ✅ 핵심: 동적 클래스 대신 style.aspectRatio 사용 */}
                <div className="w-full rounded-md overflow-hidden border bg-card relative" style={{ aspectRatio }}>
                    {/* 좌상단 순번 */}
                    <span className="absolute top-1 left-1 z-10 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                        {index + 1}
                    </span>

                    {/* 콘텐츠를 프레임에 꽉 채우고, 로딩/에러/이미지 모두 동일한 레이아웃 유지 */}
                    <div className="absolute inset-0 flex items-center justify-center">{children}</div>
                </div>
            </div>

            {title && <div className="mt-2 text-sm truncate text-center">{title}</div>}

            {/* 삭제 버튼 (카드 우상단) */}
            <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 cursor-pointer"
                onClick={() => onRemove(id)}
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
}
