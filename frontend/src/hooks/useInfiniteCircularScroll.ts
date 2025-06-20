// src/hooks/useInfiniteCircularScroll.ts (新規作成または大幅変更)
import { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import type { Complex } from '../types/complex';

interface UseInfiniteCircularScrollProps {
  items: Complex[];
  loopAround?: boolean; // 端から端へのループを有効にするか
  duration?: number; // GSAPアニメーションのデュレーション
  ease?: string; // GSAPのイージング
}

interface UseInfiniteCircularScrollReturn {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  displayItems: Complex[];
  actualCurrentIndex: number; // 元のitems配列における現在のインデックス
  scrollProgress: number; // スクロール進捗 (0-1)
  // scrollToItem: (index: number, animate?: boolean) => void; // 特定のアイテムへスクロール
}

const useInfiniteCircularScroll = ({
  items,
  loopAround = true,
  duration = 0.7, // GSAPのデフォルトデュレーション
  ease = 'power2.out', // GSAPのデフォルトイージング
}: UseInfiniteCircularScrollProps): UseInfiniteCircularScrollReturn => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [displayItems, setDisplayItems] = useState<Complex[]>([]);
  const [actualCurrentIndex, setActualCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false); // GSAPアニメーション中フラグ
  const currentScrollTween = useRef<gsap.core.Tween | null>(null); // GSAPトゥイーンインスタンス
  const [scrollProgress, setScrollProgress] = useState(0); // スクロール進捗を管理

  // 1. displayItemsの準備 (前後にダミー要素を追加)
  useEffect(() => {
    if (items.length === 0) {
      setDisplayItems([]);
      setActualCurrentIndex(0);
      return;
    }

    let itemsForDisplay: Complex[] = [];
    if (items.length === 1) {
      itemsForDisplay = [items[0], items[0], items[0]]; // [A, A, A]
    } else {
      itemsForDisplay = [
        items[items.length - 1], // 前のダミー (N)
        ...items, // 実際のアイテム (1...N)
        items[0], // 後ろのダミー (1)
      ];
    }
    setDisplayItems(itemsForDisplay);
    setActualCurrentIndex(0); // 初期表示は元のリストの0番目
  }, [items]);

  // 2. 初期スクロール位置の設定 (displayItemsとactualCurrentIndexに依存)
  useEffect(() => {
    if (scrollContainerRef.current && displayItems.length > 0) {
      const container = scrollContainerRef.current;
      const itemHeight = container.clientHeight;
      let initialDisplayIndex = 0;

      if (items.length === 1) {
        initialDisplayIndex = 1; // [A, A, A] の中央
      } else if (items.length > 1) {
        initialDisplayIndex = 1; // [N, 1, ..., N, 1] の最初の「1」
      }

      if (initialDisplayIndex < displayItems.length) {
        // GSAPアニメーションなしで初期位置へ
        gsap.set(container, { scrollTop: itemHeight * initialDisplayIndex });
      }
    }
  }, [displayItems, items.length]); // items.lengthも依存配列に追加

  const scrollToDisplayIndex = useCallback(
    (targetDisplayIndex: number, animate = true, onComplete?: () => void) => {
      if (!scrollContainerRef.current || isAnimating) return;

      const container = scrollContainerRef.current;
      const itemHeight = container.clientHeight;
      const targetScrollTop = itemHeight * targetDisplayIndex;

      if (currentScrollTween.current) {
        currentScrollTween.current.kill(); // 既存のアニメーションを停止
      }

      setIsAnimating(true);
      // アニメーション中はスクロールスナップを無効化
      container.style.scrollSnapType = 'none';

      currentScrollTween.current = gsap.to(container, {
        scrollTop: targetScrollTop,
        duration: animate ? duration : 0,
        ease: ease,
        onComplete: () => {
          setIsAnimating(false);
          // アニメーション完了後にスクロールスナップを再有効化
          container.style.scrollSnapType = 'y mandatory';
          if (onComplete) {
            onComplete();
          }
          currentScrollTween.current = null;
        },
        onInterrupt: () => {
          // ユーザー操作などで中断された場合
          setIsAnimating(false);
          container.style.scrollSnapType = 'y mandatory';
          currentScrollTween.current = null;
        },
      });
    },
    [duration, ease, isAnimating]
  );

  // 3. スクロールイベントハンドラ (GSAPアニメーションと連携)
  // isAnimatingRef は、クロージャ内で最新の isAnimating 値を参照するために使用
  const isAnimatingRef = useRef(isAnimating);
  useEffect(() => {
    isAnimatingRef.current = isAnimating;
  }, [isAnimating]);

  const handleWheelOrTouch = useCallback(
    (deltaY: number) => {
      if (
        !scrollContainerRef.current ||
        isAnimatingRef.current ||
        displayItems.length <= 1 ||
        items.length === 0
      )
        return;

      const container = scrollContainerRef.current;
      const itemHeight = container.clientHeight;
      const currentScrollTop = container.scrollTop;
      const currentDisplayIndex = Math.round(currentScrollTop / itemHeight);
      let targetDisplayIndex = currentDisplayIndex; // アニメーションのターゲット

      let nextDisplayIndex = currentDisplayIndex + (deltaY > 0 ? 1 : -1);

      if (!loopAround) {
        // ループしない場合の処理 (変更なし)
        nextDisplayIndex = Math.max(
          0,
          Math.min(nextDisplayIndex, displayItems.length - 1)
        );
        if (nextDisplayIndex === currentDisplayIndex) return;

        scrollToDisplayIndex(nextDisplayIndex);
        // actualCurrentIndexの更新はGSAPのonCompleteか、別途scrollイベント監視で行う
        // ここでは単純化のため、scrollToDisplayIndex後に手動で計算
        if (items.length === 1) {
          setActualCurrentIndex(0);
        } else if (
          nextDisplayIndex > 0 &&
          nextDisplayIndex < displayItems.length - 1
        ) {
          setActualCurrentIndex(nextDisplayIndex - 1);
        }
        return;
      }

      // ループする場合の処理
      if (items.length === 1) {
        // アイテムが1つの場合、スクロールは発生しないか、中央のダミーに留まる
        // 必要であれば、端から端へのアニメーションと中央へのリセットを行う
        // ここでは単純化のため、何もしない（または中央に留まる）
        if (currentDisplayIndex !== 1) {
          // もし中央(index 1)にいなければ戻す
          scrollToDisplayIndex(1, true);
        }
        setActualCurrentIndex(0);
        return;
      }

      // deltaYに基づいて次のターゲットインデックスを決定
      targetDisplayIndex = currentDisplayIndex + (deltaY > 0 ? 1 : -1);

      // ターゲットが実際のアイテムの範囲内か、ダミー要素かを判断
      if (
        targetDisplayIndex > 0 &&
        targetDisplayIndex < displayItems.length - 1
      ) {
        // 通常のスクロール（実際のアイテム間）
        scrollToDisplayIndex(targetDisplayIndex);
        setActualCurrentIndex(targetDisplayIndex - 1);
      } else if (targetDisplayIndex <= 0) {
        // 上端のダミーまたはそれ以上に到達しようとした
        // 1. 最後のダミーアイテム (displayItems[0]) へアニメーション
        scrollToDisplayIndex(0, true, () => {
          // 2. アニメーション完了後、瞬時に実際の最後のアイテムの位置へ移動
          //    実際の最後のアイテムは displayItems の items.length の位置にある
          gsap.set(container, { scrollTop: itemHeight * items.length });
          setActualCurrentIndex(items.length - 1);
        });
      } else if (targetDisplayIndex >= displayItems.length - 1) {
        // 下端のダミーまたはそれ以上に到達しようとした
        // 1. 最初のダミーアイテム (displayItems[displayItems.length - 1]) へアニメーション
        scrollToDisplayIndex(displayItems.length - 1, true, () => {
          // 2. アニメーション完了後、瞬時に実際の最初のアイテムの位置へ移動
          //    実際の最初のアイテムは displayItems の 1 の位置にある
          gsap.set(container, { scrollTop: itemHeight * 1 });
          setActualCurrentIndex(0);
        });
      }
    },
    [
      displayItems,
      items,
      // isAnimating, // isAnimatingRef.current を使用するため依存配列から削除
      loopAround,
      scrollToDisplayIndex,
    ]
  );

  // ホイールイベントのリスナー
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault(); // デフォルトのスクロールをキャンセル
      handleWheelOrTouch(event.deltaY);
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, [handleWheelOrTouch]);

  // スクロール進捗を計算するイベントリスナー
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const updateScrollProgress = () => {
      setScrollProgress(container.scrollTop); // スクロールトップ値を直接渡す
    };
    container.addEventListener('scroll', updateScrollProgress, {
      passive: true,
    });
    return () => container.removeEventListener('scroll', updateScrollProgress);
  }, []);

  // (オプション) タッチイベントのリスナー (UsagiScrollのように詳細な制御が必要な場合)
  // ここでは簡略化のため省略。必要であればUsagiScrollのonTouchStart, onTouchMove, onTouchEndを参考に実装。

  return {
    scrollContainerRef,
    displayItems,
    actualCurrentIndex,
    scrollProgress,
  };
};

export default useInfiniteCircularScroll;
