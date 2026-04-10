import { useEffect, useState } from "react";

export function useDelayedUnmount(isVisible: boolean, delay: number) {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldRender(true);
    } else {
      const timeout = setTimeout(() => setShouldRender(false), delay);
      return () => clearTimeout(timeout);
    }
  }, [isVisible, delay]);

  return shouldRender;
}
