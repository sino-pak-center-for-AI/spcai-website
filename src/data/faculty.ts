import { Member } from "../types";

export default [
  {
    name: "Dr. Xian-He Sun",
    title: "Distinguished Professor",
    bio: "Dr. Xian-He Sun is the Director of the Gnosis Research Center and an IEEE fellow. He is a University Distinguished Professor and the Ron Hochsprung Endowed Chair of Computer Science at Illinois Institute of Technology. His current research interests include parallel and distributed processing, memory and I/O systems, software system for Big Data applications, and performance evaluation and optimization.",
    image: require("@site/static/img/faculty/sun.jpg").default,
    links: {
      email: "sun@iit.edu",
      scholar: "https://scholar.google.com/citations?user=9h3JX7MAAAAJ&hl=en",
      website: "https://www.cs.iit.edu/~scs/sun",
    },
  },
  {
    name: "Dr. Anthony Kougkas",
    title: "Research Assistant Professor",
    email: "akougkas@iit.edu",
    website: "",
    bio: "Dr. Anthony Kougkas is a Research Assistant Professor and the Deputy Director of the Gnosis Research Center, Illinois Institute of Technology. Holding a Ph.D. in Computer Science from the same institution, Anthony has dedicated his academic journey to addressing the challenges of I/O in modern supercomputers. With over nine years of leadership experience as a military officer, Anthony seamlessly transitioned to academia, where he now mentors and supervises graduate students, envisioning research directions and managing research grants. His current research focuses on optimizing I/O operations, enhancing storage infrastructures, and creating intelligent systems that adapt to the unique demands of HPC environments.",
    image: require("@site/static/img/faculty/kougkas.jpg").default,
    links: {
      email: "akougkas@iit.edu",
      linkedin: "https://www.linkedin.com/in/anthonykougkas/",
      scholar: "https://scholar.google.com/citations?user=hiNO0EEAAAAJ&hl=en",
      twitter: "https://twitter.com/kougkas",
      website: "https://akougkas.com/",
    },
  },
] as Member[];
