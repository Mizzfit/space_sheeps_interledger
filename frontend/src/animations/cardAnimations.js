import { gsap } from 'gsap';

export const animateCards = (cardRefs) => {
  const tl = gsap.timeline({ delay: 0.4 });

  tl.fromTo(
    cardRefs,
    {
      opacity: 0
    },
    {
      opacity: 1,
      duration: 1,
      stagger: 0.1,
      ease: 'power3.inOut'
    }
  );

  return tl;
};