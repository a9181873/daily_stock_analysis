import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiErrorAlert, ConfirmDialog, Button, InlineAlert, Card } from '../components/common';
import { DashboardStateBlock } from '../components/dashboard';
import { StockAutocomplete } from '../components/StockAutocomplete';
import { HistoryList } from '../components/history';
import { ReportMarkdown, ReportSummary } from '../components/report';
import { TaskPanel } from '../components/tasks';
import { useDashboardLifecycle, useHomeDashboardState } from '../hooks';
import { normalizeReportLanguage } from '../utils/reportLanguage';
import { BarChart3, ShieldCheck, Zap, Bell } from 'lucide-react';
import { cn } from '../utils/cn';
import { Drawer } from '../components/common/Drawer';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    query,
    inputError,
    duplicateError,
    error,
    isAnalyzing,
    historyItems,
    selectedHistoryIds,
    isDeletingHistory,
    isLoadingHistory,
    isLoadingMore,
    hasMore,
    selectedReport,
    isLoadingReport,
    activeTasks,
    markdownDrawerOpen,
    setQuery,
    clearError,
    loadInitialHistory,
    refreshHistory,
    loadMoreHistory,
    selectHistoryItem,
    toggleHistorySelection,
    toggleSelectAllVisible,
    deleteSelectedHistory,
    submitAnalysis,
    notify,
    setNotify,
    syncTaskCreated,
    syncTaskUpdated,
    syncTaskFailed,
    removeTask,
    openMarkdownDrawer,
    closeMarkdownDrawer,
    selectedIds,
  } = useHomeDashboardState();

  useEffect(() => {
    document.title = '每日選股分析 - DSA';
  }, []);

  const reportLanguage = normalizeReportLanguage(selectedReport?.meta.reportLanguage);


  useDashboardLifecycle({
    loadInitialHistory,
    refreshHistory,
    syncTaskCreated,
    syncTaskUpdated,
    syncTaskFailed,
    removeTask,
  });

  const handleHistoryItemClick = useCallback((recordId: number) => {
    void selectHistoryItem(recordId);
    setSidebarOpen(false);
  }, [selectHistoryItem]);

  const handleSubmitAnalysis = useCallback(
    (
      stockCode?: string,
      stockName?: string,
      selectionSource?: 'manual' | 'autocomplete' | 'import' | 'image',
    ) => {
      void submitAnalysis({
        stockCode,
        stockName,
        originalQuery: query,
        selectionSource: selectionSource ?? 'manual',
      });
    },
    [query, submitAnalysis],
  );

  const handleAskFollowUp = useCallback(() => {
    if (selectedReport?.meta.id === undefined) {
      return;
    }

    const code = selectedReport.meta.stockCode;
    const name = selectedReport.meta.stockName;
    const rid = selectedReport.meta.id;
    navigate(`/chat?stock=${encodeURIComponent(code)}&name=${encodeURIComponent(name)}&recordId=${rid}`);
  }, [navigate, selectedReport]);

  const handleReanalyze = useCallback(() => {
    if (!selectedReport) {
      return;
    }

    void submitAnalysis({
      stockCode: selectedReport.meta.stockCode,
      stockName: selectedReport.meta.stockName,
      originalQuery: selectedReport.meta.stockCode,
      selectionSource: 'manual',
      forceRefresh: true,
    });
  }, [selectedReport, submitAnalysis]);

  const handleDeleteSelectedHistory = useCallback(() => {
    void deleteSelectedHistory();
    setShowDeleteConfirm(false);
  }, [deleteSelectedHistory]);

  const sidebarContent = useMemo(
    () => (
      <div className="flex min-h-0 h-full flex-col gap-3 overflow-hidden">
        <TaskPanel tasks={activeTasks} />
        <HistoryList
          items={historyItems}
          isLoading={isLoadingHistory}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          selectedId={selectedReport?.meta.id}
          selectedIds={selectedIds}
          isDeleting={isDeletingHistory}
          onItemClick={handleHistoryItemClick}
          onLoadMore={() => void loadMoreHistory()}
          onToggleItemSelection={toggleHistorySelection}
          onToggleSelectAll={toggleSelectAllVisible}
          onDeleteSelected={() => setShowDeleteConfirm(true)}
          className="flex-1 overflow-hidden"
        />
      </div>
    ),
    [
      activeTasks,
      hasMore,
      historyItems,
      isDeletingHistory,
      isLoadingHistory,
      isLoadingMore,
      handleHistoryItemClick,
      loadMoreHistory,
      selectedIds,
      selectedReport?.meta.id,
      toggleHistorySelection,
      toggleSelectAllVisible,
    ],
  );

  return (
    <div
      data-testid="home-dashboard"
      className="flex min-h-screen w-full flex-col overflow-x-hidden bg-background text-foreground"
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col px-4 py-8 sm:px-6 lg:py-12">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-gradient text-white shadow-glow-cyan">
              <BarChart3 className="h-8 w-8" />
            </div>
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">DSA 智能選股分析</h1>
          <p className="text-muted-text">基於 AI 大模型的全球市場智能分析系統</p>
        </div>

        {/* User Guide Section */}
        <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="border-subtle bg-card/40 p-5 backdrop-blur-md">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan/10 text-cyan">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="mb-1 font-semibold">快速分析</h3>
            <p className="text-xs leading-relaxed text-muted-text">
              輸入股票代碼或名稱，AI 將即時聚合技術面、基本面與新聞輿情進行深度診斷。
            </p>
          </Card>
          <Card className="border-subtle bg-card/40 p-5 backdrop-blur-md">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple/10 text-purple">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="mb-1 font-semibold">決策儀表盤</h3>
            <p className="text-xs leading-relaxed text-muted-text">
              提供直觀的評分、買賣點位建議及風險警報，助您快速掌握市場情緒與趨勢。
            </p>
          </Card>
          <Card className="border-subtle bg-card/40 p-5 backdrop-blur-md">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
              <Bell className="h-5 w-5" />
            </div>
            <h3 className="mb-1 font-semibold">多渠道推送</h3>
            <p className="text-xs leading-relaxed text-muted-text">
              支援企業微信、飛書、Telegram 等多種渠道，每日定時將分析結果送達您的手中。
            </p>
          </Card>
        </div>

        {/* Analysis Input Section */}
        <div className="mb-12">
          <div className="relative mb-4">
            <StockAutocomplete
              value={query}
              onChange={setQuery}
              onSubmit={(stockCode, stockName, selectionSource) => {
                handleSubmitAnalysis(stockCode, stockName, selectionSource);
              }}
              placeholder="輸入股票代碼或名稱，如 600519、AAPL、TSLA"
              disabled={isAnalyzing}
              className={cn(
                "h-14 text-lg shadow-soft-card-strong",
                inputError ? 'border-danger/50' : 'border-subtle'
              )}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-secondary-text transition-colors hover:text-foreground">
              <input
                type="checkbox"
                checked={notify}
                onChange={(e) => setNotify(e.target.checked)}
                className="h-4 w-4 rounded border-border bg-transparent accent-cyan"
              />
              同步推送通知
            </label>
            <Button
              type="button"
              onClick={() => handleSubmitAnalysis()}
              disabled={!query || isAnalyzing}
              className="h-12 min-w-[120px] rounded-xl bg-primary-gradient px-8 font-semibold text-white shadow-glow-cyan transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  分析中
                </div>
              ) : (
                '開始分析'
              )}
            </Button>
          </div>
          
          {inputError || duplicateError ? (
            <div className="mt-4">
              {inputError && (
                <InlineAlert variant="danger" message={inputError} className="rounded-xl" />
              )}
              {duplicateError && (
                <InlineAlert variant="warning" message={duplicateError} className="rounded-xl" />
              )}
            </div>
          ) : null}
        </div>

        {/* Results Section */}
        <section className="min-h-[200px]">
          {error && (
            <ApiErrorAlert error={error} className="mb-6" onDismiss={clearError} />
          )}
          
          {isLoadingReport ? (
            <div className="flex py-12 justify-center">
              <DashboardStateBlock title="正在生成 AI 分析報告..." loading />
            </div>
          ) : selectedReport ? (
            <div className="animate-fade-in space-y-6">
              <div className="flex flex-wrap items-center justify-end gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-card/50 backdrop-blur-sm"
                  disabled={isAnalyzing || selectedReport.meta.id === undefined}
                  onClick={handleReanalyze}
                >
                  重新分析
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-card/50 backdrop-blur-sm"
                  disabled={selectedReport.meta.id === undefined}
                  onClick={handleAskFollowUp}
                >
                  追問 AI
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={selectedReport.meta.id === undefined}
                  onClick={openMarkdownDrawer}
                >
                  完整報告
                </Button>
              </div>
              <ReportSummary data={selectedReport} isHistory />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-subtle text-muted-text">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium">尚無分析結果</h3>
              <p className="text-sm text-muted-text">在上方輸入代碼開始您的第一次智能分析</p>
            </div>
          )}
        </section>

        {/* History & Tasks (Desktop Sidebar replacement) */}
        {(historyItems.length > 0 || activeTasks.length > 0) && (
          <div className="mt-16 border-t border-subtle pt-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">近期動態</h2>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                查看全部
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-text">分析任務</h3>
                <TaskPanel tasks={activeTasks} />
                {activeTasks.length === 0 && <p className="text-sm text-muted-text italic">目前沒有進行中的任務</p>}
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-text">歷史報告</h3>
                <div className="max-h-[400px] overflow-y-auto rounded-xl border border-subtle bg-card/20 p-2">
                  <HistoryList
                    items={historyItems.slice(0, 10)}
                    isLoading={isLoadingHistory}
                    isLoadingMore={isLoadingMore}
                    hasMore={hasMore}
                    selectedId={selectedReport?.meta.id}
                    selectedIds={selectedIds}
                    isDeleting={isDeletingHistory}
                    onItemClick={handleHistoryItemClick}
                    onLoadMore={() => void loadMoreHistory()}
                    onToggleItemSelection={toggleHistorySelection}
                    onToggleSelectAll={toggleSelectAllVisible}
                    onDeleteSelected={() => setShowDeleteConfirm(true)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sidebar Drawer */}
      <Drawer
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        title="歷史與任務"
        width="max-w-md"
        side="right"
      >
        <div className="p-4 h-full overflow-hidden">
          {sidebarContent}
        </div>
      </Drawer>

      {markdownDrawerOpen && selectedReport?.meta.id ? (
        <ReportMarkdown
          recordId={selectedReport.meta.id}
          stockName={selectedReport.meta.stockName || ''}
          stockCode={selectedReport.meta.stockCode}
          reportLanguage={reportLanguage}
          onClose={closeMarkdownDrawer}
        />
      ) : null}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="刪除歷史記錄"
        message={`確認刪除選中的 ${selectedHistoryIds.length} 條歷史記錄嗎？刪除後將不可恢復。`}
        confirmText={isDeletingHistory ? '刪除中...' : '確認刪除'}
        cancelText="取消"
        isDanger={true}
        onConfirm={handleDeleteSelectedHistory}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default HomePage;
