import Link from "@docusaurus/Link";
import React from "react";
import { Project } from "@site/src/types";

import ProjectBadges from "./ProjectBadges";

type ProjectItemProps = {
  project: Project;
};

export default function ProjectItem({ project }: ProjectItemProps) {
  const { id, link, name, title, shortDescription } = project;
  return (
    <div className="col col--4 margin-bottom--lg">
      <div className="card text--center">
        <div className="card__header">
          <h3>{title}</h3>
          <ProjectBadges addMargin={false} projectId={id} />
        </div>
        <div className="card__body">
          <p>{shortDescription}</p>
        </div>
        <div className="card__footer">
          <Link className="button button--primary button--block" href={link}>
            Learn more about {name}
          </Link>
        </div>
      </div>
    </div>
  );
}
