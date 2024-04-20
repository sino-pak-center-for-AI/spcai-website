import React from "react";
import { Faculty } from "@site/src/types";

import FacultyItem from "./FacultyItem";

type FacultyListProps = {
  data: Faculty[];
};

export default function FacultyList({ data }: FacultyListProps) {
  return (
    <div className="row">
      {data.map((faculty) => (
        <FacultyItem faculty={faculty} key={faculty.name} />
      ))}
    </div>
  );
}
