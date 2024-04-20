import PublicationsTable from "../publications/PublicationsTable";
import React from "react";
import { ProjectId, PublicationTag } from "@site/src/types";
import { getProjectById } from "@site/src/data/projects";
import { getPublicationsByTag } from "@site/src/data/publications";

type ProjectPublicationsProps = {
  projectId: ProjectId;
};

export default function ProjectPublications({
  projectId,
}: ProjectPublicationsProps) {
  const { name } = getProjectById(projectId);
  const publications = getPublicationsByTag(name as PublicationTag);
  return (
    <PublicationsTable
      data={publications}
      isFooterVisible={false}
      isSearchInputVisible={false}
      isTagsColumnVisible={false}
    />
  );
}
