import type React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { Trash2, RefreshCw, Mail, Users } from 'lucide-react';
import { subscriptionsApi, CONTENT_TYPE_LABELS } from '../../api/subscriptions';
import type { SubscriptionItem } from '../../api/subscriptions';
import { Button } from '../common/Button';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { SettingsSectionCard } from './SettingsSectionCard';

export const SubscribersCard: React.FC = () => {
  const [items, setItems] = useState<SubscriptionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SubscriptionItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await subscriptionsApi.list();
      setItems(res.items);
    } catch {
      setError('載入訂閱列表失敗');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await subscriptionsApi.remove(deleteTarget.id);
      setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    } catch {
      setError('刪除失敗，請重試');
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const refreshAction = (
    <Button
      variant="settings-secondary"
      size="sm"
      onClick={() => void load()}
      disabled={isLoading}
      aria-label="重新載入"
    >
      <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
      重新載入
    </Button>
  );

  return (
    <>
      <SettingsSectionCard
        title="訂閱管理"
        description={`Email 訂閱者列表，共 ${items.length} 位。訂閱者會在報告產生時收到 Email 通知。`}
        actions={refreshAction}
      >
        {error ? (
          <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-xs text-danger">
            {error}
          </p>
        ) : null}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-border/30 border-t-[hsl(var(--primary))]" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Users className="h-8 w-8 text-muted-text/40" />
            <p className="text-sm text-muted-text">尚無訂閱者</p>
            <p className="text-xs text-muted-text/60">
              訪客可透過{' '}
              <a
                href="/subscribe"
                target="_blank"
                rel="noreferrer"
                className="text-[hsl(var(--primary))] underline underline-offset-2 hover:opacity-80"
              >
                /subscribe
              </a>{' '}
              頁面訂閱報告
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-[1.15rem] border border-[var(--settings-border)] bg-[var(--settings-surface)] px-4 py-3 transition-colors hover:border-[var(--settings-border-strong)] hover:bg-[var(--settings-surface-hover)]"
              >
                <Mail className="h-4 w-4 shrink-0 text-muted-text" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{item.email}</p>
                  <p className="mt-0.5 text-xs text-muted-text">
                    {item.contentTypes.map((ct) => CONTENT_TYPE_LABELS[ct] ?? ct).join('、')}
                    {item.createdAt ? (
                      <span className="ml-2 opacity-60">
                        · {new Date(item.createdAt).toLocaleDateString('zh-TW')}
                      </span>
                    ) : null}
                  </p>
                </div>
                <Button
                  variant="danger-subtle"
                  size="xsm"
                  onClick={() => setDeleteTarget(item)}
                  aria-label={`刪除 ${item.email}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <p className="mt-1 text-xs text-muted-text/70">
          訂閱連結：
          <a
            href="/subscribe"
            target="_blank"
            rel="noreferrer"
            className="ml-1 text-[hsl(var(--primary))] underline underline-offset-2 hover:opacity-80"
          >
            {window.location.origin}/subscribe
          </a>
        </p>
      </SettingsSectionCard>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="刪除訂閱"
        message={`確定要刪除 ${deleteTarget?.email ?? ''} 的訂閱嗎？刪除後將不再收到報告通知。`}
        confirmText={isDeleting ? '刪除中...' : '確認刪除'}
        cancelText="取消"
        isDanger
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
};
