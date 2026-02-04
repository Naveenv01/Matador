import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronDown, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JsonViewerProps {
  data: unknown;
  initialExpanded?: boolean;
}

interface JsonNodeProps {
  keyName?: string;
  value: unknown;
  depth: number;
  isLast: boolean;
  initialExpanded?: boolean;
}

function JsonNode({ keyName, value, depth, isLast, initialExpanded = true }: JsonNodeProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  const isObject = value !== null && typeof value === "object";
  const isArray = Array.isArray(value);
  const isEmpty = isObject && Object.keys(value as object).length === 0;

  const renderValue = () => {
    if (value === null) {
      return <span className="text-muted-foreground italic">null</span>;
    }
    if (typeof value === "string") {
      return <span className="text-success">"{value}"</span>;
    }
    if (typeof value === "number") {
      return <span className="text-info">{value}</span>;
    }
    if (typeof value === "boolean") {
      return <span className="text-warning">{value.toString()}</span>;
    }
    return null;
  };

  if (!isObject) {
    return (
      <div className="flex items-center py-0.5" style={{ paddingLeft: depth * 16 }}>
        {keyName && (
          <>
            <span className="text-foreground/80">"{keyName}"</span>
            <span className="text-muted-foreground mx-1">:</span>
          </>
        )}
        {renderValue()}
        {!isLast && <span className="text-muted-foreground">,</span>}
      </div>
    );
  }

  const entries = Object.entries(value as object);
  const bracketOpen = isArray ? "[" : "{";
  const bracketClose = isArray ? "]" : "}";

  if (isEmpty) {
    return (
      <div className="flex items-center py-0.5" style={{ paddingLeft: depth * 16 }}>
        {keyName && (
          <>
            <span className="text-foreground/80">"{keyName}"</span>
            <span className="text-muted-foreground mx-1">:</span>
          </>
        )}
        <span className="text-muted-foreground">{bracketOpen}{bracketClose}</span>
        {!isLast && <span className="text-muted-foreground">,</span>}
      </div>
    );
  }

  return (
    <div>
      <div
        className="flex items-center py-0.5 cursor-pointer hover:bg-muted/30 rounded -ml-5 pl-5 transition-colors"
        style={{ paddingLeft: depth * 16 }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="w-4 h-4 flex items-center justify-center mr-1 text-muted-foreground">
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </span>
        {keyName && (
          <>
            <span className="text-foreground/80">"{keyName}"</span>
            <span className="text-muted-foreground mx-1">:</span>
          </>
        )}
        <span className="text-muted-foreground">{bracketOpen}</span>
        {!isExpanded && (
          <>
            <span className="text-muted-foreground mx-1">...</span>
            <span className="text-muted-foreground">{bracketClose}</span>
            {!isLast && <span className="text-muted-foreground">,</span>}
            <span className="ml-2 text-xs text-muted-foreground/60">
              {entries.length} {isArray ? "items" : "keys"}
            </span>
          </>
        )}
      </div>

      {isExpanded && (
        <>
          {entries.map(([key, val], index) => (
            <JsonNode
              key={key}
              keyName={isArray ? undefined : key}
              value={val}
              depth={depth + 1}
              isLast={index === entries.length - 1}
              initialExpanded={depth < 2}
            />
          ))}
          <div className="py-0.5" style={{ paddingLeft: depth * 16 }}>
            <span className="text-muted-foreground">{bracketClose}</span>
            {!isLast && <span className="text-muted-foreground">,</span>}
          </div>
        </>
      )}
    </div>
  );
}

export function JsonViewer({ data, initialExpanded = true }: JsonViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 bg-muted/80 hover:bg-muted"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-success" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
      <div className="rounded-lg bg-muted/50 border border-border p-4 font-mono text-sm overflow-x-auto">
        <JsonNode value={data} depth={0} isLast={true} initialExpanded={initialExpanded} />
      </div>
    </div>
  );
}
