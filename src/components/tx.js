import * as Tooltip from "@radix-ui/react-tooltip";

export default function CustomTooltip() {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger className="bg-gray-700 text-white p-2 rounded">
          Hover me
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="bg-black text-white p-2 rounded shadow-lg">
            I am a tooltip!
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
