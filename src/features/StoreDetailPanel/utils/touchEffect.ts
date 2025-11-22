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
