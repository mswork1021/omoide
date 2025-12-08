'use client';

/**
 * DatePicker Component
 * 記念日選択用のカスタム日付ピッカー
 */

import React, { useState, useCallback } from 'react';
import { format, parse, isValid, isBefore, isAfter } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
}

export function DatePicker({
  value,
  onChange,
  minDate = new Date('1900-01-01'),
  maxDate = new Date(),
  placeholder = '日付を選択',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(
    value ? format(value, 'yyyy/MM/dd') : ''
  );
  const [viewDate, setViewDate] = useState(value || new Date());

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    // 日付パースを試みる
    const parsed = parse(val, 'yyyy/MM/dd', new Date());
    if (isValid(parsed) && !isBefore(parsed, minDate) && !isAfter(parsed, maxDate)) {
      onChange(parsed);
      setViewDate(parsed);
    }
  };

  const handleDateSelect = (date: Date) => {
    onChange(date);
    setInputValue(format(date, 'yyyy/MM/dd'));
    setIsOpen(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setViewDate((current) => {
      const newDate = new Date(current);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const navigateYear = (direction: 'prev' | 'next') => {
    setViewDate((current) => {
      const newDate = new Date(current);
      if (direction === 'prev') {
        newDate.setFullYear(newDate.getFullYear() - 10);
      } else {
        newDate.setFullYear(newDate.getFullYear() + 10);
      }
      return newDate;
    });
  };

  const renderCalendar = useCallback(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // 前月の空白
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // 当月の日付
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    const weeks: (Date | null)[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks;
  }, [viewDate]);

  const weeks = renderCalendar();
  const dayLabels = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="date-picker relative">
      {/* 入力フィールド */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-10 border-2 border-[#1a1a1a]/20 rounded-lg
                     bg-[#faf8f3] text-[#1a1a1a] font-serif text-lg
                     focus:border-[#1a1a1a] focus:outline-none transition-colors"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1a1a1a]/60 hover:text-[#1a1a1a]"
        >
          <Calendar size={20} />
        </button>
      </div>

      {/* カレンダードロップダウン */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-[#faf8f3] border-2 border-[#1a1a1a] rounded-lg shadow-lg p-4">
          {/* ナビゲーション */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => navigateYear('prev')}
              className="p-1 hover:bg-[#1a1a1a]/10 rounded text-xs"
            >
              ≪
            </button>
            <button
              type="button"
              onClick={() => navigateMonth('prev')}
              className="p-1 hover:bg-[#1a1a1a]/10 rounded"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-bold">
              {format(viewDate, 'yyyy年 M月', { locale: ja })}
            </span>
            <button
              type="button"
              onClick={() => navigateMonth('next')}
              className="p-1 hover:bg-[#1a1a1a]/10 rounded"
            >
              <ChevronRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => navigateYear('next')}
              className="p-1 hover:bg-[#1a1a1a]/10 rounded text-xs"
            >
              ≫
            </button>
          </div>

          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayLabels.map((day, i) => (
              <div
                key={day}
                className={`text-center text-xs font-bold ${
                  i === 0 ? 'text-red-600' : i === 6 ? 'text-blue-600' : ''
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 日付グリッド */}
          <div className="space-y-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {week.map((day, dayIndex) => {
                  if (!day) {
                    return <div key={dayIndex} className="w-8 h-8" />;
                  }

                  const isSelected = value && format(day, 'yyyy-MM-dd') === format(value, 'yyyy-MM-dd');
                  const isDisabled = isBefore(day, minDate) || isAfter(day, maxDate);
                  const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

                  return (
                    <button
                      key={dayIndex}
                      type="button"
                      onClick={() => !isDisabled && handleDateSelect(day)}
                      disabled={isDisabled}
                      className={`
                        w-8 h-8 rounded text-sm transition-colors
                        ${isSelected ? 'bg-[#1a1a1a] text-white' : ''}
                        ${isToday && !isSelected ? 'border border-[#1a1a1a]' : ''}
                        ${isDisabled ? 'text-[#1a1a1a]/20 cursor-not-allowed' : 'hover:bg-[#1a1a1a]/10'}
                        ${dayIndex === 0 && !isSelected ? 'text-red-600' : ''}
                        ${dayIndex === 6 && !isSelected ? 'text-blue-600' : ''}
                      `}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* 閉じるボタン */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="mt-3 w-full py-2 text-sm text-[#1a1a1a]/60 hover:text-[#1a1a1a] border-t border-[#1a1a1a]/20"
          >
            閉じる
          </button>
        </div>
      )}
    </div>
  );
}
