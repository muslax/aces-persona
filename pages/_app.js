import { SWRConfig } from 'swr'

import { pick } from 'lib/utils'
import WithAuthRedirect from 'components/WithAuthRedirect'
import fetchJson from 'lib/fetchJson'

import 'styles/globals.css'

function MyApp({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page => page))

  const authRedirect = pick(
    Component,
    'redirectAuthenticatedTo',
    'redirectUnAuthenticatedTo',
  )

  return (
    <SWRConfig
      value={{
        fetcher: fetchJson,
        onError: (err) => {
          console.log(err)
        }
      }}
    >
      <WithAuthRedirect {...authRedirect}>
        {getLayout(<Component {...pageProps} />)}
      </WithAuthRedirect>
    </SWRConfig>
  )
}

export default MyApp
