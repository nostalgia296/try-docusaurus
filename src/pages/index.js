import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className="badges">
          <span className="badge badge-secondary">开源</span>
          <span className="badge badge-secondary">跨平台</span>
          <span className="badge badge-secondary">CI/CD 友好</span>
        </div>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            🚀 快速开始
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - GitHub Release 资产管理工具`}
      description="GitHub Release Manager - 管理 GitHub Release 资产文件的命令行工具，支持批量操作、通配符匹配、自动重试等功能">
      <HomepageHeader />
      <main>
        <div className="container">
          <HomepageFeatures />
        </div>
      </main>
    </Layout>
  );
}
