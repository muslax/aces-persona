import { useState } from 'react'
import Head from 'next/head'

import { TOKEN } from 'config/constants'
import { API_ROUTES, ROUTES } from 'config/routes'
import fetchJson from 'lib/fetchJson'
import { generatePOSTData } from 'lib/utils'
import useUser from 'hooks/useUser'

import WebLayout from 'components/layout/WebLayout'

// emily M385HE EH583M

const Home = () => {
  const { mutateUser } = useUser()

  const [batch, setBatch] = useState(null)
  const [tokenStatus, setTokenStatus] = useState(null)

  const [token, setToken] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  async function handleToken(e) {
    e.preventDefault()
    setSubmitting(true)

    const resp = await fetchJson(API_ROUTES.Token, generatePOSTData({
      token: token,
    }))

    if (resp && resp.batch) {
      setBatch(resp.batch)
      setTokenStatus('')
      setSubmitting(false)
    } else {
      setTokenStatus(resp.status)
      setSubmitting(false)
    }
  }

  async function handleLogin(e) {
    e.preventDefault()
    setSubmitting(true)

    try {
      await mutateUser(
        fetchJson(API_ROUTES.Login, generatePOSTData({
          username: username,
          password: password,
          bid: batch._id,
          pid: batch.pid,
        }))
      )
    } catch (error) {
      setErrorMessage(error.data.message)
    }

    setSubmitting(false)
  }

  function isReady() {
    if (batch) return username.length > 3 && password.length > 3
    return token.length > 4
  }

  const inputStyle = `w-full rounded-none text-xl font-extrabold px-4 h-12
  border-2 border-gray-600 focus:outline-none focus:border-blue-500`

  return (
    <div className="max-w-sm mx-auto px-4 antialiased">
      <Head>
        <title>{
          batch ? 'ACES Login' : 'ACES Token'
        }</title>
      </Head>
      <div className="bg-gray--50 min-h-screen flex flex-col items-center justify-center">
        <div>
          <h1 className="text-4xl text-gray-700 font-extrabold mb--4">
            {batch ? 'Login' : 'Token'}
          </h1>

          <div className="h-2 bg-gray-400 my-2"></div>

          {submitting && <p className="text-xl sm:text-xl text-gray-500 font-bold">
            { batch
              ? 'Mengirim username & password...'
              : 'Memeriksa token...'
            }
          </p>}

          {!submitting && <>
            {!tokenStatus && !batch && <p className="text-xl text-gray-500 font-bold">
              Masukkan token untuk login.
            </p>}
            {batch !== null && !errorMessage && <p className="text-xl text-gray-500 font-bold">
              Masukkan username & password.
            </p>}
            {batch && errorMessage !== null && <p className="text-xl text-red-500 font-bold">
              {errorMessage}
            </p>}
            {tokenStatus == TOKEN.NOT_FOUND && <p className="text-xl text-red-500 font-bold">
              Token yang Anda masukkan salah.
            </p>}
            {tokenStatus == TOKEN.NOT_READY && <p className="text-xl text-green-600 font-bold">
              Token Anda belum siap dipakai.
            </p>}
            {tokenStatus == TOKEN.EXPIRED && <p className="text-xl text-red-500 font-bold">
              Maaf, token Anda kadaluwarsa.
            </p>}
          </>}

          <form
            className="my-6"
            onSubmit={batch ? handleLogin : handleToken}
          >
            {!batch &&
              <input
                type="text"
                required={true}
                autoFocus={true}
                value={token}
                onChange={e => setToken(e.target.value.toLowerCase())}
                placeholder=""
                autoCapitalize="false"
                autoComplete="false"
                autoCorrect="false"
                className={inputStyle}
              />
            }
            {batch && <>
              <input
                type="text"
                value={username}
                autoFocus={true}
                onChange={e => setUsername(e.target.value.toLowerCase())}
                required={true}
                placeholder="username"
                autoCapitalize="false"
                autoComplete="false"
                autoCorrect="false"
                className={`${inputStyle} mb-4`}
              />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required={true}
                placeholder="password"
                autoCapitalize="false"
                autoComplete="false"
                autoCorrect="false"
                className={inputStyle}
              />
            </>}
            <button
              disabled={!isReady()}
              type="submit"
              className={`w-full h-14 bg-gray-600 my-4 text-2xl text-white font-extrabold tracking-wide
              disabled:bg-gray-300 disabled:text-white`}
            >Submit</button>
          </form>
        </div>
        <p>abcabc emily EH583M</p>
      </div>
    </div>
  )
}

Home.suppressFirstRenderFlicker = true
Home.redirectAuthenticatedTo = ROUTES.Persona
// eslint-disable-next-line react/display-name
Home.getLayout = (page) => <WebLayout>{page}</WebLayout>

export default Home
