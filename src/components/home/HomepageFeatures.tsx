import React from "react";
import clsx from "clsx";

import styles from "./HomepageFeatures.module.css";
import SectionHeader from "../common/SectionHeader";

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<"svg">>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: "Memory Systems Architecture",
    Svg: require("@site/static/img/home/memory-systems-architecture.svg").default,
    description: (
      <>
        Designing and developing compile- and run-time tools to promote efficient and
        high-performance computer systems.
      </>
    ),
  },
  {
    title: "Parallel and Distributed I/O",
    Svg: require("@site/static/img/home/parallel-distributed-io.svg").default,
    description: <>Performance evaluation and modeling of high performance computing systems.</>,
  },
  {
    title: "Resource Management",
    Svg: require("@site/static/img/home/resource-management.svg").default,
    description: (
      <>
        Performance optimization, including task scheduling and fast data access for high-end
        computing.
      </>
    ),
  },
  {
    title: "Reliability and Security",
    Svg: require("@site/static/img/home/reliability-security.svg").default,
    description: <>Enhancing reliability and security for parallel and distributed systems.</>,
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx("col col--3")}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md padding-top--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <SectionHeader>Our research covers various aspects of high-end computing:</SectionHeader>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
