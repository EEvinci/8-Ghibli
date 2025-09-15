'use client';

import { GhibliStyle } from '@/app/lib/openai';

interface GhibliStyleSelectorProps {
  value: GhibliStyle;
  onChange: (style: GhibliStyle) => void;
  disabled?: boolean;
}

export default function GhibliStyleSelector({ 
  value, 
  onChange, 
  disabled = false 
}: GhibliStyleSelectorProps) {
  const styles = [
    { value: 'spirited-away', label: '千与千寻' },
    { value: 'totoro', label: '龙猫' },
    { value: 'howls-castle', label: '哈尔的移动城堡' },
    { value: 'castle-in-sky', label: '天空之城' },
    { value: 'ponyo', label: '悬崖上的金鱼姬' },
  ];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as GhibliStyle)}
      disabled={disabled}
    >
      {styles.map((style) => (
        <option key={style.value} value={style.value}>
          {style.label}
        </option>
      ))}
    </select>
  );
}
