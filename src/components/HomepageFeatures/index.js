import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: '文件管理',
    emoji: '📁',
    description: (
      <>
        轻松管理 GitHub Release 中的资产文件，支持上传、下载、删除和更新操作。
        通过简单的命令行接口完成复杂的文件管理任务。
      </>
    ),
  },
  {
    title: '批量操作',
    emoji: '⚡',
    description: (
      <>
        支持通配符匹配和批量操作多个文件，自动化处理大量资产文件。
        完美适配 CI/CD 工作流，提升发布效率。
      </>
    ),
  },
  {
    title: '配置灵活',
    emoji: '🔧',
    description: (
      <>
        支持环境变量、配置文件和命令行参数配置，适应不同使用场景。
        自动重试机制确保操作可靠性，安全的 token 管理保护你的数据。
      </>
    ),
  },
];

import {useEffect, useRef, useState} from 'react';

function Feature({emoji, title, description, index}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {threshold: 0.2}
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className={clsx('col col--4')}
      style={{
        animationDelay: index !== undefined ? `${index * 0.2}s` : undefined
      }}
    >
      <div className={styles.featureCard}>
        <div className={styles.featureIcon}>
          <span className={styles.iconBg} aria-hidden="true"></span>
          <span className={styles.iconEmoji}>{emoji}</span>
        </div>
        <div className={styles.featureContent}>
          <Heading as="h3" className={styles.featureTitle}>{title}</Heading>
          <p className={styles.featureDescription}>{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="text--center margin-bottom--xl">
          <h2 className={styles.sectionTitle}>核心特性</h2>
          <p className={styles.sectionSubtitle}>强大而简洁的 GitHub Release 资产管理工具</p>
        </div>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} index={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
