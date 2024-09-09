import { useRef } from 'react';
import { colormap } from '../lib/globals';

type RegionsListProps = {
  names: string[],
  setCurrentClass: (name: string) => void,
};
export default function RegionsList(props: RegionsListProps) {
  const { names, setCurrentClass } = props;
  const listRef = useRef(null);

  const handleMouseMove = (event) => {
    const elementUnderCursor = document.elementFromPoint(event.clientX, event.clientY);

    if (listRef.current && listRef.current.contains(elementUnderCursor)) {
      // elementUnderCursor.classList.add('text-red-600');
      if (elementUnderCursor instanceof HTMLElement)
        setCurrentClass(elementUnderCursor.dataset.name);
    }
  };
  const handleMouseLeave = () => {
    const items = listRef.current.querySelectorAll('li');
    items.forEach(item => {
      setCurrentClass(null);
    });
  };

  return <ul ref={listRef} className="pt-4 flex flex-wrap gap-4 justify-center">
    { names.map((className, idx) =>
      <li key={idx} className="cursor-pointer flex items-center hover:text-primary"
        data-name={className}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="w-[20px] h-[20px] pointer-events-none"
          style={{ backgroundColor: toRgbStr(colormap[idx]) }}
        ></div>
        <span className="pointer-events-none pl-1">{className}</span>
      </li>
    )}
  </ul>;
}

function toRgbStr(color) {
  if (!color) return '';

  return `rgb(${color.join(', ')})`;
}
