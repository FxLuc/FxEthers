import { useEffect } from "react"

const BRAND_NAME = 'FxEthers'

/**
 * @use Set page title with brand name: BRAND_NAME - pageTitle
 */
const usePageTitle = (pageTitle) => {
  useEffect(() => {
    const prevTitle = document.title
    document.title = `${BRAND_NAME} - ${pageTitle}`
    return () => {
      document.title = prevTitle
    }
  })
}

export default usePageTitle
