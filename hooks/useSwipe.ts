import { useRef, useEffect, RefObject } from 'react';

interface SwipeInput {
  onSwipedLeft?: () => void;
  onSwipedRight?: () => void;
  targetRef: RefObject<HTMLElement>;
}

export const useSwipe = ({ onSwipedLeft, onSwipedRight, targetRef }: SwipeInput) => {
  const touchStartCoords = useRef<{ x: number, y: number } | null>(null);
  const touchEndCoords = useRef<{ x: number, y: number } | null>(null);

  const minSwipeDistance = 50;

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const onTouchStart = (e: TouchEvent) => {
      touchEndCoords.current = null;
      touchStartCoords.current = {
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY,
      };
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!touchStartCoords.current) return;
      touchEndCoords.current = {
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY,
      };
    };

    const onTouchEnd = () => {
      if (!touchStartCoords.current || !touchEndCoords.current) return;

      const xDistance = touchStartCoords.current.x - touchEndCoords.current.x;
      const yDistance = touchStartCoords.current.y - touchEndCoords.current.y;

      // Check if it's primarily a horizontal swipe
      if (Math.abs(xDistance) > Math.abs(yDistance)) {
        const isLeftSwipe = xDistance > minSwipeDistance;
        const isRightSwipe = xDistance < -minSwipeDistance;

        if (isLeftSwipe && onSwipedLeft) {
          onSwipedLeft();
        }
        if (isRightSwipe && onSwipedRight) {
          onSwipedRight();
        }
      }

      touchStartCoords.current = null;
      touchEndCoords.current = null;
    };

    target.addEventListener('touchstart', onTouchStart, { passive: true });
    target.addEventListener('touchmove', onTouchMove, { passive: true });
    target.addEventListener('touchend', onTouchEnd);

    return () => {
      target.removeEventListener('touchstart', onTouchStart);
      target.removeEventListener('touchmove', onTouchMove);
      target.removeEventListener('touchend', onTouchEnd);
    };
  }, [onSwipedLeft, onSwipedRight, targetRef]);
};
