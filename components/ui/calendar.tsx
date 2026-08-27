'use client';

import * as React from 'react';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon } from 'lucide-react';
import { DayPicker, getDefaultClassNames, type ChevronProps } from 'react-day-picker';
import { vi } from 'react-day-picker/locale';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

/** Lịch của shadcn/ui, dựng trên react-day-picker.
 *
 *  Ba chỗ lệch khỏi bản gốc trên trang shadcn, đều vì người dùng là thầy giáo
 *  Việt Nam đứng cạnh hồ bơi:
 *  1. Mặc định tiếng Việt, tuần bắt đầu từ thứ Hai.
 *  2. Nhãn thứ rút còn "T2 … CN" — bản date-fns ra "Th 2", chật và khó đọc.
 *  3. Màu của bốn trạng thái ô ngày nằm trong app/globals.css chứ không phải
 *     ở đây, vì chúng đè lên nhau và thứ tự đè phải do mình quyết.
 */
const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaults = getDefaultClassNames();

  return (
    <DayPicker
      locale={vi}
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      className={cn('[--cell:2.25rem] p-3', className)}
      formatters={{
        formatWeekdayName: (d) => WEEKDAYS[d.getDay()],
        formatCaption: (d) => `Tháng ${d.getMonth() + 1}, ${d.getFullYear()}`,
        formatMonthDropdown: (d) => `Tháng ${d.getMonth() + 1}`,
        ...formatters,
      }}
      classNames={{
        root: cn('w-fit', defaults.root),
        months: 'relative flex flex-col gap-4 md:flex-row',
        month: 'flex w-full flex-col gap-3',

        nav: 'absolute inset-x-0 top-0 flex items-center justify-between',
        button_previous: cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'size-8 text-mist aria-disabled:pointer-events-none aria-disabled:opacity-30',
        ),
        button_next: cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'size-8 text-mist aria-disabled:pointer-events-none aria-disabled:opacity-30',
        ),

        month_caption: 'flex h-8 items-center justify-center px-9',
        caption_label: 'select-none text-sm font-semibold tracking-tight',
        dropdowns: 'flex h-8 items-center justify-center gap-1.5 text-sm font-semibold',
        dropdown_root: 'relative rounded-md border border-input px-1.5 has-focus:border-ring',
        dropdown: 'absolute inset-0 cursor-pointer opacity-0',

        month_grid: 'border-collapse',
        weekdays: 'flex',
        weekday: 'w-(--cell) select-none pb-1.5 text-[.6875rem] font-semibold uppercase tracking-[.08em] text-dim',
        weeks: '',
        week: 'mt-1 flex',
        day: 'flex size-(--cell) items-center justify-center p-0 text-center',
        day_button:
          'flex size-(--cell) items-center justify-center rounded-lg text-sm leading-none transition-colors',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Root: ({ className: c, rootRef, ...rest }) => (
          <div data-slot="calendar" ref={rootRef} className={c} {...rest} />
        ),
        Chevron: ({ orientation, className: c, ...rest }: ChevronProps) => {
          const Icon =
            orientation === 'left' ? ChevronLeftIcon
            : orientation === 'right' ? ChevronRightIcon
            : orientation === 'up' ? ChevronUpIcon
            : ChevronDownIcon;
          return <Icon className={cn('size-4', c)} {...rest} />;
        },
        ...components,
      }}
      {...props}
    />
  );
}

export { Calendar };
