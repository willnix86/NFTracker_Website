import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>NFTracker</title>
        <meta name="description" content="Track when your favorite artist drop NFTs" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          NFTracker
        </h1>

        <p className={styles.description}>
          Coming soon to Android and iOS
        </p>
      </main>

      <footer className={styles.footer}>
        <p>&copy; Jenix Technologies, 2021</p>
      </footer>
    </div>
  )
}

export default Home
