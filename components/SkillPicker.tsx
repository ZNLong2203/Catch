'use client';

import { GROUP_META, SKILL_META, SKILL_ORDER } from '@/lib/faults';
import type { Skill, SkillGroup } from '@/lib/types';

const GROUPS: SkillGroup[] = ['survival', 'stroke'];

function Card({ skill, on, onPick }: { skill: Skill; on: boolean; onPick: () => void }) {
  const meta = SKILL_META[skill];
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={on}
      className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200
        ${on
          ? 'border-aqua/60 bg-aqua/[0.07] shadow-[0_0_0_1px_rgba(42,212,238,.25),0_18px_50px_-24px_rgba(42,212,238,.55)]'
          : 'border-line bg-surface/60 hover:border-aqua/30 hover:bg-surface'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-[15px] font-semibold tracking-tight">{meta.label}</span>
        <span
          aria-hidden
          className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border transition
            ${on ? 'border-aqua bg-aqua text-abyss' : 'border-dim/60'}`}
        >
          {on && (
            <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M2.5 6.4 4.8 8.7 9.5 3.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
      </div>
      <p className="mt-1.5 text-[13px] leading-relaxed text-mist">{meta.hint}</p>
      {!meta.curriculum && (
        <p className="mt-2 inline-block rounded-md bg-white/[0.05] px-1.5 py-0.5 text-[11px] text-dim">
          ngoài phổ cập
        </p>
      )}
    </button>
  );
}

export function SkillPicker({ value, onChange }: { value: Skill | null; onChange: (s: Skill) => void }) {
  return (
    <fieldset className="space-y-5">
      <legend className="sr-only">Chọn nội dung trong video</legend>
      {GROUPS.map((group) => {
        const items = SKILL_ORDER.filter((s) => SKILL_META[s].group === group);
        return (
          <div key={group}>
            <div className="mb-2.5">
              <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${group === 'survival' ? 'text-aqua' : 'text-dim'}`}>
                {GROUP_META[group].label}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-mist">{GROUP_META[group].hint}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map((s) => (
                <Card key={s} skill={s} on={value === s} onPick={() => onChange(s)} />
              ))}
            </div>
          </div>
        );
      })}
    </fieldset>
  );
}
