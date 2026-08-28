'use client';

import { useState } from 'react';
import { CalendarIcon, ChevronDownIcon } from 'lucide-react';

import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { fromISO, formatDate, formatDateRelative, toISO } from '@/lib/time';

/** Chọn ngày buổi học. Không cho chọn ngày mai trở đi: buổi chưa xảy ra thì không
 *  có gì để chấm, và một ngày tương lai gõ nhầm làm sai thứ tự khi so tiến bộ. */
export function DatePicker({
  value, onChange, className, direction = 'past', ready = true,
}: {
  value: string;
  onChange: (iso: string) => void;
  className?: string;
  /** Trình duyệt đã đọc xong buổi học chưa.
   *
   *  Trang chủ là trang TĨNH, dựng sẵn lúc build. Vẽ ngày ra ở lượt đầu nghĩa là
   *  nướng ngày-lúc-build vào HTML rồi phục vụ cho mọi người: hôm sau mở lên vẫn
   *  thấy "Hôm nay · 27/08". `suppressHydrationWarning` chỉ giấu cảnh báo, không
   *  sửa được cái HTML sai. Nên lượt đầu giữ chỗ, có số thật rồi mới vẽ. */
  ready?: boolean;
  /** `past` — chỉ cho chọn hôm nay trở về trước (chấm buổi đã xảy ra).
   *  `future` — chỉ cho chọn hôm nay trở đi (hẹn buổi sau). */
  direction?: 'past' | 'future';
}) {
  const [open, setOpen] = useState(false);
  const selected = fromISO(value);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={ready ? `Ngày học: ${formatDate(value)}` : 'Ngày học'}
        disabled={!ready}
        className={cn(
          'flex items-center gap-2 whitespace-nowrap rounded-lg border border-line bg-deep px-2.5 py-1.5 text-sm',
          'transition-colors hover:border-aqua/40 data-[state=open]:border-aqua/50',
          className,
        )}
      >
        <CalendarIcon aria-hidden className="size-4 shrink-0 text-dim" />
        <span className={cn('tabular-nums', !ready && 'invisible')}>
          {ready ? formatDateRelative(value, now) : 'Hôm nay · 00/00'}
        </span>
        <ChevronDownIcon aria-hidden className="size-3.5 shrink-0 text-dim" />
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto">
        <Calendar
          mode="single"
          required
          selected={selected}
          defaultMonth={selected ?? today}
          onSelect={(d) => { if (d) { onChange(toISO(d)); setOpen(false); } }}
          disabled={direction === 'past' ? { after: today } : { before: today }}
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
              d.setDate(d.getDate() + (direction === 'past' ? -1 : 7));
              onChange(toISO(d));
              setOpen(false);
            }}
            className="rounded-md px-2 py-1 text-xs font-medium text-mist transition-colors hover:bg-raised"
          >
            {direction === 'past' ? 'Hôm qua' : 'Tuần sau'}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
