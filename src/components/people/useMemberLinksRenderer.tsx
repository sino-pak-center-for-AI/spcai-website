import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MemberLinkType } from "@site/src/types";
import { faEnvelope, faGlobe, faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import { faGithub, faLinkedin, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { useCallback } from "react";

export default function useMemberLinksRenderer() {
  const renderLinks = useCallback((links: Record<MemberLinkType, string>) => {
    return Object.entries(links).map((link) => {
      const linkType = link[0] as MemberLinkType;
      const href = linkType === "email" ? `mailto:${link[1]}` : link[1];
      let icon = null;
      switch (linkType) {
        case "email":
          icon = faEnvelope;
          break;
        case "github":
          icon = faGithub;
          break;
        case "linkedin":
          icon = faLinkedin;
          break;
        case "scholar":
          icon = faGraduationCap;
          break;
        case "twitter":
          icon = faTwitter;
          break;
        case "website":
          icon = faGlobe;
          break;
        default:
          icon = null;
      }
      return (
        <a key={href} className="padding-horiz--sm" href={href}>
          {icon ? <FontAwesomeIcon icon={icon} /> : link[0]}
        </a>
      );
    });
  }, []);
  return { renderLinks };
}
