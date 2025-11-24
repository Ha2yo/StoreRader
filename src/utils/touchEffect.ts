/**
 * File: utils/touchEffect.ts
 * Description:
 *   모바일 터치 시 버튼이 살짝 눌리는 것처럼 보이도록
 *   scale 효과를 적용한다
 */

export const touchEffect = {
    onTouchStart: (e: React.TouchEvent<HTMLButtonElement>) => {
        e.currentTarget.style.transform = "scale(0.97)";
        e.currentTarget.style.transition = "transform 0.1s ease";
    },
    onTouchEnd: (e: React.TouchEvent<HTMLButtonElement>) => {
        e.currentTarget.style.transform = "scale(1)";
    },
    onTouchCancel: (e: React.TouchEvent<HTMLButtonElement>) => {
        e.currentTarget.style.transform = "scale(1)";
    }
};
