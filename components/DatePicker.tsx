'use client';

import { useState } from 'react';
import { CalendarIcon, ChevronDownIcon } from 'lucide-react';

import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { fromISO, ngayVN, ngayVNNgan, toISO } from '@/lib/time';

/** Chọn ngày buổi học.
 *
 *  Trước đây là <input type="date">: mỗi trình duyệt vẽ một kiểu, trên máy
 *  thầy thì ra ô lịch nền xám lạc khỏi cả trang. Lịch này do mình vẽ nên
 *  giống nhau ở mọi nơi.
 *
 *  Không cho chọn ngày mai trở đi — buổi chưa xảy ra thì không có gì để chấm,
 *  và cái duy nhất một ngày tương lai làm được là làm hỏng thứ tự khi so tiến
 *  bộ giữa các buổi. */
export function DatePicker({
  value, onChange, className,
}: {
  value: string;
  onChange: (iso: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = fromISO(value);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={`Ngày học: ${ngayVN(value)}`}
        className={cn(
          'flex items-center gap-2 whitespace-nowrap rounded-lg border border-line bg-deep px-2.5 py-1.5 text-sm',
          'transition-colors hover:border-aqua/40 data-[state=open]:border-aqua/50',
          className,
        )}
      >
        <CalendarIcon aria-hidden className="size-4 shrink-0 text-dim" />
        <span suppressHydrationWarning className="tabular-nums">{ngayVNNgan(value, now)}</span>
        <ChevronDownIcon aria-hidden className="size-3.5 shrink-0 text-dim" />
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto">
        <Calendar
          mode="single"
          required
          selected={selected}
          defaultMonth={selected ?? today}
          onSelect={(d) => { if (d) { onChange(toISO(d)); setOpen(false); } }}
          disabled={{ after: today }}
          autoFocus
        />
        <div className="flex items-center justify-between gap-2 border-t border-line px-3 py-2">
          <button
            type="button"
            onClick={() => { onChange(toISO(today)); setOpen(false); }}
            className="rounded-md px-2 py-1 text-xs font-medium text-aqua transition-colors hover:bg-aqua/10"
          >
            Hôm nay
          </button>
          <button
            type="button"
            onClick={() => {
              const d = new Date(today);
              d.setDate(d.getDate() - 1);
              onChange(toISO(d));
              setOpen(false);
            }}
            className="rounded-md px-2 py-1 text-xs font-medium text-mist transition-colors hover:bg-raised"
          >
            Hôm qua
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
