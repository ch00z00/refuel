import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import type { Complex } from '../../../types/complex';

const CardWrapper = styled.div`
  /* 映画館のようなダイナミックなデザイン */
  color: #5e5e5e; /* 明るい文字色 */
  padding: 1.5rem;
  border-radius: 1.5rem; /* より大きな角丸 */
  box-shadow:
    0 15px 30px rgba(0, 0, 0, 0.5),
    /* 強い影で奥行きを出す */ 0 5px 10px rgba(0, 0, 0, 0.3);
  text-align: center;
  width: 90vw; /* 画面幅の90% */
  max-width: 600px; /* 最大幅を設定して大きくなりすぎないように */
  height: 70vh; /* 画面高さの70% */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden; /* パララックス要素がはみ出さないように */
  position: relative; /* パララックス要素の基準 */

  h2 {
    font-size: 3rem; /* 大きなフォントサイズ */
    font-weight: 700; /* 太字 */
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7); /* 文字に影 */
    position: relative; /* パララックス要素 */
  }
  p {
    font-size: 1.2rem;
    margin-bottom: 0;
    position: relative; /* パララックス要素 */
  }
`;

interface ComplexDisplayCardProps {
  complex: Complex;
  scrollProgress: number; // スクロール進捗を受け取る
}

const ComplexDisplayCard: React.FC<ComplexDisplayCardProps> = ({
  complex,
  scrollProgress,
}) => {
  const { t } = useTranslation();
  const h2Ref = useRef<HTMLHeadingElement>(null);
  const pRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    // スクロール進捗に応じてパララックス効果を適用
    // カードがスクロールする速度よりも少し速く動かす (例: 1.2倍速)
    gsap.to(h2Ref.current, {
      y: scrollProgress * -0.2,
      ease: 'none',
      duration: 0,
    });
    gsap.to(pRef.current, {
      y: scrollProgress * -0.1,
      ease: 'none',
      duration: 0,
    });
  }, [scrollProgress]);

  return (
    <CardWrapper>
      <h2 ref={h2Ref}>{complex.content}</h2>
      <p ref={pRef}>
        <p>
          {t('categoryLabel')}: {complex.category}
        </p>
      </p>
    </CardWrapper>
  );
};

export default ComplexDisplayCard;
