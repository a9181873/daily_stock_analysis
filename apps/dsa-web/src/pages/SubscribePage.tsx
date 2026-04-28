import type React from 'react';
import { useEffect, useState } from 'react';
import { Mail, CheckCircle2, TrendingUp, BarChart3 } from 'lucide-react';
import { Button, Input, ParticleBackground } from '../components/common';
import { subscriptionsApi, CONTENT_TYPE_LABELS } from '../api/subscriptions';
import type { ContentType } from '../api/subscriptions';

const ALL_TYPES: ContentType[] = ['analysis', 'market_review'];

const SubscribePage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contentTypes, setContentTypes] = useState<ContentType[]>(['analysis', 'market_review']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    document.title = '訂閱報告 - DSA';
  }, []);

  const toggleType = (ct: ContentType) => {
    setContentTypes((prev) =>
      prev.includes(ct) ? prev.filter((t) => t !== ct) : [...prev, ct]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('請輸入 Email');
      return;
    }
    if (!password) {
      setError('請輸入訂閱密碼');
      return;
    }
    if (contentTypes.length === 0) {
      setError('請至少勾選一項訂閱內容');
      return;
    }
    setIsSubmitting(true);
    try {
      await subscriptionsApi.subscribe({
        email: email.trim().toLowerCase(),
        password,
        content_types: contentTypes,
      });
      setSuccess(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        '訂閱失敗，請確認密碼是否正確';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--login-bg-main)] py-12 px-4 font-sans sm:px-6 lg:px-8">
      <ParticleBackground />
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,var(--login-grid-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--login-grid-line)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:var(--login-grid-mask)]" />
      <div className="absolute left-[15%] top-[25%] -z-10 h-[300px] w-[300px] rounded-full bg-[var(--login-accent-glow)] blur-[100px] opacity-50" />
      <div className="absolute right-[15%] bottom-[15%] -z-10 h-[300px] w-[300px] rounded-full bg-emerald-600/10 blur-[100px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-gradient shadow-lg">
            <BarChart3 className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--login-text-primary)]">
            訂閱分析報告
          </h1>
          <p className="mt-2 text-sm text-[var(--login-text-secondary)]">
            輸入 Email 及訂閱密碼，選擇想收到的報告類型
          </p>
        </div>

        {/* Card */}
        <div className="relative group">
          <div className="pointer-events-none absolute -inset-0.5 rounded-3xl bg-gradient-to-b from-[var(--login-accent-glow)] to-[hsl(214_100%_56%_/_0.18)] opacity-40 blur-sm transition duration-1000 group-hover:opacity-80 group-hover:duration-200" />
          <div className="relative flex flex-col overflow-hidden rounded-3xl border border-[var(--login-border-card)] bg-[var(--login-bg-card)]/80 p-8 shadow-2xl backdrop-blur-xl">
            <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-[var(--login-accent-soft)] blur-[50px]" />
            <div className="absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-blue-600/10 blur-[50px]" />

            {success ? (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <CheckCircle2 className="h-14 w-14 text-emerald-400 drop-shadow-[0_0_16px_rgba(52,211,153,0.5)]" />
                <h2 className="text-xl font-bold text-[var(--login-text-primary)]">訂閱成功！</h2>
                <p className="text-sm text-[var(--login-text-secondary)]">
                  我們已記錄您的訂閱，報告產生後會寄送到 <span className="font-semibold text-[var(--login-accent-text)]">{email}</span>
                </p>
                <p className="text-xs text-[var(--login-text-muted)] mt-2">
                  若您想調整訂閱內容，重新提交此表單即可更新。
                </p>
              </div>
            ) : (
              <form onSubmit={(e) => void handleSubmit(e)} className="relative z-10 space-y-5">
                <div>
                  <Input
                    appearance="login"
                    type="email"
                    placeholder="your@email.com"
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <div>
                  <Input
                    appearance="login"
                    type="password"
                    allowTogglePassword
                    iconType="key"
                    label="訂閱密碼"
                    placeholder="請輸入訂閱密碼"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="off"
                    required
                  />
                </div>

                <div>
                  <p className="mb-3 text-sm font-medium text-[var(--login-label-text)]">
                    訂閱內容
                  </p>
                  <div className="space-y-2">
                    {ALL_TYPES.map((ct) => (
                      <label
                        key={ct}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--login-border-card)] bg-[var(--login-bg-card)]/50 px-4 py-3 transition-colors hover:border-[var(--login-accent-border)] hover:bg-[var(--login-accent-soft)]"
                      >
                        <input
                          type="checkbox"
                          checked={contentTypes.includes(ct)}
                          onChange={() => toggleType(ct)}
                          className="h-4 w-4 accent-[hsl(var(--primary))]"
                        />
                        <span className="flex items-center gap-2 text-sm text-[var(--login-text-primary)]">
                          <TrendingUp className="h-4 w-4 text-[var(--login-accent-text)] opacity-80" />
                          {CONTENT_TYPE_LABELS[ct]}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {error ? (
                  <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-2 text-xs text-danger">
                    {error}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  isLoading={isSubmitting}
                  loadingText="訂閱中..."
                  glow
                >
                  <Mail className="h-4 w-4" />
                  確認訂閱
                </Button>
              </form>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--login-text-muted)]">
          已訂閱？重新提交可更新訂閱項目。如需取消，請聯繫管理員。
        </p>
      </div>
    </div>
  );
};

export default SubscribePage;
