import { useState } from 'react';
import { Copy, Eye, EyeOff, RotateCw } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Spinner } from '@/components/ui/spinner';
import { useVirtualKey, useRotateKey } from '../api/use-virtual-key';

export function ApiKeyCard() {
  const { data: key, isLoading } = useVirtualKey();
  const rotateKey = useRotateKey();
  const [revealed, setRevealed] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const displayValue = key
    ? revealed
      ? key.keyValue
      : key.keyValue.slice(0, 7) + '•'.repeat(24)
    : null;

  const handleCopy = () => {
    if (!key) return;
    navigator.clipboard.writeText(key.keyValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRotateConfirm = async () => {
    await rotateKey.mutateAsync();
    setConfirmOpen(false);
    setRevealed(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>API Key</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <Spinner />}
          {!isLoading && !key && (
            <p className="text-sm text-gray-500">No API key assigned yet.</p>
          )}
          {!isLoading && key && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                <code className="flex-1 font-mono text-sm text-gray-800 break-all">
                  {displayValue}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRevealed((v) => !v)}
                  aria-label={revealed ? 'Hide key' : 'Reveal key'}
                  title={revealed ? 'Hide key' : 'Reveal key'}
                >
                  {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  aria-label="Copy key"
                  title="Copy to clipboard"
                >
                  <Copy size={16} />
                </Button>
              </div>
              {copied && <p className="text-xs text-green-600">Copied to clipboard!</p>}
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Created {new Date(key.createdAt).toLocaleDateString()}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setConfirmOpen(true)}
                  loading={rotateKey.isPending}
                >
                  <RotateCw size={14} />
                  Rotate key
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleRotateConfirm}
        title="Rotate API Key"
        message="Your current key will be invalidated immediately. Any services using it will stop working. Are you sure?"
        confirmLabel="Rotate"
        loading={rotateKey.isPending}
      />
    </>
  );
}
