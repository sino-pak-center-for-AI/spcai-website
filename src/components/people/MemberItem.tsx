import React from "react";
import clsx from "clsx";
import { Member } from "@site/src/types";

import Tag from "../common/Tag";
import styles from "./MemberItem.module.css";
import useMemberLinksRenderer from "./useMemberLinksRenderer";

type MemberItemProps = {
  member: Member;
};

export default function MemberItem({ member }: MemberItemProps) {
  const { renderLinks } = useMemberLinksRenderer();
  return (
    <div className="col col--4 padding-bottom--lg">
      <div className={styles.innerContainer}>
        <div className="padding-top--lg text--center">
          <img alt={member.name} className={styles.image} src={member.image} />
        </div>
        <div className="text--bold text--center">{member.name}</div>
        <div className="text--center">{member.title}</div>
        {member.affiliation && <div className="text--center">{member.affiliation}</div>}
        <div className="text--center">{renderLinks(member.links)}</div>
        <div
          className={clsx(
            "padding-horiz--md padding-bottom--lg padding-top--sm text--center text--italic",
            styles.researchInterests
          )}
        >
          {(member.researchInterests || []).map((researchInterest) => (
            <Tag className="margin-right--xs margin-bottom--xs" maxWidth={260}>
              {researchInterest}
            </Tag>
          ))}
        </div>
      </div>
    </div>
  );
}
