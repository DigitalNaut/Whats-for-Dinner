import Toggle from "src/components/Toggle";
import { useSpinnerMenuContext } from "src/hooks/SpinnerMenuContext";

export default function EditMenu() {
  const choices = useSpinnerMenuContext();
  const handleToggle = (value: boolean, index: number) => {
    choices[index].enabled = value;
  };

  return (
    <div>
      <h2 className="font-bangers text-center text-4xl">Menu</h2>
      <div className="flex flex-col gap-4">
        {choices.map((choice, index) => (
          <div key={choice.label} className="flex items-center gap-2">
            <img
              className="w-10 h-10 rounded-lg object-cover"
              src={choice.imageUrl}
              alt={choice.label}
            />
            <p className="flex-1">{choice.label}</p>
            <Toggle
              initial={choice.enabled}
              onChange={(value) => handleToggle(value, index)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
