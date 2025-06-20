import { useState, useEffect, useRef, useCallback } from 'react';
import type { Complex } from '../types/complex';

interface UseInfiniteCircularScrollProps {
  items: Complex[];
  fillscreen?: boolean;
  dir?: 'vr' | 'hr';
  ease?: number;
  speed?: number;
}

interface UseInfiniteCircularScrollReturn {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  displayItems: Complex[];
  scrollToItem: (index: number) => void;
  currentVisibleIndex: number;
}

const useInfiniteCircularScroll = ({
  items,
}: UseInfiniteCircularScrollProps): UseInfiniteCircularScrollReturn => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [currentVisibleIndex, setCurrentVisibleIndex] = useState(0);
  const [displayItems, setDisplayItems] = useState<Complex[]>(items);

  useEffect(() => {
    if (items.length === 0) {
      setDisplayItems([]);
      return;
    }
    setDisplayItems(items);
  }, [items]);

  // UsagiScrollのonWheel, onTouchStartなどのイベントハンドラをここに実装
  // scrollContainerRef.current にイベントリスナーを追加
  // スクロール位置やジェスチャーに応じて currentVisibleIndex を更新
  // または、CSS Scroll Snapに任せる場合は、スクロールイベントで
  // 現在のスナップ位置を特定して currentVisibleIndex を更新する

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || items.length === 0) return;

    const container = scrollContainerRef.current;
    const itemHeight = container.scrollHeight / displayItems.length; // 各アイテムの高さが均一と仮定
    const scrolledIndex = Math.round(container.scrollTop / itemHeight);

    // 循環の境界処理
    // 厳密な循環のためには、スクロールが端に達したときに
    // プログラムでスクロール位置を反対側の対応するアイテムに移動させる必要がある。
    // (例: 最後のアイテムの次に来たら、最初のアイテムにアニメーションなしでスクロール位置を戻す)
    // この部分は UsagiScroll の this.scroll.x % this.content.rect.width のような計算を参考にする。

    if (scrolledIndex !== currentVisibleIndex) {
      setCurrentVisibleIndex(scrolledIndex % items.length); // items.lengthで割った余りで循環
    }
    // CSS Scroll Snap を使う場合、ブラウザがスナップを処理するので、
    // 厳密なインデックス管理はUIフィードバック（例: ページネーション表示）のために行う。
  }, [displayItems, items.length, currentVisibleIndex]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // UsagiScrollのscrollToメソッドに相当する機能
  const scrollToItem = useCallback(
    (index: number) => {
      if (scrollContainerRef.current && items.length > 0) {
        const itemHeight =
          scrollContainerRef.current.scrollHeight / displayItems.length;
        scrollContainerRef.current.scrollTo({
          top: itemHeight * index,
          behavior: 'smooth',
        });
      }
    },
    [items, displayItems]
  );

  return {
    scrollContainerRef,
    displayItems,
    scrollToItem,
    currentVisibleIndex,
  };
};

export default useInfiniteCircularScroll;
