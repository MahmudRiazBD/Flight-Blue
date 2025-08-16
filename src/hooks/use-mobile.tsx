import * as React from "react"

const MOBILE_BREAKPOINT = 768

// This function now correctly handles server-side rendering and client-side hydration
// to prevent causing re-renders of parent components.
const getIsMobile = () => {
    if (typeof window === "undefined") {
        return false; // Default to false on the server
    }
    return window.innerWidth < MOBILE_BREAKPOINT;
}

export function useIsMobile() {
  // Lazily initialize state to prevent unnecessary re-renders on the server
  const [isMobile, setIsMobile] = React.useState(() => getIsMobile());

  React.useEffect(() => {
    const checkDevice = () => {
      setIsMobile(getIsMobile());
    }

    window.addEventListener("resize", checkDevice)
    
    // Cleanup listener
    return () => {
      window.removeEventListener("resize", checkDevice)
    }
  }, [])

  return isMobile
}
