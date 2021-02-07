import { LocomotiveScrollOptions, Scroll } from 'locomotive-scroll'
import { createContext, DependencyList, MutableRefObject, useEffect, useRef, useState } from 'react'
import useResizeObserver from 'use-resize-observer'

export interface LocomotiveScrollContextValue {
  scroll: Scroll | null
  isReady: boolean
}

export const LocomotiveScrollContext = createContext<LocomotiveScrollContextValue>({
  scroll: null,
  isReady: false,
})

export interface LocomotiveScrollProviderProps {
  options: LocomotiveScrollOptions
  containerRef: MutableRefObject<HTMLDivElement | null>
  watch: DependencyList | undefined
}

export function LocomotiveScrollProvider({
  children,
  options,
  containerRef,
  watch,
}: WithChildren<LocomotiveScrollProviderProps>) {
  const { height } = useResizeObserver<HTMLDivElement>({ ref: containerRef })
  const [isReady, setIsReady] = useState(false)
  const LocomotiveScrollRef = useRef<Scroll | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const LocomotiveScroll = (await import('locomotive-scroll')).default

        const dataScrollContainer = document.querySelector('[data-scroll-container]')

        if (!dataScrollContainer) {
          console.warn(
            `react-locomotive-scroll: [data-scroll-container] dataset was not found. You likely forgot to add it which will prevent Locomotive Scroll to work.`
          )
        }

        LocomotiveScrollRef.current = new LocomotiveScroll({
          el: dataScrollContainer ?? undefined,
          ...options,
        })

        setIsReady(true) // Re-render the context
      } catch (error) {
        throw Error(`react-locomotive-scroll: ${error}`)
      }
    })()

    return () => {
      LocomotiveScrollRef.current?.destroy()
      setIsReady(false)
    }
  }, [])

  useEffect(
    () => {
      LocomotiveScrollRef.current?.update()
    },
    watch ? [...watch, height] : [height]
  )

  return (
    <LocomotiveScrollContext.Provider value={{ scroll: LocomotiveScrollRef.current, isReady }}>
      {children}
    </LocomotiveScrollContext.Provider>
  )
}

LocomotiveScrollContext.displayName = 'LocomotiveScrollContext'
LocomotiveScrollProvider.displayName = 'LocomotiveScrollProvider'
