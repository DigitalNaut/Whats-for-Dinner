import Toggle from "src/components/Toggle";
import { useSpinnerMenuContext } from "src/hooks/SpinnerMenuContext";

export default function EditMenu() {
  const { allMenuItems, toggleMenuItem } = useSpinnerMenuContext();

  return (
    <div>
      <h2 className="font-bangers text-center text-4xl">Menu</h2>
      <div className="flex flex-col gap-4">
        {allMenuItems &&
          allMenuItems.map((item, index) => (
            <div key={item.label} className="flex items-center gap-2">
              <img
                className="w-10 h-10 rounded-lg object-cover"
                src={item.imageUrl}
                alt={item.label}
              />
              <p className="flex-1">{item.label}</p>
              <Toggle
                initial={item.enabled}
                onChange={(value) => toggleMenuItem(index, value)}
              />
            </div>
          ))}
      </div>
    </div>
  );
}
