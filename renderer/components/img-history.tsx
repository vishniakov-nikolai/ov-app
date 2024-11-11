import { useEffect, useState } from 'react';

type ImageHistoryProps = {
  items: string[],
  selectItem: (imgPath: string) => void,
  removeItem: (id: number) => void,
};

export default function ImageHistory(props: ImageHistoryProps) {
  const { items, selectItem, removeItem } = props;
  const [reversedItems, setReversedItems] = useState([]);

  useEffect(() => {
    setReversedItems([...items].reverse());
  }, [items]);

  return (
    <ul className="flex flex-wrap">
      {reversedItems.map((imgPath, idx) => (
        <li key={idx} className="mr-2">
          <div
            onClick={() => selectItem(imgPath)}
            className="relative w-10 h-10 cursor-pointer border hover:border-primary group overflow-hidden"
          >
            <img src={imgPath} alt={imgPath} className="object-center w-10 h-10 object-cover" />
            <button
              onClick={(e) => {
                removeItem(items.length - idx - 1);
                e.stopPropagation();
              }}
              className="hidden group-hover:block absolute top-0 right-0 text-xs text-red-500 bg-white w-4 h-4 hover:bg-red-500 hover:text-white"
            >
              x
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
