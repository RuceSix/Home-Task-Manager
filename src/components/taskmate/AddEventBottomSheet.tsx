import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { ChildEventType } from '@/types/taskmate';

const EVENT_OPTIONS: { type: ChildEventType; icon: string; label: string }[] = [
  { type: 'latte', icon: '🍼', label: 'Latte / Biberon' },
  { type: 'allattamento', icon: '🤱', label: 'Allattamento' },
  { type: 'sonno', icon: '😴', label: 'Sonno' },
  { type: 'pannolino', icon: '💩', label: 'Pannolino' },
  { type: 'peso', icon: '⚖️', label: 'Peso' },
  { type: 'nota', icon: '🩺', label: 'Nota' },
];

interface AddEventBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectType: (type: ChildEventType) => void;
  trigger?: React.ReactNode;
}

export function AddEventBottomSheet({
  open,
  onOpenChange,
  onSelectType,
  trigger,
}: AddEventBottomSheetProps) {
  const handleSelect = (type: ChildEventType) => {
    onSelectType(type);
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Aggiungi evento</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-8 space-y-1">
          {EVENT_OPTIONS.map(({ type, icon, label }) => (
            <button
              key={type}
              onClick={() => handleSelect(type)}
              className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-secondary/50 transition-colors text-left"
            >
              <span className="text-2xl">{icon}</span>
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
