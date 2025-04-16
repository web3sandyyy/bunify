import { Button } from "./ui/button";
import * as deepar from "deepar";

interface Filter {
  name: string;
  path: string;
}

interface FiltersProps {
  filters: Filter[];
  currentFilter: string;
  switchFilter: (path: string) => Promise<void>;
  deepARRef: React.RefObject<deepar.DeepAR | null>;
  isInitializing: boolean;
}

const Filters = ({
  filters,
  currentFilter,
  switchFilter,
  deepARRef,
  isInitializing,
}: FiltersProps) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 text-foreground">Filters</h3>
      <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto p-2 bg-muted/30 rounded-xl">
        {filters.map((filter, index) => (
          <Button
            key={index}
            onClick={() => switchFilter(filter.path)}
            disabled={!deepARRef.current || isInitializing}
            variant={currentFilter === filter.path ? "accent" : "outline"}
            size="sm"
            className="font-medium"
          >
            {filter.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Filters;
