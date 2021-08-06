import Head from 'next/head';

import { ROUTES } from 'config/routes'
import useUser from 'hooks/useUser'

import UserLayout from 'components/layout/UserLayout'
import Persona from 'components/Persona';
import { connect } from 'lib/database';
import { ACES_DB, COLLECTION } from 'config/constants';

const PersonaPage = ({ modules }) => {
  const { user, isLoading, mutateUser } = useUser()

  if (!user || !user.isLoggedIn) return null

  return <>
    <Head>
      <title>Persona Page</title>
    </Head>
    <Persona modules={modules} user={user} mutateUser={mutateUser} />
  </>
}

PersonaPage.suppressFirstRenderFlicker = false;
PersonaPage.redirectUnAuthenticatedTo = ROUTES.Home;
// eslint-disable-next-line react/display-name
PersonaPage.getLayout = (page) => <UserLayout>{page}</UserLayout>

export default PersonaPage

export async function getStaticProps() {
  const { client } = await connect()
  const db = client.db(ACES_DB)
  const rs = await db.collection(COLLECTION.Modules).find({},
    { projection: {
      version: 1,
      domain: 1,
      method: 1,
      type: 1,
      title: 1,
      length: 1,
      maxTime: 1,
    }}
  ).toArray()

  /**
   * We provide modules as object with keys
   * representing each module's id
   */
  const modules = {}
  rs.forEach(m => {
    modules[m._id] = m
  })

  return {
    props: {
      modules,
    }
  }
}